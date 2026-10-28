#!/usr/bin/env python3
"""
tklamp_live.py - live logger for a TKLamp TK2303D integrating-sphere tester (Mac, Windows, Linux).

It reads the tester's own live stream (about 4.5 readings a second), shows the lumens on screen, and records a run with the
computer's clock, so the start and end times are exact. When you stop, you can rename the run and upload it straight to
Runtime on hCRI.io (and make a share link).

Setup (once):    pip install pyserial
Run:             python tklamp_live.py                  (opens the window: live chart, Start/Stop, calibrate, history,
                                                         rename, upload and share)
                 python tklamp_live.py --cli            (the same in the terminal)
                 python tklamp_live.py --port COM5      (or /dev/tty.usbserial-xxxx, /dev/ttyUSB0)

In the terminal: the live number shows at once, with a line of time and lumens each second while recording
                 (--no-readout turns that off). Press Enter to START recording, Enter again to STOP.
                 (Ctrl+C also stops, and keeps what was recorded.)

hCRI.io upload:  python tklamp_live.py --login                              (once: sign in, a token is created and remembered in ~/.hcri_tklamp.json)
                 or  --token YOUR_TOKEN --save-token  with a token made on the website
                 or set the HCRI_TOKEN environment variable. The token is the same API token hCRI Companion uses.
Run limits:      --start-at 100            wait until the light reaches 100 lm, then start recording
                 --stop-below 50           stop when the output stays below 50 lm (only after it has been above it)
                 --duration 30             stop after 30 minutes
                 --idle-timeout 5          stop when no reading has arrived for 5 minutes (default 5; 0 = off)
                 --save-settings           remember these for next time (the window remembers them by itself)
Other uses:      --calibrate 2150          put a lamp of known lumens in the sphere: sets and saves the scale
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
import ssl
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


def list_serial_ports():
    """Serial ports. On a Mac every device appears twice (cu.* and tty.*); only the cu.* one is kept."""
    from serial.tools import list_ports
    ports = list(list_ports.comports())
    if sys.platform == "darwin":
        cu = {p.device[len("/dev/cu."):] for p in ports if p.device.startswith("/dev/cu.")}
        ports = [p for p in ports if not (p.device.startswith("/dev/tty.") and p.device[len("/dev/tty."):] in cu)]
    return ports


def driver_hint():
    """What to try when the tester does not show up as a serial port."""
    if sys.platform.startswith("win"):
        return ("No tester found. Plug it in and switch it on. If it still does not appear (check Device Manager > Ports), "
                "install the free CH340 driver from wch-ic.com (CH341SER) and plug it in again.")
    if sys.platform == "darwin":
        return ("No tester found. Plug it in and switch it on. Recent macOS has the CH340 driver built in; on an older Mac "
                "install the CH340 driver from wch-ic.com, then plug it in again.")
    return ("No tester found. Plug it in and switch it on. On Linux you may need to be in the 'dialout' group "
            "(sudo usermod -aG dialout $USER, then log in again).")


def tk_warning():
    """A message if this Python's Tk is too old or missing, else None."""
    if tk is None:
        return None
    if tk.TkVersion >= 8.6:
        return None
    if sys.platform == "darwin":
        return (f"This Python uses an old Tk ({tk.TkVersion}), which can make the window look wrong or draw badly on a Mac "
                "(it is the one that comes with Apple's tools). For the best result install Python from python.org and run "
                "the script with that.")
    if sys.platform.startswith("win"):
        return (f"This Python uses an old Tk ({tk.TkVersion}), so the window may look rough. Install the current Python "
                "from python.org (tick 'tcl/tk and IDLE' in the installer) for the best result.")
    return f"This Python uses an old Tk ({tk.TkVersion}), so the window may look rough. Install a newer python3-tk."


def find_port(serial_mod):
    """The tester shows up as a CH340 USB serial device (vendor id 1A86)."""
    ports = list_serial_ports()
    ch = [p for p in ports if p.vid == 0x1A86]
    if len(ch) == 1:
        return ch[0].device
    cands = ch or ports
    if not cands:
        sys.exit(driver_hint() + " Or give --port.")
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
# Run limits: start at a level, stop below a level, stop after a time, stop when readings stop (same rules as the apps)
# ----------------------------------------------------------------------------------------------------------------------

STOP_BELOW_HOLD_S = 3          # the output must stay below the stop level this long
DEFAULT_IDLE_MIN = 5


def num_or_none(v):
    """A limit box's text (or a saved value) as a number of at least 0; blank or invalid means off (None)."""
    try:
        if v is None or str(v).strip() == "":
            return None
        n = float(str(v).strip().replace(",", "."))
        return n if n >= 0 and n == n else None
    except ValueError:
        return None


def limits_from_cfg(cfg):
    lim = cfg.get("limits") or {}
    idle = lim.get("idle_min", DEFAULT_IDLE_MIN)
    idle = num_or_none(idle)
    return {"start_at": num_or_none(lim.get("start_at")), "stop_below": num_or_none(lim.get("stop_below")),
            "duration": num_or_none(lim.get("duration")), "idle_min": DEFAULT_IDLE_MIN if "idle_min" not in lim else (idle or 0)}


class RunGuard:
    """Decides when a run starts and stops by itself. The stop level only counts once the output has been above it, then it
    must stay below for STOP_BELOW_HOLD_S seconds. Time limit and no-readings timeout are checked with on_timer."""

    def __init__(self, limits):
        self.limits = limits
        self.reset()

    def reset(self):
        self.seen_above = False
        self.below_since = None

    def should_start(self, avg):
        a = self.limits.get("start_at")
        return a is None or avg >= a

    def on_reading(self, avg, t):
        b = self.limits.get("stop_below")
        if not b or b <= 0:
            return None
        if avg >= b:
            self.seen_above = True
            self.below_since = None
            return None
        if not self.seen_above:
            return None
        if self.below_since is None:
            self.below_since = t
        if t - self.below_since >= STOP_BELOW_HOLD_S:
            return f"the output fell below {b:g} lm"
        return None

    def on_timer(self, rec_seconds, silent_seconds):
        d = self.limits.get("duration")
        if d and d > 0 and rec_seconds >= d * 60:
            return f"the {d:g} minute time limit was reached"
        i = self.limits.get("idle_min")
        if i and i > 0 and silent_seconds >= i * 60:
            return f"no readings for {i:g} minute{'' if i == 1 else 's'}"
        return None


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


def live(ser, scale, limits, spool_path, readout=True):
    """Shows live lumens. Enter starts (or waits for the start level), Enter stops. Returns
    (points, started_wall, ended_wall, spool, reason) or None."""
    reader = FrameReader()
    guard = RunGuard(limits)
    recent = []
    recording = False
    armed = False
    pts = []
    t_start_mono = None
    started_wall = None
    last_rx = time.monotonic()
    last_rx_wall = datetime.datetime.now()
    last_draw = 0.0
    last_flush = 0.0
    last_row = 0.0
    spool = None
    st = {"spool": None}

    def avg_now():
        return sum(recent) / len(recent) if recent else 0.0

    def begin(now):
        nonlocal recording, armed, t_start_mono, started_wall, spool
        recording, armed = True, False
        guard.reset()
        t_start_mono = now
        started_wall = datetime.datetime.now()
        spool = open(spool_path, "w", encoding="utf-8")
        spool.write("seconds,lumens\n")
        spool_written[0] = 0
        print(f"\nRecording from {started_wall.strftime(TS)}. Press Enter to stop.\n")
        if readout:
            print("  clock       elapsed       lumens")

    def finish_rec(reason=None, ended=None):
        return pts, started_wall, ended or datetime.datetime.now(), spool, reason

    notes = []
    if limits.get("start_at") is not None:
        notes.append(f"start at {limits['start_at']:g} lm")
    if limits.get("stop_below") is not None:
        notes.append(f"stop below {limits['stop_below']:g} lm")
    if limits.get("duration"):
        notes.append(f"stop after {limits['duration']:g} min")
    if limits.get("idle_min"):
        notes.append(f"stop after {limits['idle_min']:g} min with no readings")
    print("\nLive reading. Press Enter to START recording; Enter again to STOP. (Ctrl+C also stops.)")
    if notes:
        print("Limits: " + ", ".join(notes) + ".")
    print()
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
                last_rx_wall = datetime.datetime.now()
                if armed and guard.should_start(avg_now()):
                    begin(now)
                if recording:
                    pts.append((now - t_start_mono, lm))
                    why = guard.on_reading(avg_now(), now - t_start_mono)
                    if why:
                        print(f"\nStopped: {why}.")
                        return finish_rec(why)
            if enter_pressed():
                if recording:
                    return finish_rec()
                if armed:
                    armed = False
                    print("\nStopped waiting for the start level.")
                elif not recent or now - last_rx > 5:
                    print("\nNo readings yet: check the tester is on and its cable is in. Not started.")
                elif not guard.should_start(avg_now()):
                    armed = True
                    print(f"\nWaiting for the light to reach {limits['start_at']:g} lm to start recording. Enter cancels.")
                else:
                    begin(now)
            if recording and spool and pts and now - last_flush > 2:    # a crash keeps what was recorded so far
                spool.write("".join(f"{t:.3f},{v:.2f}\n" for t, v in pts[spool_written[0]:]))
                spool_written[0] = len(pts)
                spool.flush()
                last_flush = now
            if recording:
                why = guard.on_timer(pts[-1][0] if pts else 0.0, now - last_rx)
                if why:
                    print(f"\nStopped: {why}.")
                    return finish_rec(why, ended=last_rx_wall if "no readings" in why else None)
            if recording and readout and recent and now - last_row >= 1.0:     # one line of time and value each second
                last_row = now
                sys.stdout.write("\r" + f"  {datetime.datetime.now():%H:%M:%S}  {fmt_clock(now - t_start_mono):>10}  "
                                 f"{avg_now():9.1f} lm".ljust(70) + "\n")
            if now - last_draw > 0.25:
                last_draw = now
                if recent and now - last_rx <= 5:
                    line = f"  {avg_now():9.1f} lm"
                else:
                    line = "  no readings (tester on? cable in?)"
                if armed:
                    line += f"    waiting for {limits['start_at']:g} lm"
                if recording:
                    line += f"    REC {fmt_clock(now - t_start_mono)}   {len(pts)} readings"
                sys.stdout.write("\r" + line.ljust(70))
                sys.stdout.flush()
    except KeyboardInterrupt:
        print("\nStopped.")
        if recording:
            return finish_rec()
        return None


spool_written = [0]


# ----------------------------------------------------------------------------------------------------------------------
# hCRI.io upload
# ----------------------------------------------------------------------------------------------------------------------

_SSL = []


def ssl_context():
    """A verifying SSL context that also works with Python from python.org on a Mac, which ships without root
    certificates until 'Install Certificates.command' is run. Order: Python's own, then certifi, then (Mac) the system's."""
    if _SSL:
        return _SSL[0]
    ctx = ssl.create_default_context()
    if ctx.cert_store_stats().get("x509_ca", 0) == 0:
        try:
            import certifi
            ctx.load_verify_locations(certifi.where())
        except Exception:
            pass
    if ctx.cert_store_stats().get("x509_ca", 0) == 0 and sys.platform == "darwin":
        try:
            import subprocess
            pem = subprocess.run(["security", "find-certificate", "-a", "-p",
                                  "/System/Library/Keychains/SystemRootCertificates.keychain"],
                                 capture_output=True, text=True, timeout=30).stdout
            if pem.strip():
                ctx.load_verify_locations(cadata=pem)
        except Exception:
            pass
    _SSL.append(ctx)
    return ctx


def net_error(e):
    r = getattr(e, "reason", e)
    if isinstance(r, ssl.SSLError) or "CERTIFICATE_VERIFY_FAILED" in str(r):
        return ("Could not verify hCRI.io's certificate. On a Mac with Python from python.org, open the Python folder in "
                "Applications and double-click 'Install Certificates.command', then try again. (" + str(r) + ")")
    return f"Could not reach hCRI.io: {r}"


def api(site, token, method, path, body=None):
    url = site.rstrip("/") + "/index.php/api" + path
    data = json.dumps(body).encode("utf-8") if body is not None else (b"{}" if method == "POST" else None)
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + token)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60, context=ssl_context()) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode("utf-8")).get("error", "")
        except Exception:
            msg = ""
        raise RuntimeError(f"hCRI.io said {e.code}: {msg or e.reason}")
    except urllib.error.URLError as e:
        raise RuntimeError(net_error(e))


def raw_post(site, path, body, token=None):
    """POST JSON without the saved token (used by sign-in)."""
    url = site.rstrip("/") + "/index.php/api" + path
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST")
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=60, context=ssl_context()) as r:
            return json.loads(r.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read().decode("utf-8")).get("error", "")
        except Exception:
            msg = ""
        raise RuntimeError(msg or f"hCRI.io said {e.code}")
    except urllib.error.URLError as e:
        raise RuntimeError(net_error(e))


def create_token(site, who, pw):
    """Signs in and creates an API token. Returns (token, user name, token name). The password is not kept."""
    r = raw_post(site, "/auth/login", {"email": who, "password": pw})
    session = r.get("token")
    if not session:
        raise RuntimeError("Sign-in worked but no session came back.")
    name = f"TKLamp logger ({platform.node() or platform.system()})"[:60]
    t = raw_post(site, "/tokens", {"name": name}, token=session)
    tok = t.get("token")
    if not tok:
        raise RuntimeError("The token was created but its value did not come back.")
    user = (r.get("user") or {}).get("name") or (r.get("user") or {}).get("email") or who
    return tok, user, name


def login(site, cfg):
    """Terminal sign-in: email/username and password, creates an API token and saves it.
    The password is only sent to hCRI.io, once; it is never saved or printed."""
    print(f"Sign in to {site} to create an API token (same as hCRI Companion's Settings).")
    who = ask("hCRI.io email or username", cfg.get("user", "")).strip()
    pw = getpass.getpass("Password (not shown): ")
    if not who or not pw:
        raise RuntimeError("Email/username and password are both needed.")
    tok, user, name = create_token(site, who, pw)
    cfg["token"], cfg["site"], cfg["user"] = tok, site, user
    save_config(cfg)
    print(f"Signed in as {user}. Token '{name}' saved in {CONFIG_PATH}. "
          "You can delete it any time from your hCRI.io account settings.")
    return tok


def upload(site, token, label, step, vals):
    r = api(site, token, "POST", "/v1/runtime", {"items": [{"label": label, "group": "TKLamp", "unit": "lm",
                                                           "intervalSeconds": step, "values": vals}]})
    if r.get("skipped"):
        raise RuntimeError("hCRI.io skipped it: " + "; ".join(s.get("reason", "?") for s in r["skipped"]))
    return r


def remote_id(site, token, label):
    """The id hCRI.io gave the curve with this name."""
    items = api(site, token, "GET", "/v1/runtime").get("items", [])
    cid = next((i["id"] for i in items if i.get("label") == label), None)
    if not cid:
        raise RuntimeError("could not find the uploaded light on hCRI.io")
    return cid


def make_share(site, token, cid):
    """Makes (or reuses) the curve's share link and returns it."""
    tok = api(site, token, "POST", "/v1/runtime?share=" + cid).get("shareToken")
    return f"{site.rstrip('/')}/?runtime={tok}"


def share_link(site, token, label):
    return make_share(site, token, remote_id(site, token, label))


def ask(prompt, default=""):
    a = input(f"{prompt}{f' [{default}]' if default else ''}: ").strip()
    return a or default


def yes(prompt, default=True):
    a = input(f"{prompt} [{'Y/n' if default else 'y/N'}]: ").strip().lower()
    return default if not a else a.startswith("y")


def write_run(base, run):
    """Saves a run as base.json (everything) and base.csv (an hCRI.io "Upload CSV" file: minutes, then the light)."""
    out = {k: v for k, v in run.items() if not k.startswith("_")}
    with open(base + ".json", "w", encoding="utf-8") as f:
        json.dump(out, f)
    with open(base + ".csv", "w", encoding="utf-8") as f:
        f.write("minutes," + run["label"].replace(",", " ") + "\n")
        for i, v in enumerate(run["values"]):
            f.write(f"{round(i * run['intervalSeconds'] / 60.0, 4)},{v}\n")


def build_run(pts, started, ended, scale, trim=True):
    """Turns the recorded readings into a run (1 s bins, dark start trimmed). None if it is too short."""
    out = resample(pts)
    if not out:
        return None
    step, vals = out
    trimmed = 0
    if trim:
        vals, trimmed = trim_leading(vals, step)
        if trimmed:
            started = started + datetime.timedelta(seconds=trimmed * step)
    dur = (len(vals) - 1) * step
    meta = {"started": started.strftime(TS), "ended": ended.strftime(TS), "durationSeconds": dur, "readings": len(pts),
            "countsPerLumen": scale, "trimmedLeadingSeconds": trimmed * step, "source": "tklamp_live.py"}
    label = f"TKLamp run {started.strftime('%Y-%m-%d %H:%M')}"
    meta["label"] = label
    return {"label": label, "intervalSeconds": step, "unit": "lm", "values": vals, "meta": meta}


def finish(args, cfg, label, step, vals, meta, base):
    """Rename, save and upload."""
    label = ask("Name for this run", label)[:160]
    meta["label"] = label
    json_path = base + ".json"
    write_run(base, {"label": label, "intervalSeconds": step, "unit": "lm", "values": vals, "meta": meta})
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


# ----------------------------------------------------------------------------------------------------------------------
# Window (tkinter): live chart, recording, calibration, history, rename, upload and share
# ----------------------------------------------------------------------------------------------------------------------

import threading
import queue
import bisect
import webbrowser
import glob

try:
    import tkinter as tk
    from tkinter import ttk, messagebox, simpledialog
except ImportError:              # no tkinter in this Python: the terminal version is used instead
    tk = None

ICON_B64 = (
    "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"
)   # the hCRI.io icon (64 px PNG) for the window, taskbar and dock


SIM_LABEL = "Simulated tester (no hardware)"
CHART = {"bg": "#ffffff", "grid": "#e1e4e8", "grid0": "#eef0f2", "grid1": "#dde1e5", "grid5": "#bcc3ca", "axis": "#6a737d", "line": "#0b7a55", "text": "#24292e"}


def nice_ceil(v):
    if v <= 0:
        return 1.0
    e = 10 ** math.floor(math.log10(v))
    f = v / e
    for n in (1, 2, 2.5, 5, 10):
        if f <= n + 1e-9:
            return n * e
    return 10 * e


def nice_step(span, target=6):
    raw = span / float(target)
    for s in (1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14400, 21600, 43200, 86400):
        if s >= raw:
            return s
    return 86400


def tick_label(s):
    s = int(s)
    if s < 3600:
        return f"{s // 60}:{s % 60:02d}"
    return f"{s // 3600}:{(s % 3600) // 60:02d}:{s % 60:02d}"


def grid_step(y_max):
    """Spacing of the finest horizontal grid lines: the smallest 1-2-5 step that keeps the chart to 30 lines or fewer."""
    if not y_max > 0:
        return 1.0
    need = y_max / 30.0
    k = 10 ** math.floor(math.log10(need))
    for m in (1, 2, 5, 10):
        if m * k >= need - 1e-12:
            return round(m * k, 6)
    return 10 * k


def grid_level(v, minor):
    """(colour key, dash, tick length): faint fine dots (50 lm), dotted (every 100), solid (every 500); scales with the chart."""
    h = 10 ** math.floor(math.log10(5 * minor))

    def is_m(m):
        return abs(v / m - round(v / m)) < 1e-6
    if is_m(5 * h):
        return "grid5", None, 7
    if is_m(h):
        return "grid1", (1, 3), 5
    return "grid0", (1, 5), 3


def grid_label_every(px_per_step):
    """Every how many grid lines gets a number (numbers no closer than about 24 px)."""
    need = math.ceil(24 / max(1.0, px_per_step))
    for k in (1, 2, 5, 10, 20):
        if k >= need:
            return k
    return 20


def draw_chart(cv, ts, vs, window_s=0, ymax=None):
    """Draws lumens against time on a canvas. window_s > 0: the last window_s seconds (scrolls); 0: the whole run."""
    cv.delete("all")
    w, h = cv.winfo_width(), cv.winfo_height()
    left, right, top, bottom = 56, 14, 24, 28
    pw, ph = w - left - right, h - top - bottom
    if pw < 40 or ph < 30:
        return 0.0
    tmax = ts[-1] if ts else 0.0
    if window_s and window_s > 0:
        t1 = max(tmax, float(window_s))
        t0 = t1 - window_s
    else:
        t0, t1 = 0.0, max(tmax, 10.0)
    i0 = max(0, bisect.bisect_left(ts, t0) - 1) if ts else 0
    seg_t, seg_v = ts[i0:], vs[i0:]
    step = max(1, len(seg_t) // (pw * 2)) if seg_t else 1
    if step > 1:
        seg_t, seg_v = seg_t[::step], seg_v[::step]
    peak = max(seg_v) if seg_v else 0.0
    top_v = ymax if ymax else nice_ceil(peak * 1.05)
    top_v = max(top_v, nice_ceil(peak * 1.05)) if ymax else top_v

    def X(t):
        return left + (t - t0) / (t1 - t0) * pw

    def Y(v):
        return top + ph - (v / top_v) * ph if top_v else top + ph

    cv.create_rectangle(left, top, left + pw, top + ph, outline=CHART["grid"])
    minor = grid_step(top_v)
    every = grid_label_every(abs(Y(minor) - Y(0)))
    k = 0
    while k * minor <= top_v + 1e-9:
        v = round(k * minor, 6)
        y = Y(v)
        lv = grid_level(v, minor)
        cv.create_line(left, y, left + pw, y, fill=CHART[lv[0]], dash=lv[1] or None)
        if k % every == 0 or lv[0] == "grid5":
            cv.create_line(left - lv[2], y, left, y, fill=CHART["axis"])
        if k % every == 0:
            cv.create_text(left - 6, y, text=f"{v:g}", anchor="e", fill=CHART["axis"], font=("Helvetica", 9))
        k += 1
    stp = nice_step(t1 - t0)
    t = math.ceil(t0 / stp) * stp
    while t <= t1 + 1e-9:
        x = X(t)
        cv.create_line(x, top, x, top + ph, fill=CHART["grid"])
        cv.create_text(x, top + ph + 4, text=tick_label(t), anchor="n", fill=CHART["axis"], font=("Helvetica", 9))
        t += stp
    cv.create_text(left - 6, 3, text="lm", anchor="ne", fill=CHART["axis"], font=("Helvetica", 9))
    pts = [(X(min(max(a, t0), t1)), Y(b)) for a, b in zip(seg_t, seg_v) if a <= t1]
    if len(pts) >= 2:
        cv.create_line(*[c for p in pts for c in p], fill=CHART["line"], width=2)
    elif len(pts) == 1:
        cv.create_oval(pts[0][0] - 2, pts[0][1] - 2, pts[0][0] + 2, pts[0][1] + 2, fill=CHART["line"], outline="")
    return top_v


class Source(threading.Thread):
    """Reads the tester (or the simulator) in the background and queues (time, raw count)."""

    def __init__(self, ser, q):
        threading.Thread.__init__(self, daemon=True)
        self.ser, self.q, self.halt = ser, q, threading.Event()

    def run(self):
        reader = FrameReader()
        while not self.halt.is_set():
            try:
                data = self.ser.read(256)
            except Exception as e:
                self.q.put(("error", str(e)))
                return
            if data:
                now = time.monotonic()
                for raw in reader.feed(data):
                    self.q.put((now, raw))

    def stop(self):
        self.halt.set()


class TkApp:
    WINDOWS = [("30 seconds", 30), ("2 minutes", 120), ("10 minutes", 600), ("Whole run", 0)]

    def __init__(self, root, args, cfg):
        self.root, self.args, self.cfg = root, args, cfg
        self.scale = args.scale or cfg.get("scale") or DEFAULT_SCALE
        self.site = args.site or cfg.get("site") or DEFAULT_SITE
        self.outdir = args.output_dir or os.path.join(os.path.expanduser("~"), "TKLamp runs")
        os.makedirs(self.outdir, exist_ok=True)
        self.q, self.jobs = queue.Queue(), queue.Queue()
        self.source = self.ser = None
        self.connected = False
        self.recording = False
        self.pts, self.t0, self.started, self.stamp, self.spool, self.spool_n = [], 0.0, None, "", None, 0
        self.live_t, self.live_v, self.live_t0 = [], [], time.monotonic()
        self.recent, self.last_rx, self.sec_vals, self.last_row, self.last_flush = [], 0.0, [], 0.0, 0.0
        self.ymax, self.calib = 0.0, None
        self.runs, self.port_map = [], {}
        self.armed, self.pending_stop, self.last_rx_wall = False, None, datetime.datetime.now()
        lim = limits_from_cfg(cfg)
        for key, name in (("start_at", "start_at"), ("stop_below", "stop_below"), ("duration", "duration"), ("idle_min", "idle_timeout")):
            v = getattr(args, name, None)
            if v is not None:
                lim[key] = v
        self.guard = RunGuard(lim)
        self.build_ui()
        self.refresh_ports()
        self.load_history()
        if args.simulate:
            self.port_var.set(SIM_LABEL)
            self.connect()
        warn = tk_warning()
        if warn:
            self.msg(warn)
            root.after(600, lambda: messagebox.showwarning("Old Tk", warn))
        self.tick()

    # ---- layout --------------------------------------------------------------------------------------------------
    def build_ui(self):
        r = self.root
        r.title("TKLamp Live Logger - hCRI.io")
        try:
            self.icon = tk.PhotoImage(data=ICON_B64)
            r.iconphoto(True, self.icon)
        except Exception:
            pass
        r.geometry("960x720")
        r.minsize(760, 600)
        r.protocol("WM_DELETE_WINDOW", self.on_close)

        top = ttk.Frame(r, padding=(10, 8))
        top.pack(fill="x")
        ttk.Label(top, text="Tester").pack(side="left")
        self.port_var = tk.StringVar()
        self.port_box = ttk.Combobox(top, textvariable=self.port_var, state="readonly", width=44)
        self.port_box.pack(side="left", padx=6)
        ttk.Button(top, text="Refresh", command=self.refresh_ports).pack(side="left")
        self.conn_btn = ttk.Button(top, text="Connect", command=self.toggle_connect)
        self.conn_btn.pack(side="left", padx=6)
        self.acct_btn = ttk.Button(top, text="Sign in...", command=self.acct_click)
        self.acct_btn.pack(side="right")
        self.acct_lbl = ttk.Label(top, text="")
        self.acct_lbl.pack(side="right", padx=8)

        self.nb = ttk.Notebook(r)
        self.nb.pack(fill="both", expand=True, padx=10, pady=(0, 4))
        self.live_tab, self.hist_tab = ttk.Frame(self.nb, padding=8), ttk.Frame(self.nb, padding=8)
        self.nb.add(self.live_tab, text="  Live  ")
        self.nb.add(self.hist_tab, text="  History  ")
        self.build_live()
        self.build_history()

        self.status = tk.StringVar(value="")
        ttk.Label(r, textvariable=self.status, anchor="w", padding=(12, 2)).pack(fill="x", side="bottom")
        self.update_account()
        self.update_buttons()

    def build_live(self):
        f = self.live_tab
        head = ttk.Frame(f)
        head.pack(fill="x")
        self.big = tk.StringVar(value="--")
        tk.Label(head, textvariable=self.big, font=("Helvetica", 52, "bold")).pack(side="left")
        tk.Label(head, text=" lm", font=("Helvetica", 22)).pack(side="left", anchor="s", pady=(0, 10))
        self.rec_var = tk.StringVar(value="")
        tk.Label(head, textvariable=self.rec_var, font=("Helvetica", 16, "bold"), fg="#c62828").pack(side="right")

        self.cv = tk.Canvas(f, height=240, bg=CHART["bg"], highlightthickness=1, highlightbackground=CHART["grid"])
        self.cv.pack(fill="both", expand=True, pady=6)
        self.cv.bind("<Configure>", lambda e: self.redraw())

        bar = ttk.Frame(f)
        bar.pack(fill="x", pady=2)
        self.main_btn = ttk.Button(bar, text="Start run", command=self.start_stop, width=12)
        self.main_btn.pack(side="left")
        self.clear_btn = ttk.Button(bar, text="Clear", command=self.clear_chart)
        self.clear_btn.pack(side="left", padx=6)
        self.cal_btn = ttk.Button(bar, text="Calibrate...", command=self.calibrate_dialog)
        self.cal_btn.pack(side="left")
        self.scale_lbl = ttk.Label(bar, text="")
        self.scale_lbl.pack(side="left", padx=8)
        self.win_var = tk.StringVar(value=self.WINDOWS[1][0])
        wb = ttk.Combobox(bar, textvariable=self.win_var, state="readonly", width=11, values=[w[0] for w in self.WINDOWS])
        wb.pack(side="right")
        wb.bind("<<ComboboxSelected>>", lambda e: self.redraw())
        ttk.Label(bar, text="Chart width").pack(side="right", padx=6)

        lf = ttk.LabelFrame(f, text="Run limits (blank = off; remembered between runs)", padding=(8, 4))
        lf.pack(fill="x", pady=(6, 2))
        self.lim_vars = {}
        for key, label in (("start_at", "Start at (lm)"), ("stop_below", "Stop below (lm)"), ("duration", "Stop after (min)"),
                           ("idle_min", "No readings for (min)")):
            ttk.Label(lf, text=label).pack(side="left")
            v = tk.StringVar(value=self.lim_text(self.guard.limits.get(key)))
            e = ttk.Entry(lf, textvariable=v, width=7)
            e.pack(side="left", padx=(4, 12))
            e.bind("<FocusOut>", lambda ev: self.commit_limits())
            e.bind("<Return>", lambda ev: self.commit_limits())
            self.lim_vars[key] = v
        opts = ttk.Frame(f)
        opts.pack(fill="x", pady=2)
        self.trim_var = tk.BooleanVar(value=not self.args.no_trim)
        ttk.Checkbutton(opts, text="Trim the dark start", variable=self.trim_var).pack(side="left", padx=14)
        self.show_var = tk.BooleanVar(value=(not self.args.no_readout) and self.cfg.get("readout", True))
        ttk.Checkbutton(opts, text="Show readings", variable=self.show_var, command=self.toggle_readout).pack(side="left")

        self.log_frame = ttk.Frame(f)
        ttk.Label(self.log_frame, text="Time          Elapsed           Lumens", font=("Courier", 10, "bold")).pack(anchor="w")
        lw = ttk.Frame(self.log_frame)
        lw.pack(fill="both", expand=True)
        self.log = tk.Text(lw, height=7, width=60, font=("Courier", 10), state="disabled", wrap="none")
        sb = ttk.Scrollbar(lw, command=self.log.yview)
        self.log.configure(yscrollcommand=sb.set)
        self.log.pack(side="left", fill="both", expand=True)
        sb.pack(side="right", fill="y")
        self.toggle_readout()

    def build_history(self):
        f = self.hist_tab
        bar = ttk.Frame(f)
        bar.pack(fill="x")
        for text, cmd in (("View", self.view_selected), ("Rename...", self.rename_selected), ("Upload", self.upload_selected),
                          ("Share link", self.share_selected), ("Stop sharing", self.unshare_selected),
                          ("Open on hCRI.io", self.open_site), ("Delete", self.delete_selected),
                          ("Open folder", self.open_folder)):
            ttk.Button(bar, text=text, command=cmd).pack(side="left", padx=(0, 6), pady=(0, 6))
        cols = ("name", "started", "length", "lumens", "status")
        self.tree = ttk.Treeview(f, columns=cols, show="headings", height=8, selectmode="browse")
        for c, t, w in (("name", "Name", 300), ("started", "Started", 150), ("length", "Length", 80),
                        ("lumens", "Lumens (start > end)", 150), ("status", "Status", 150)):
            self.tree.heading(c, text=t)
            self.tree.column(c, width=w, anchor="w")
        self.tree.pack(fill="x")
        self.tree.bind("<<TreeviewSelect>>", lambda e: self.show_selected())
        self.tree.bind("<Double-1>", lambda e: self.view_selected())
        self.detail = tk.StringVar(value="Runs you record are saved here. Select one to see it.")
        ttk.Label(f, textvariable=self.detail, justify="left", wraplength=880).pack(fill="x", pady=6)
        self.hcv = tk.Canvas(f, height=240, bg=CHART["bg"], highlightthickness=1, highlightbackground=CHART["grid"])
        self.hcv.pack(fill="both", expand=True)
        self.hcv.bind("<Configure>", lambda e: self.draw_selected())

    # ---- small helpers -------------------------------------------------------------------------------------------
    def center(self, d):
        d.update_idletasks()
        x = self.root.winfo_rootx() + max(0, (self.root.winfo_width() - d.winfo_reqwidth()) // 2)
        y = self.root.winfo_rooty() + max(0, (self.root.winfo_height() - d.winfo_reqheight()) // 3)
        d.geometry(f"+{x}+{y}")

    def msg(self, text):
        self.status.set(text)

    def token(self):
        return self.args.token or os.environ.get("HCRI_TOKEN") or self.cfg.get("token")

    def bg(self, fn, cb, what=""):
        """Runs fn() off the window thread; cb(result, error) is called back on it."""
        if what:
            self.msg(what + "...")

        def work():
            try:
                res = (fn(), None)
            except Exception as e:
                res = (None, e)
            self.jobs.put((cb, res))
        threading.Thread(target=work, daemon=True).start()

    @staticmethod
    def lim_text(v):
        return "" if not v else f"{v:g}"

    def commit_limits(self):
        """Reads the four limit boxes, remembers them (in ~/.hcri_tklamp.json) and applies them to the current run too."""
        lim = {k: num_or_none(v.get()) for k, v in self.lim_vars.items()}
        lim["idle_min"] = lim["idle_min"] or 0
        for k, v in self.lim_vars.items():
            v.set(self.lim_text(lim[k]))
        self.guard.limits = lim
        self.cfg["limits"] = lim
        try:
            save_config(self.cfg)
        except OSError:
            pass

    def window_s(self):
        return dict(self.WINDOWS)[self.win_var.get()] if self.win_var.get() in dict(self.WINDOWS) else 120

    def update_buttons(self):
        rec, con = self.recording, self.connected
        self.main_btn.configure(text="Stop run" if rec else ("Cancel" if self.armed else "Start run"),
                                state="normal" if (con or rec or self.armed) else "disabled")
        self.clear_btn.configure(state="disabled" if rec else "normal")
        self.cal_btn.configure(state="normal" if (con and not rec) else "disabled")
        self.port_box.configure(state="disabled" if (con or rec) else "readonly")
        self.conn_btn.configure(text="Disconnect" if con else "Connect", state="disabled" if rec else "normal")
        self.scale_lbl.configure(text=f"Scale: {self.scale:g} counts per lumen")

    def update_account(self):
        if self.token():
            who = self.cfg.get("user") or "token"
            self.acct_lbl.configure(text=f"hCRI.io: {who}")
            self.acct_btn.configure(text="Sign out")
        else:
            self.acct_lbl.configure(text="hCRI.io: not signed in")
            self.acct_btn.configure(text="Sign in...")

    def toggle_readout(self):
        self.cfg["readout"] = bool(self.show_var.get())
        try:
            save_config(self.cfg)
        except OSError:
            pass
        if self.show_var.get():
            self.log_frame.pack(fill="x", pady=(6, 0))
        else:
            self.log_frame.pack_forget()

    def add_row(self, text):
        self.log.configure(state="normal")
        self.log.insert("end", text + "\n")
        if int(self.log.index("end-1c").split(".")[0]) > 1500:
            self.log.delete("1.0", "300.0")
        self.log.see("end")
        self.log.configure(state="disabled")

    # ---- the tester ----------------------------------------------------------------------------------------------
    def refresh_ports(self):
        items, pick = [], None
        try:
            ports = list_serial_ports()
            ch = [p for p in ports if p.vid == 0x1A86]
            for p in ch + [p for p in ports if p not in ch]:
                items.append((f"{p.device} - {p.description}", p.device))
            if ch:
                pick = f"{ch[0].device} - {ch[0].description}"
            elif not self.args.simulate:
                self.msg(driver_hint())
        except ImportError:
            self.msg("pyserial is not installed (pip install pyserial); only the simulator is available.")
        items.append((SIM_LABEL, None))
        self.port_map = dict(items)
        self.port_box.configure(values=[i[0] for i in items])
        if self.args.port:
            for lab, dev in items:
                if dev == self.args.port:
                    pick = lab
        if self.port_var.get() not in self.port_map:
            self.port_var.set(pick or items[0][0])

    def toggle_connect(self):
        if self.connected:
            self.disconnect()
        else:
            self.connect()

    def connect(self):
        dev = self.port_map.get(self.port_var.get())
        try:
            if dev is None and self.port_var.get() == SIM_LABEL:
                ser = SimPort(self.scale)
            else:
                import serial
                ser = serial.Serial(dev, 9600, timeout=0.3)
                ser.setDTR(True)
                ser.reset_input_buffer()
        except ImportError:
            messagebox.showerror("pyserial missing", "Install it with:  pip install pyserial")
            return
        except Exception as e:
            messagebox.showerror("Could not open the tester", str(e))
            return
        self.ser = ser
        self.source = Source(ser, self.q)
        self.source.start()
        self.connected = True
        self.recent, self.last_rx = [], 0.0
        self.live_t, self.live_v, self.live_t0, self.ymax = [], [], time.monotonic(), 0.0
        self.msg("Reading the tester." if dev else "Simulation: a made-up fading light.")
        self.update_buttons()

    def disconnect(self):
        if self.recording:
            return
        self.drop_source()
        self.msg("Disconnected.")
        self.update_buttons()

    def drop_source(self):
        if self.source:
            self.source.stop()
            self.source.join(1.5)
        try:
            if self.ser:
                self.ser.close()
        except Exception:
            pass
        self.source = self.ser = None
        self.connected = False
        self.recent = []
        while not self.q.empty():
            try:
                self.q.get_nowait()
            except queue.Empty:
                break

    def on_reading(self, t, raw):
        lm = raw / self.scale
        self.recent.append(lm)
        if len(self.recent) > 5:
            self.recent.pop(0)
        self.last_rx = t
        self.last_rx_wall = datetime.datetime.now()
        self.sec_vals.append(lm)
        avg = sum(self.recent) / len(self.recent)
        if self.calib is not None:
            self.calib.append(raw)
        if self.armed and not self.recording and self.guard.should_start(avg):
            self.begin_run(t)
        if self.recording:
            self.pts.append((t - self.t0, lm))
            why = self.guard.on_reading(avg, t - self.t0)
            if why and not self.pending_stop:
                self.pending_stop = (why, None)
        else:
            self.live_t.append(t - self.live_t0)
            self.live_v.append(lm)
            if len(self.live_t) > 8000:
                del self.live_t[:2000], self.live_v[:2000]

    def tick(self):
        now = time.monotonic()
        try:
            while True:
                item = self.q.get_nowait()
                if item[0] == "error":
                    self.on_error(item[1])
                else:
                    self.on_reading(item[0], item[1])
        except queue.Empty:
            pass
        try:
            while True:
                cb, (res, err) = self.jobs.get_nowait()
                cb(res, err)
        except queue.Empty:
            pass
        self.housekeeping(now)
        self.root.after(100, self.tick)

    def housekeeping(self, now):
        fresh = bool(self.recent) and now - self.last_rx <= 5
        self.big.set(f"{sum(self.recent) / len(self.recent):,.1f}" if fresh else "--")
        if self.recording:
            self.rec_var.set(f"REC {fmt_clock(now - self.t0)}   {len(self.pts)} readings")
        elif self.armed:
            self.rec_var.set(f"Waiting for {self.guard.limits['start_at']:g} lm to start...")
        else:
            self.rec_var.set("")
        if self.connected and now - self.last_row >= 1.0:
            self.last_row = now
            if self.show_var.get():
                vals, self.sec_vals = self.sec_vals, []
                clock = datetime.datetime.now().strftime("%H:%M:%S")
                el = fmt_clock(now - self.t0) if self.recording else "-"
                lm = f"{sum(vals) / len(vals):10.1f} lm" if vals else "   no reading"
                self.add_row(f"{clock}  {el:>10}  {lm}" + ("   REC" if self.recording else ""))
            self.sec_vals = []
        if self.recording and self.spool and self.pts and now - self.last_flush > 2:
            self.spool.write("".join(f"{t:.3f},{v:.2f}\n" for t, v in self.pts[self.spool_n:]))
            self.spool_n = len(self.pts)
            self.spool.flush()
            self.last_flush = now
        if self.recording and not self.pending_stop:
            why = self.guard.on_timer(self.pts[-1][0] if self.pts else 0.0, now - self.last_rx)
            if why:
                self.pending_stop = (why, self.last_rx_wall if "no readings" in why else None)
        if self.pending_stop and self.recording:
            why, ended = self.pending_stop
            self.pending_stop = None
            self.stop_run(f"Stopped automatically: {why}.", auto=True, ended=ended)
        self.redraw()

    def on_error(self, text):
        self.drop_source()
        self.update_buttons()
        if self.recording:
            messagebox.showwarning("Lost the tester", f"{text}\n\nThe run so far is kept. Press Stop run to save it.")
        else:
            messagebox.showerror("Lost the tester", text)

    # ---- chart ---------------------------------------------------------------------------------------------------
    def redraw(self):
        if self.recording:
            ts, vs = [p[0] for p in self.pts], [p[1] for p in self.pts]
        else:
            ts, vs = self.live_t, self.live_v
        # the vertical scale starts at zero and only ever grows, so the line does not jump about
        top = draw_chart(self.cv, ts, vs, self.window_s(), self.ymax or None)
        self.ymax = max(self.ymax, top)

    def clear_chart(self):
        self.live_t, self.live_v, self.live_t0, self.ymax = [], [], time.monotonic(), 0.0
        self.redraw()

    # ---- recording -----------------------------------------------------------------------------------------------
    def start_stop(self):
        self.commit_limits()
        if self.recording:
            self.stop_run()
            return
        if self.armed:
            self.armed = False
            self.msg("Stopped waiting for the start level.")
            self.update_buttons()
            return
        now = time.monotonic()
        if not self.recent or now - self.last_rx > 5:
            messagebox.showinfo("No readings yet", "Check the tester is on and its cable is in. Not started.")
            return
        if not self.guard.should_start(sum(self.recent) / len(self.recent)):
            self.armed = True
            self.msg(f"Waiting for the light to reach {self.guard.limits['start_at']:g} lm; it then starts recording by itself.")
            self.update_buttons()
            return
        self.begin_run(now)

    def begin_run(self, now):
        self.armed = False
        self.guard.reset()
        self.pending_stop = None
        self.recording = True
        self.pts, self.t0, self.started, self.ymax = [], now, datetime.datetime.now(), 0.0
        self.stamp = self.started.strftime("%Y-%m-%d-%H.%M.%S")
        self.spool_n = 0
        try:
            self.spool = open(os.path.join(self.outdir, f"TKLamp_{self.stamp}.partial.csv"), "w", encoding="utf-8")
            self.spool.write("seconds,lumens\n")
        except OSError:
            self.spool = None
        self.add_row(f"-- Recording started {self.started.strftime(TS)} --")
        self.msg(f"Recording from {self.started.strftime(TS)}.")
        self.update_buttons()

    def stop_run(self, why="", auto=False, ended=None):
        if not self.recording:
            return
        ended = ended or datetime.datetime.now()
        self.recording = False
        if self.spool:
            self.spool.close()
            self.spool = None
        partial = os.path.join(self.outdir, f"TKLamp_{self.stamp}.partial.csv")
        pts, started = self.pts, self.started
        self.pts = []
        self.live_t, self.live_v, self.live_t0, self.ymax = [], [], time.monotonic(), 0.0
        self.add_row(f"-- Stopped {ended.strftime(TS)}" + (f": {why}" if why else "") + " --")
        self.update_buttons()
        run = build_run(pts, started, ended, self.scale, bool(self.trim_var.get()))
        if not run:
            if auto:
                self.msg(f"{why} The recording was too short to keep.")
            else:
                messagebox.showinfo("Too short", "The recording was too short to keep (it needs at least 2 seconds of readings).")
                self.msg("Nothing saved.")
            return
        if auto:
            # Nobody may be at the computer: keep the run now under its suggested name; rename or upload it from History.
            try:
                os.remove(partial)
            except OSError:
                pass
            base = os.path.join(self.outdir, f"TKLamp_{self.stamp}")
            run["_base"] = base
            write_run(base, run)
            self.runs.insert(0, run)
            self.fill_tree(select=run)
            self.nb.select(self.hist_tab)
            self.msg(f"{why} Saved as '{run['label']}'. Rename or upload it here.")
            return
        self.save_dialog(run, partial, why)

    def save_dialog(self, run, partial, why=""):
        m = run["meta"]
        d = tk.Toplevel(self.root)
        d.title("Save this run")
        d.transient(self.root)
        d.resizable(False, False)
        body = ttk.Frame(d, padding=14)
        body.pack()
        info = (f"{why + chr(10) if why else ''}Length {fmt_clock(m['durationSeconds'])}, {m['readings']} readings, "
                f"{run['values'][0]:.0f} to {run['values'][-1]:.0f} lm\nStarted {m['started']}\nEnded   {m['ended']}"
                + (f"\nDark start trimmed: {m['trimmedLeadingSeconds']:g} s" if m["trimmedLeadingSeconds"] else ""))
        ttk.Label(body, text=info, justify="left").grid(row=0, column=0, columnspan=2, sticky="w")
        ttk.Label(body, text="Name").grid(row=1, column=0, sticky="w", pady=(10, 0))
        name = tk.StringVar(value=run["label"])
        e = ttk.Entry(body, textvariable=name, width=46)
        e.grid(row=1, column=1, pady=(10, 0), padx=(8, 0))
        up = tk.BooleanVar(value=bool(self.token()))
        sh = tk.BooleanVar(value=False)
        ttk.Checkbutton(body, text="Upload to Runtime on hCRI.io" + ("" if self.token() else " (asks you to sign in)"),
                        variable=up).grid(row=2, column=0, columnspan=2, sticky="w", pady=(10, 0))
        ttk.Checkbutton(body, text="Make a share link", variable=sh).grid(row=3, column=0, columnspan=2, sticky="w")
        out = {"go": False}
        bt = ttk.Frame(body)
        bt.grid(row=4, column=0, columnspan=2, sticky="e", pady=(12, 0))

        def ok(*_):
            if not name.get().strip():
                return
            out["go"] = True
            d.destroy()
        ttk.Button(bt, text="Discard", command=d.destroy).pack(side="right", padx=(6, 0))
        ttk.Button(bt, text="Save", command=ok).pack(side="right")
        d.bind("<Return>", ok)
        d.bind("<Escape>", lambda e: d.destroy())
        e.focus_set()
        e.select_range(0, "end")
        self.center(d)
        d.grab_set()
        self.root.wait_window(d)
        try:
            os.remove(partial)
        except OSError:
            pass
        if not out["go"]:
            self.msg("Run discarded.")
            return
        run["label"] = m["label"] = name.get().strip()[:160]
        base = os.path.join(self.outdir, f"TKLamp_{self.stamp}")
        run["_base"] = base
        write_run(base, run)
        self.runs.insert(0, run)
        self.fill_tree(select=run)
        self.nb.select(self.hist_tab)
        self.msg(f"Saved {base}.json and .csv")
        if up.get():
            self.upload_run(run, share=sh.get())

    # ---- calibration ---------------------------------------------------------------------------------------------
    def calibrate_dialog(self):
        d = tk.Toplevel(self.root)
        d.title("Calibrate the scale")
        d.transient(self.root)
        d.resizable(False, False)
        b = ttk.Frame(d, padding=14)
        b.pack()
        ttk.Label(b, justify="left", wraplength=360,
                  text="Put a lamp of known output in the sphere and leave it steady. Enter its lumens, then Measure. "
                       "It averages 8 seconds of readings and works out the counts per lumen.").grid(row=0, column=0, columnspan=2)
        ttk.Label(b, text="Known lumens").grid(row=1, column=0, sticky="w", pady=10)
        known = tk.StringVar(value="2150")
        ke = ttk.Entry(b, textvariable=known, width=10)
        ke.grid(row=1, column=1, sticky="w", padx=8)
        res = tk.StringVar(value="")
        ttk.Label(b, textvariable=res, justify="left", wraplength=360).grid(row=2, column=0, columnspan=2, sticky="w")
        state = {"new": None}
        bt = ttk.Frame(b)
        bt.grid(row=3, column=0, columnspan=2, sticky="e", pady=(10, 0))
        mb = ttk.Button(bt, text="Measure")
        sb = ttk.Button(bt, text="Save scale", state="disabled")

        def finish_measure():
            raws, self.calib = self.calib or [], None
            mb.configure(state="normal")
            if len(raws) < 5:
                res.set("No readings from the tester.")
                return
            try:
                lm = float(known.get())
                avg = sum(raws) / len(raws)
                state["new"] = round(avg / lm, 1)
            except (ValueError, ZeroDivisionError):
                res.set("Enter the lamp's lumens as a number.")
                return
            res.set(f"Average raw count {avg:.0f}. The scale was {self.scale:g}; it would now be {state['new']:g} counts per lumen.")
            sb.configure(state="normal")

        def measure():
            try:
                if float(known.get()) <= 0:
                    raise ValueError
            except ValueError:
                res.set("Enter the lamp's lumens as a number.")
                return
            self.calib = []
            mb.configure(state="disabled")
            sb.configure(state="disabled")
            res.set("Measuring for 8 seconds...")
            d.after(8000, finish_measure)

        def save():
            self.scale = state["new"]
            self.cfg["scale"] = self.scale
            save_config(self.cfg)
            self.msg(f"Scale saved: {self.scale:g} counts per lumen.")
            self.update_buttons()
            d.destroy()
        mb.configure(command=measure)
        sb.configure(command=save)
        ttk.Button(bt, text="Close", command=d.destroy).pack(side="right", padx=(6, 0))
        sb.pack(side="right", padx=(6, 0))
        mb.pack(side="right")
        d.protocol("WM_DELETE_WINDOW", lambda: (setattr(self, "calib", None), d.destroy()))
        ke.focus_set()
        self.center(d)
        d.grab_set()

    # ---- account -------------------------------------------------------------------------------------------------
    def acct_click(self):
        if self.token():
            if not messagebox.askyesno("Sign out", "Forget the saved hCRI.io token on this computer?\n"
                                       "(The token stays valid until you delete it in your account settings.)"):
                return
            self.cfg.pop("token", None)
            self.cfg.pop("user", None)
            save_config(self.cfg)
            self.update_account()
        else:
            self.signin_dialog()

    def signin_dialog(self, then=None):
        d = tk.Toplevel(self.root)
        d.title("Sign in to hCRI.io")
        d.transient(self.root)
        d.resizable(False, False)
        b = ttk.Frame(d, padding=14)
        b.pack()
        ttk.Label(b, justify="left", wraplength=360,
                  text="Sign in once to create an API token for this computer (the same as hCRI Companion's Settings). "
                       "Your password is sent only to hCRI.io, once; it is not saved.").grid(row=0, column=0, columnspan=2)
        who, pw, site = tk.StringVar(value=self.cfg.get("user", "")), tk.StringVar(), tk.StringVar(value=self.site)
        for i, (lab, var, star) in enumerate((("Email or username", who, ""), ("Password", pw, "*"), ("Site", site, ""))):
            ttk.Label(b, text=lab).grid(row=i + 1, column=0, sticky="w", pady=4)
            en = ttk.Entry(b, textvariable=var, width=32, show=star)
            en.grid(row=i + 1, column=1, padx=8)
            if i == 0:
                first = en
        err = tk.StringVar(value="")
        tk.Label(b, textvariable=err, fg="#c62828", wraplength=360, justify="left").grid(row=4, column=0, columnspan=2, sticky="w")
        bt = ttk.Frame(b)
        bt.grid(row=5, column=0, columnspan=2, sticky="e", pady=(8, 0))
        go = ttk.Button(bt, text="Sign in")

        def done(res, e):
            go.configure(state="normal")
            if e:
                err.set(str(e))
                return
            tok, user, name = res
            self.site = site.get().strip().rstrip("/") or DEFAULT_SITE
            self.cfg.update({"token": tok, "site": self.site, "user": user})
            save_config(self.cfg)
            self.update_account()
            self.msg(f"Signed in as {user}. Token '{name}' saved in {CONFIG_PATH}.")
            d.destroy()
            if then:
                then()

        def submit(*_):
            if not who.get().strip() or not pw.get():
                err.set("Email/username and password are both needed.")
                return
            err.set("")
            go.configure(state="disabled")
            s, w, p = site.get().strip().rstrip("/") or DEFAULT_SITE, who.get().strip(), pw.get()
            self.bg(lambda: create_token(s, w, p), done, "Signing in")
        go.configure(command=submit)
        ttk.Button(bt, text="Cancel", command=d.destroy).pack(side="right", padx=(6, 0))
        go.pack(side="right")
        d.bind("<Return>", submit)
        first.focus_set()
        self.center(d)
        d.grab_set()

    # ---- history -------------------------------------------------------------------------------------------------
    def load_history(self):
        runs = []
        for p in glob.glob(os.path.join(self.outdir, "*.json")):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    r = json.load(f)
                if isinstance(r, dict) and r.get("values") and r.get("intervalSeconds"):
                    r["_base"] = os.path.splitext(p)[0]
                    r.setdefault("meta", {})
                    runs.append(r)
            except (OSError, ValueError):
                pass
        runs.sort(key=lambda r: r["meta"].get("started", ""), reverse=True)
        self.runs = runs
        self.fill_tree()

    @staticmethod
    def status_of(r):
        rem = r["meta"].get("remote") or {}
        if rem.get("shareUrl"):
            return "Uploaded, shared"
        return "Uploaded" if rem.get("id") else "On this computer"

    def fill_tree(self, select=None):
        self.tree.delete(*self.tree.get_children())
        for i, r in enumerate(self.runs):
            v, m = r["values"], r["meta"]
            dur = (len(v) - 1) * r["intervalSeconds"]
            self.tree.insert("", "end", iid=str(i), values=(r["label"], m.get("started", ""), fmt_clock(dur),
                                                             f"{v[0]:.0f} > {v[-1]:.0f} lm", self.status_of(r)))
        if select is not None and select in self.runs:
            self.tree.selection_set(str(self.runs.index(select)))
            self.show_selected()
        elif not self.runs:
            self.detail.set("No runs yet. Record one on the Live tab and it appears here.")
            self.hcv.delete("all")

    def selected(self):
        sel = self.tree.selection()
        if not sel:
            messagebox.showinfo("Select a run", "Select a run in the list first.")
            return None
        return self.runs[int(sel[0])]

    def describe(self, r):
        m = r["meta"]
        v = r["values"]
        rem = m.get("remote") or {}
        bits = [r["label"],
                f"Started {m.get('started', '?')}   Ended {m.get('ended', '?')}   Length {fmt_clock((len(v) - 1) * r['intervalSeconds'])}"
                f"   {len(v)} points at {r['intervalSeconds']:g} s",
                f"{v[0]:.0f} lm at the start, {v[-1]:.0f} lm at the end ({100 * v[-1] / v[0] if v[0] else 0:.0f}% left)"
                f"   Scale {m.get('countsPerLumen', '?')} counts per lumen",
                self.status_of(r) + (f"   {rem['shareUrl']}" if rem.get("shareUrl") else "")]
        return "\n".join(bits)

    def show_selected(self):
        sel = self.tree.selection()
        if sel:
            self.detail.set(self.describe(self.runs[int(sel[0])]))
            self.draw_selected()

    def draw_selected(self):
        sel = self.tree.selection()
        if not sel:
            return
        r = self.runs[int(sel[0])]
        draw_chart(self.hcv, [i * r["intervalSeconds"] for i in range(len(r["values"]))], r["values"], 0)

    def view_selected(self):
        r = self.selected()
        if not r:
            return
        d = tk.Toplevel(self.root)
        d.title(r["label"])
        d.geometry("900x560")
        ttk.Label(d, text=self.describe(r), justify="left", padding=10, wraplength=860).pack(fill="x")
        cv = tk.Canvas(d, bg=CHART["bg"], highlightthickness=0)
        cv.pack(fill="both", expand=True, padx=10, pady=(0, 10))
        ts = [i * r["intervalSeconds"] for i in range(len(r["values"]))]
        cv.bind("<Configure>", lambda e: draw_chart(cv, ts, r["values"], 0))

    def save_run_files(self, r):
        write_run(r["_base"], r)

    def rename_selected(self):
        r = self.selected()
        if not r:
            return
        new = simpledialog.askstring("Rename run", "Name:", initialvalue=r["label"], parent=self.root)
        if not new or not new.strip() or new.strip() == r["label"]:
            return
        new = new.strip()[:160]
        rem = r["meta"].get("remote") or {}
        old = r["label"]
        r["label"] = r["meta"]["label"] = new
        also = bool(rem.get("id")) and bool(self.token()) and messagebox.askyesno(
            "Rename on hCRI.io too?", "This run is also on hCRI.io. Rename it there as well?\n"
            "(It is re-uploaded under the new name and the old one is deleted. An old share link stops working.)")
        if also:
            def job():
                site, tok = self.site, self.token()
                upload(site, tok, new, r["intervalSeconds"], r["values"])
                nid = remote_id(site, tok, new)
                api(site, tok, "POST", "/v1/runtime?delete=" + rem["id"])
                return nid

            def done(nid, e):
                if e:
                    messagebox.showerror("Rename on hCRI.io failed", f"{e}\nThe name here was changed; the one on hCRI.io was not.")
                    r["meta"]["remote"] = rem
                else:
                    r["meta"]["remote"] = {"id": nid, "uploadedAt": datetime.datetime.now().strftime(TS)}
                    self.msg("Renamed here and on hCRI.io.")
                self.save_run_files(r)
                self.fill_tree(select=r)
            self.bg(job, done, "Renaming on hCRI.io")
        else:
            if rem.get("id"):
                r["meta"]["remote"] = dict(rem, stale=True)    # the copy on hCRI.io still has the old name
            self.msg(f"Renamed '{old}' to '{new}'.")
        self.save_run_files(r)
        self.fill_tree(select=r)

    def need_token(self, then):
        if self.token():
            return True
        if messagebox.askyesno("Sign in", "You need to sign in to hCRI.io first. Sign in now?"):
            self.signin_dialog(then=then)
        return False

    def upload_selected(self):
        r = self.selected()
        if r:
            self.upload_run(r)

    def upload_run(self, r, share=False):
        if not self.need_token(lambda: self.upload_run(r, share)):
            return

        def job():
            site, tok = self.site, self.token()
            upload(site, tok, r["label"], r["intervalSeconds"], r["values"])
            rid = remote_id(site, tok, r["label"])
            url = make_share(site, tok, rid) if share else None
            return rid, url

        def done(res, e):
            if e:
                messagebox.showerror("Upload failed", f"{e}\n\nThe run is saved on this computer. Try Upload again later.")
                self.msg("Upload failed.")
                return
            rid, url = res
            r["meta"]["remote"] = {"id": rid, "uploadedAt": datetime.datetime.now().strftime(TS)}
            if url:
                r["meta"]["remote"]["shareUrl"] = url
                self.copy(url)
            self.save_run_files(r)
            self.fill_tree(select=r)
            self.msg("Uploaded to Runtime on hCRI.io (Explore > Runtime)." + (" Share link copied." if url else ""))
        self.bg(job, done, "Uploading")

    def share_selected(self):
        r = self.selected()
        if not r:
            return
        rem = r["meta"].get("remote") or {}
        if rem.get("shareUrl"):
            self.copy(rem["shareUrl"])
            messagebox.showinfo("Share link", rem["shareUrl"] + "\n\n(Copied to the clipboard.)")
            return
        if not rem.get("id"):
            if not messagebox.askyesno("Upload first", "A share link needs the run on hCRI.io. Upload it and make a link?"):
                return
            self.upload_run(r, share=True)
            return
        if not self.need_token(self.share_selected):
            return

        def done(url, e):
            if e:
                messagebox.showerror("Could not make a link", str(e))
                return
            rem["shareUrl"] = url
            r["meta"]["remote"] = rem
            self.copy(url)
            self.save_run_files(r)
            self.fill_tree(select=r)
            messagebox.showinfo("Share link", url + "\n\n(Copied to the clipboard.) Anyone with the link can see this run.")
        self.bg(lambda: make_share(self.site, self.token(), rem["id"]), done, "Making a share link")

    def unshare_selected(self):
        r = self.selected()
        if not r:
            return
        rem = r["meta"].get("remote") or {}
        if not rem.get("shareUrl"):
            messagebox.showinfo("Not shared", "This run has no share link.")
            return
        if not self.need_token(self.unshare_selected):
            return

        def done(_, e):
            if e:
                messagebox.showerror("Could not stop sharing", str(e))
                return
            rem.pop("shareUrl", None)
            r["meta"]["remote"] = rem
            self.save_run_files(r)
            self.fill_tree(select=r)
            self.msg("Sharing stopped. The old link no longer works.")
        self.bg(lambda: api(self.site, self.token(), "POST", "/v1/runtime?unshare=" + rem["id"]), done, "Stopping sharing")

    def delete_selected(self):
        r = self.selected()
        if not r:
            return
        rem = r["meta"].get("remote") or {}
        both = False
        if rem.get("id") and self.token():
            a = messagebox.askyesnocancel("Delete run", f"Delete '{r['label']}' from this computer.\n\n"
                                          "Also delete it from hCRI.io?  Yes = both, No = this computer only.")
            if a is None:
                return
            both = a
        elif not messagebox.askyesno("Delete run", f"Delete '{r['label']}' from this computer?"):
            return

        def finish_local(_=None, e=None):
            if e:
                messagebox.showerror("Could not delete on hCRI.io", f"{e}\nThe run was not deleted here either.")
                return
            for ext in (".json", ".csv"):
                try:
                    os.remove(r["_base"] + ext)
                except OSError:
                    pass
            self.runs.remove(r)
            self.fill_tree()
            self.msg("Deleted.")
        if both:
            self.bg(lambda: api(self.site, self.token(), "POST", "/v1/runtime?delete=" + rem["id"]), finish_local, "Deleting on hCRI.io")
        else:
            finish_local()

    def open_site(self):
        r = None
        sel = self.tree.selection()
        if sel:
            r = self.runs[int(sel[0])]
        url = ((r or {}).get("meta", {}).get("remote") or {}).get("shareUrl") or self.site
        webbrowser.open(url)

    def open_folder(self):
        try:
            if sys.platform.startswith("win"):
                os.startfile(self.outdir)       # noqa
            elif sys.platform == "darwin":
                import subprocess
                subprocess.Popen(["open", self.outdir])
            else:
                import subprocess
                subprocess.Popen(["xdg-open", self.outdir])
        except Exception as e:
            messagebox.showinfo("Runs folder", f"{self.outdir}\n\n({e})")

    def copy(self, text):
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
        except tk.TclError:
            pass

    def on_close(self):
        self.commit_limits()
        if self.recording:
            messagebox.showinfo("Recording", "A run is being recorded. Press Stop run to save it, then close the window.")
            return
        self.drop_source()
        self.root.destroy()


def run_gui(args, cfg):
    """Opens the window. Returns False if there is no tkinter or no screen (the terminal version is used then)."""
    if tk is None:
        print("This Python has no tkinter, so the terminal version is used. (Mac Homebrew: brew install python-tk. "
              "Linux: install python3-tk. Or use Python from python.org.)")
        return False
    try:
        if sys.platform == "win32":
            # Own taskbar identity, so Windows shows the hCRI.io icon instead of grouping the window under Python.
            try:
                import ctypes
                ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID("io.hcri.tklamplive")
            except Exception:
                pass
        root = tk.Tk()
    except tk.TclError as e:
        print(f"Could not open a window ({e}); using the terminal version. Use --cli to skip this check.")
        return False
    TkApp(root, args, cfg)
    root.mainloop()
    return True


def main():
    ap = argparse.ArgumentParser(description="Live logger for a TKLamp TK2303D tester, with upload to hCRI.io Runtime.")
    ap.add_argument("--port", help="Serial port (COM5, /dev/tty.usbserial-..., /dev/ttyUSB0). Default: find it.")
    ap.add_argument("--scale", type=float, help=f"Counts per lumen (default {DEFAULT_SCALE}, or the saved one)")
    ap.add_argument("--calibrate", type=float, metavar="LUMENS", help="Set the scale from a lamp of this known output")
    ap.add_argument("--duration", type=float, metavar="MIN", help="Stop by itself after this many minutes")
    ap.add_argument("--start-at", type=float, metavar="LM", help="Wait until the light reaches this many lumens, then start recording")
    ap.add_argument("--stop-below", type=float, metavar="LM", help="Stop when the output stays below this many lumens (after it has been above it)")
    ap.add_argument("--idle-timeout", type=float, metavar="MIN", help=f"Stop when no reading has arrived for this many minutes (default {DEFAULT_IDLE_MIN}; 0 = off)")
    ap.add_argument("--save-settings", action="store_true", help="Remember --start-at, --stop-below, --duration and --idle-timeout for next time")
    ap.add_argument("--no-trim", action="store_true", help="Keep the dark start of the run (default: trimmed)")
    ap.add_argument("--output-dir", default=None, help="Where to save runs (default: the current folder in the terminal, "
                    "'TKLamp runs' in your home folder in the window)")
    ap.add_argument("--cli", action="store_true", help="Use the terminal instead of the window")
    ap.add_argument("--no-readout", action="store_true", help="Do not print or show the time and lumens line each second")
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
    limits = limits_from_cfg(cfg)
    for key, val in (("start_at", args.start_at), ("stop_below", args.stop_below), ("duration", args.duration), ("idle_min", args.idle_timeout)):
        if val is not None:
            limits[key] = val
    if args.save_settings:
        cfg["limits"] = limits
        save_config(cfg)
        print("Run limits remembered.")

    if args.upload:
        with open(args.upload, "r", encoding="utf-8") as f:
            run = json.load(f)
        finish(args, cfg, run["label"], run["intervalSeconds"], run["values"], run.get("meta", {}), os.path.splitext(args.upload)[0])
        return

    if not (args.cli or args.calibrate):
        if run_gui(args, cfg):
            return
    if not args.output_dir:
        args.output_dir = "."
    ser = open_port(args, scale)
    try:
        if args.calibrate:
            calibrate(ser, scale, args.calibrate, cfg)
            return
        os.makedirs(args.output_dir, exist_ok=True)
        stamp = datetime.datetime.now().strftime("%Y-%m-%d-%H.%M.%S")
        spool_path = os.path.join(args.output_dir, f"TKLamp_{stamp}.partial.csv")
        spool_written[0] = 0
        res = live(ser, scale, limits, spool_path, not args.no_readout)
    finally:
        ser.close()
    if not res:
        print("Nothing recorded.")
        return
    pts, started, ended, spool, reason = res
    if spool:
        spool.close()
    run = build_run(pts, started, ended, scale, not args.no_trim)
    if not run:
        print("The recording was too short to keep (needs at least 2 seconds of readings).")
        return
    step, vals, meta, label = run["intervalSeconds"], run["values"], run["meta"], run["label"]
    started = datetime.datetime.strptime(meta["started"], TS)
    trimmed = meta["trimmedLeadingSeconds"]
    print(f"\nRun: {fmt_clock(meta['durationSeconds'])} long, {len(pts)} readings, {vals[0]:.0f} -> {vals[-1]:.0f} lm"
          + (f"  (dark start trimmed: {trimmed:g} s)" if trimmed else ""))
    print(f"Started {meta['started']}   Ended {meta['ended']}")
    base = os.path.join(args.output_dir, f"TKLamp_{stamp}")
    try:
        os.remove(spool_path)           # the finished run supersedes the crash-safety copy
    except OSError:
        pass
    finish(args, cfg, label, step, vals, meta, base)


if __name__ == "__main__":
    main()
