#!/usr/bin/env python3
"""
tklamp_live.py - live logger for a TKLamp TK2303D integrating-sphere tester (Mac, Windows, Linux).

It reads the tester's own live stream (about 4.5 readings a second), shows the lumens on screen, and records a run with the
computer's clock, so the start and end times are exact. When you stop, you can rename the run and upload it straight to
Runtime on hCRI.io (and make a share link).

Setup (once):    pip install pyserial
Run:             python tklamp_live.py                  (finds the tester's port by itself)
                 python tklamp_live.py --port COM5      (or /dev/tty.usbserial-xxxx, /dev/ttyUSB0)

While it runs:   the live number shows at once. Press Enter to START recording, Enter again to STOP.
                 (Ctrl+C also stops, and keeps what was recorded.)

hCRI.io upload:  python tklamp_live.py --login                              (once: sign in, a token is created and remembered in ~/.hcri_tklamp.json)
                 or  --token YOUR_TOKEN --save-token  with a token made on the website
                 or set the HCRI_TOKEN environment variable. The token is the same API token hCRI Companion uses.
Other uses:      --calibrate 2150          put a lamp of known lumens in the sphere: sets and saves the scale
                 --duration 30             stop by itself after 30 minutes
                 --upload run.json         upload a run saved earlier
                 --simulate                no tester needed: makes a fading test light (for trying the script)

Lumens = raw count / scale. The default scale, 313.2 counts per lumen, was measured on one calibrated tester; --calibrate sets
it for yours (the same idea as "Set scale" in hCRI Companion). A recalibrated tester needs it done again.
"""

import argparse
import datetime
import getpass
import json
import math
import os
import platform
import stat
import sys
import time
import urllib.error
import urllib.request

DEFAULT_SITE = "https://hcri.io"
DEFAULT_SCALE = 313.2            # counts per lumen
CONFIG_PATH = os.path.join(os.path.expanduser("~"), ".hcri_tklamp.json")
MAX_POINTS = 100000              # hCRI.io's limit per curve
FRAME_HEAD = bytes([0xA5, 0x0A, 0xAF, 0xA5, 0x09, 0xAE, 0x5A, 0x5A, 0x09, 0x04, 0x00])
FRAME_LEN = 15                   # 11 header bytes + 3 value bytes + 1 checksum
TS = "%Y-%m-%d %H:%M:%S"


# ----------------------------------------------------------------------------------------------------------------------
# Settings kept between runs (scale, token)
# ----------------------------------------------------------------------------------------------------------------------

def load_config():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def save_config(cfg):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    try:
        os.chmod(CONFIG_PATH, stat.S_IRUSR | stat.S_IWUSR)   # the token is private (no effect on Windows)
    except OSError:
        pass


# ----------------------------------------------------------------------------------------------------------------------
# The tester's stream
# ----------------------------------------------------------------------------------------------------------------------

class FrameReader:
    """Pulls (raw_count) values out of the tester's byte stream: syncs on the header and checks the checksum."""

    def __init__(self):
        self.buf = bytearray()

    def feed(self, data):
        self.buf.extend(data)
        out = []
        while True:
            i = self.buf.find(FRAME_HEAD)
            if i < 0:
                del self.buf[:max(0, len(self.buf) - len(FRAME_HEAD) + 1)]   # keep a possible partial header
                break
            if i > 0:
                del self.buf[:i]
            if len(self.buf) < FRAME_LEN:
                break
            v2, v1, v0, cs = self.buf[11], self.buf[12], self.buf[13], self.buf[14]
            if ((v2 + v1 + v0 - 0x3F) & 0xFF) == cs:
                out.append((v2 << 16) | (v1 << 8) | v0)
                del self.buf[:FRAME_LEN]
            else:
                del self.buf[:1]          # bad frame: look for the next header
        return out


def make_frame(raw):
    v2, v1, v0 = (raw >> 16) & 255, (raw >> 8) & 255, raw & 255
    return FRAME_HEAD + bytes([v2, v1, v0, (v2 + v1 + v0 - 0x3F) & 0xFF])


class SimPort:
    """Stands in for the tester: a light that slowly fades, 4.5 readings a second."""

    def __init__(self, scale):
        self.scale = scale
        self.t0 = time.monotonic()
        self.sent = 0

    def read(self, n):
        due = int((time.monotonic() - self.t0) * 4.5) - self.sent
        if due <= 0:
            time.sleep(0.05)
            return b""
        out = bytearray()
        for _ in range(min(due, 20)):
            t = self.sent / 4.5
            lm = 2150 * (0.55 + 0.45 * math.exp(-t / 120.0)) + (self.sent % 7 - 3) * 0.4
            out += make_frame(int(round(lm * self.scale / 60.0)) * 60)   # the real raw counts are multiples of 60
            self.sent += 1
        return bytes(out)

    def close(self):
        pass


def find_port(serial_mod):
    """The tester shows up as a CH340 USB serial device (vendor id 1A86)."""
    from serial.tools import list_ports
    ports = list(list_ports.comports())
    ch = [p for p in ports if p.vid == 0x1A86]
    if len(ch) == 1:
        return ch[0].device
    cands = ch or ports
    if not cands:
        sys.exit("No serial ports found. Plug the tester's USB cable in (on Windows it may need the CH340 driver), or give --port.")
    print("Which port is the tester?")
    for i, p in enumerate(cands, 1):
        print(f"  {i}) {p.device}   {p.description}")
    while True:
        a = input("Number: ").strip()
        if a.isdigit() and 1 <= int(a) <= len(cands):
            return cands[int(a) - 1].device


def open_port(args, scale):
    if args.simulate:
        print("SIMULATION: no tester, a made-up fading light.")
        return SimPort(scale)
    try:
        import serial
    except ImportError:
        sys.exit("This needs pyserial:  pip install pyserial")
    port = args.port or find_port(serial)
    try:
        ser = serial.Serial(port, 9600, timeout=0.3)
    except serial.SerialException as e:
        sys.exit(f"Could not open {port}: {e}")
    ser.setDTR(True)
    ser.reset_input_buffer()
    print(f"Reading the tester on {port}.")
    return ser


# ----------------------------------------------------------------------------------------------------------------------
# Run processing (same rules as hCRI Companion)
# ----------------------------------------------------------------------------------------------------------------------

def resample(points):
    """points = [(seconds, lumens)]. 1 s bins (wider if the run is very long); an empty bin repeats the last value."""
    if len(points) < 2:
        return None
    dur = points[-1][0]
    step = 1 if dur <= MAX_POINTS - 1 else math.ceil(dur / (MAX_POINTS - 1))
    bins = int(dur // step) + 1
    if bins < 2:
        return None
    sums, cnts = [0.0] * bins, [0] * bins
    for t, lm in points:
        b = min(bins - 1, int(t // step))
        sums[b] += lm
        cnts[b] += 1
    vals, last = [], 0.0
    for i in range(bins):
        if cnts[i]:
            last = sums[i] / cnts[i]
        vals.append(round(last, 1))
    return step, vals


def trim_leading(vals, step, fraction=0.02, keep_s=1):
    """Drops the dark start (before the light came on): everything before the output first reaches 2% of the peak."""
    if len(vals) < 2:
        return vals, 0
    peak = max(vals)
    if peak <= 0:
        return vals, 0
    first = next((i for i, v in enumerate(vals) if v >= peak * fraction), 0)
    start = max(0, first - int(math.ceil(keep_s / step)))
    if start <= 0 or len(vals) - start < 2:
        return vals, 0
    return vals[start:], start


def fmt_clock(s):
    s = int(s)
    return f"{s // 3600:d}:{(s % 3600) // 60:02d}:{s % 60:02d}"


# ----------------------------------------------------------------------------------------------------------------------
# Live loop
# ----------------------------------------------------------------------------------------------------------------------

def enter_pressed():
    """True if Enter was pressed since the last call. Polls instead of using a reader thread, so it never swallows
    the answers typed to the questions after the run."""
    try:
        if os.name == "nt":
            import msvcrt
            hit = False
            while msvcrt.kbhit():
                if msvcrt.getwch() in ("\r", "\n"):
                    hit = True
            return hit
        import select
        if select.select([sys.stdin], [], [], 0)[0]:
            return sys.stdin.readline() != ""
    except Exception:
        pass
    return False


def live(ser, scale, duration_min, spool_path):
    """Shows live lumens. Enter starts, Enter stops. Returns (points, started_wall, ended_wall) or None."""
    reader = FrameReader()
    recent = []
    recording = False
    pts = []
    t_start_mono = None
    started_wall = None
    last_rx = time.monotonic()
    last_draw = 0.0
    last_flush = 0.0
    spool = None
    print("\nLive reading. Press Enter to START recording; Enter again to STOP. (Ctrl+C also stops.)\n")
    try:
        while True:
            data = ser.read(256)
            now = time.monotonic()
            for raw in reader.feed(data) if data else []:
                lm = raw / scale
                recent.append(lm)
                if len(recent) > 5:
                    recent.pop(0)
                last_rx = now
                if recording:
                    pts.append((now - t_start_mono, lm))
            if enter_pressed():
                if not recording:
                    if not recent or now - last_rx > 5:
                        print("\nNo readings yet: check the tester is on and its cable is in. Not started.")
                    else:
                        recording = True
                        t_start_mono = now
                        started_wall = datetime.datetime.now()
                        spool = open(spool_path, "w", encoding="utf-8")
                        spool.write("seconds,lumens\n")
                        print(f"\nRecording from {started_wall.strftime(TS)}. Press Enter to stop.\n")
                else:
                    return pts, started_wall, datetime.datetime.now(), spool
            if recording and spool and pts and now - last_flush > 2:    # a crash keeps what was recorded so far
                spool.write("".join(f"{t:.3f},{v:.2f}\n" for t, v in pts[spool_written[0]:]))
                spool_written[0] = len(pts)
                spool.flush()
                last_flush = now
            if recording and duration_min and now - t_start_mono >= duration_min * 60:
                print(f"\n{duration_min:g} minutes reached.")
                return pts, started_wall, datetime.datetime.now(), spool
            if now - last_draw > 0.25:
                last_draw = now
                if recent and now - last_rx <= 5:
                    avg = sum(recent) / len(recent)
                    line = f"  {avg:9.1f} lm"
                else:
                    line = "  no readings (tester on? cable in?)"
                if recording:
                    line += f"    REC {fmt_clock(now - t_start_mono)}   {len(pts)} readings"
                sys.stdout.write("\r" + line.ljust(70))
                sys.stdout.flush()
    except KeyboardInterrupt:
        print("\nStopped.")
        if recording:
            return pts, started_wall, datetime.datetime.now(), spool
        return None


spool_written = [0]


# ----------------------------------------------------------------------------------------------------------------------
# hCRI.io upload
# ----------------------------------------------------------------------------------------------------------------------

def api(site, token, method, path, body=None):
    url = site.rstrip("/") + "/index.php/api" + path
    data = json.dumps(body).encode("utf-8") if body is not None else (b"{}" if method == "POST" else None)
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + token)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode("utf-8")).get("error", "")
        except Exception:
            msg = ""
        raise RuntimeError(f"hCRI.io said {e.code}: {msg or e.reason}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Could not reach hCRI.io: {e.reason}")


def raw_post(site, path, body, token=None):
    """POST JSON without the saved token (used by sign-in)."""
    url = site.rstrip("/") + "/index.php/api" + path
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode("utf-8")).get("error", "")
        except Exception:
            msg = ""
        raise RuntimeError(msg or f"hCRI.io said {e.code}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Could not reach hCRI.io: {e.reason}")


def login(site, cfg):
    """Sign in with your hCRI.io email/username and password, create an API token and save it.
    The password is only sent to hCRI.io, once; it is never saved or printed."""
    print(f"Sign in to {site} to create an API token (same as hCRI Companion's Settings).")
    who = ask("hCRI.io email or username", cfg.get("user", "")).strip()
    pw = getpass.getpass("Password (not shown): ")
    if not who or not pw:
        raise RuntimeError("Email/username and password are both needed.")
    r = raw_post(site, "/auth/login", {"email": who, "password": pw})
    session = r.get("token")
    if not session:
        raise RuntimeError("Sign-in worked but no session came back.")
    name = f"TKLamp logger ({platform.node() or platform.system()})"[:60]
    t = raw_post(site, "/tokens", {"name": name}, token=session)
    tok = t.get("token")
    if not tok:
        raise RuntimeError("The token was created but its value did not come back.")
    cfg["token"] = tok
    cfg["site"] = site
    cfg["user"] = (r.get("user") or {}).get("name") or (r.get("user") or {}).get("email") or who
    save_config(cfg)
    print(f"Signed in as {cfg['user']}. Token '{name}' saved in {CONFIG_PATH}. "
          "You can delete it any time from your hCRI.io account settings.")
    return tok


def upload(site, token, label, step, vals):
    r = api(site, token, "POST", "/v1/runtime", {"items": [{"label": label, "group": "TKLamp", "unit": "lm",
                                                           "intervalSeconds": step, "values": vals}]})
    if r.get("skipped"):
        raise RuntimeError("hCRI.io skipped it: " + "; ".join(s.get("reason", "?") for s in r["skipped"]))
    return r


def share_link(site, token, label):
    """Finds the curve by its label and makes (or reuses) its share link."""
    items = api(site, token, "GET", "/v1/runtime").get("items", [])
    cid = next((i["id"] for i in items if i.get("label") == label), None)
    if not cid:
        raise RuntimeError("could not find the uploaded light to share")
    tok = api(site, token, "POST", "/v1/runtime?share=" + cid).get("shareToken")
    return f"{site.rstrip('/')}/?runtime={tok}"


def ask(prompt, default=""):
    a = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
    return a or default


def yes(prompt, default=True):
    a = input(f"{prompt} [{'Y/n' if default else 'y/N'}]: ").strip().lower()
    return default if not a else a.startswith("y")


def finish(args, cfg, label, step, vals, meta, base):
    """Rename, save and upload."""
    label = ask("Name for this run", label)[:160]
    meta["label"] = label
    json_path = base + ".json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({"label": label, "intervalSeconds": step, "unit": "lm", "values": vals, "meta": meta}, f)
    with open(base + ".csv", "w", encoding="utf-8") as f:   # an hCRI.io "Upload CSV" file as it stands: minutes, then the light
        f.write("minutes," + label.replace(",", " ") + "\n")
        for i, v in enumerate(vals):
            f.write(f"{round(i * step / 60.0, 4)},{v}\n")
    print(f"Saved {json_path} and {base}.csv")
    token = args.token or os.environ.get("HCRI_TOKEN") or cfg.get("token")
    site = args.site or cfg.get("site") or DEFAULT_SITE
    if not token:
        if sys.stdin.isatty() and yes("Not signed in to hCRI.io. Sign in now to upload?", default=True):
            try:
                token = login(site, cfg)
            except RuntimeError as e:
                print("Sign-in failed:", e)
        if not token:
            print(f"Not uploaded. Later:  python {os.path.basename(sys.argv[0])} --login   then   --upload {json_path}\n"
                  "(or upload the .csv on the website's Runtime page).")
            return
    if not yes(f"Upload to Runtime on {site}?"):
        print(f"Not uploaded. Later:  python {os.path.basename(sys.argv[0])} --upload {json_path}")
        return
    try:
        upload(site, token, label, step, vals)
        print("Uploaded. It is in your Runtime list on hCRI.io (Explore > Runtime). Same name replaces an earlier run.")
        if yes("Make a share link?", default=False):
            print("Share link:", share_link(site, token, label))
    except RuntimeError as e:
        print("Upload failed:", e)
        print(f"Your run is saved. Try again later:  python {os.path.basename(sys.argv[0])} --upload {json_path}")


# ----------------------------------------------------------------------------------------------------------------------

def calibrate(ser, scale, known, cfg):
    print(f"Put the {known:g} lm lamp in the sphere and leave it steady. Reading for 8 seconds...")
    reader, vals, end = FrameReader(), [], time.monotonic() + 8
    while time.monotonic() < end:
        data = ser.read(256)
        vals += [r for r in reader.feed(data)] if data else []
    if len(vals) < 5:
        sys.exit("No readings from the tester.")
    avg_raw = sum(vals) / len(vals)
    new = round(avg_raw / known, 1)
    print(f"Average raw count {avg_raw:.0f}. Scale was {scale}, now {new} counts per lumen (the lamp reads {avg_raw / new:.0f} lm).")
    if yes("Save this scale?"):
        cfg["scale"] = new
        save_config(cfg)
        print("Saved.")


def main():
    ap = argparse.ArgumentParser(description="Live logger for a TKLamp TK2303D tester, with upload to hCRI.io Runtime.")
    ap.add_argument("--port", help="Serial port (COM5, /dev/tty.usbserial-..., /dev/ttyUSB0). Default: find it.")
    ap.add_argument("--scale", type=float, help=f"Counts per lumen (default {DEFAULT_SCALE}, or the saved one)")
    ap.add_argument("--calibrate", type=float, metavar="LUMENS", help="Set the scale from a lamp of this known output")
    ap.add_argument("--duration", type=float, metavar="MIN", help="Stop by itself after this many minutes")
    ap.add_argument("--no-trim", action="store_true", help="Keep the dark start of the run (default: trimmed)")
    ap.add_argument("--output-dir", default=".", help="Where to save runs (default: here)")
    ap.add_argument("--token", help="hCRI.io API token")
    ap.add_argument("--save-token", action="store_true", help="Remember --token (and --site) in ~/.hcri_tklamp.json")
    ap.add_argument("--login", action="store_true", help="Sign in with your hCRI.io email/username and password to create and save a token")
    ap.add_argument("--site", help=f"hCRI.io address (default {DEFAULT_SITE})")
    ap.add_argument("--upload", metavar="FILE.json", help="Upload a run saved earlier, then exit")
    ap.add_argument("--simulate", action="store_true", help="No tester: a made-up fading light, to try the script")
    args = ap.parse_args()

    cfg = load_config()
    if args.save_token:
        if not args.token:
            sys.exit("--save-token needs --token YOUR_TOKEN")
        cfg["token"] = args.token
        if args.site:
            cfg["site"] = args.site
        save_config(cfg)
        print(f"Token saved in {CONFIG_PATH}.")
    if args.login:
        site = args.site or cfg.get("site") or DEFAULT_SITE
        try:
            login(site, cfg)
        except RuntimeError as e:
            sys.exit("Sign-in failed: " + str(e))
        if not (args.upload or args.simulate or args.calibrate or args.port):
            return
    scale = args.scale or cfg.get("scale") or DEFAULT_SCALE

    if args.upload:
        with open(args.upload, "r", encoding="utf-8") as f:
            run = json.load(f)
        finish(args, cfg, run["label"], run["intervalSeconds"], run["values"], run.get("meta", {}), os.path.splitext(args.upload)[0])
        return

    ser = open_port(args, scale)
    try:
        if args.calibrate:
            calibrate(ser, scale, args.calibrate, cfg)
            return
        os.makedirs(args.output_dir, exist_ok=True)
        stamp = datetime.datetime.now().strftime("%Y-%m-%d-%H.%M.%S")
        spool_path = os.path.join(args.output_dir, f"TKLamp_{stamp}.partial.csv")
        spool_written[0] = 0
        res = live(ser, scale, args.duration, spool_path)
    finally:
        ser.close()
    if not res:
        print("Nothing recorded.")
        return
    pts, started, ended, spool = res
    if spool:
        spool.close()
    out = resample(pts)
    if not out:
        print("The recording was too short to keep (needs at least 2 seconds of readings).")
        return
    step, vals = out
    trimmed = 0
    if not args.no_trim:
        vals, trimmed = trim_leading(vals, step)
        if trimmed:
            started = started + datetime.timedelta(seconds=trimmed * step)
    dur = (len(vals) - 1) * step
    print(f"\nRun: {fmt_clock(dur)} long, {len(pts)} readings, {vals[0]:.0f} -> {vals[-1]:.0f} lm"
          + (f"  (dark start trimmed: {trimmed * step:g} s)" if trimmed else ""))
    print(f"Started {started.strftime(TS)}   Ended {ended.strftime(TS)}")
    meta = {"started": started.strftime(TS), "ended": ended.strftime(TS), "durationSeconds": dur, "readings": len(pts),
            "countsPerLumen": scale, "trimmedLeadingSeconds": trimmed * step, "source": "tklamp_live.py"}
    label = f"TKLamp run {started.strftime('%Y-%m-%d %H:%M')}"
    base = os.path.join(args.output_dir, f"TKLamp_{stamp}")
    try:
        os.remove(spool_path)           # the finished run supersedes the crash-safety copy
    except OSError:
        pass
    finish(args, cfg, label, step, vals, meta, base)


if __name__ == "__main__":
    main()
