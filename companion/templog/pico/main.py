# hCRI Temp Logger: Raspberry Pi Pico (RP2040) firmware for up to 8 MLX90614 infrared thermometers behind a TCA9548A.
# MicroPython. Copy this file to the Pico as main.py. It prints one line a second over the USB cable:
#
#   T,<seconds>,<obj1>,<obj2>,<obj3>,<amb1>,<amb2>,<amb3>      object and sensor (ambient) temperatures in degrees C
#   C,<seconds>,<die>,<min>,<max>,<avg>,<hot_x>,<hot_y>,<p0>,...,<p767>      MLX90640 thermal camera, same <seconds> as the T line:
#                                    sensor die temperature, coldest / hottest / average pixel, the hottest pixel's column
#                                    (0-31) and row (0-23), then all 768 pixel temperatures row by row (24 rows of 32), 1 decimal
#
# A sensor that is missing or fails leaves its fields empty. Commands you can send back over the same cable:
#   ?            print the status line
#   E <n> <e>    emissivity for sensor n (1-based), 0.1 to 1.0; saved on the Pico (1.0 = the sensor's own reading)
#   CE <e>       emissivity for the thermal camera, 0.1 to 1.0 (default 0.95); saved on the Pico
#   CAM <0|1>    turn the thermal camera off or on (saved); with it off the T lines come once a second again
#
# Wiring (see the build page): Pico GP4 = SDA, GP5 = SCL, 3V3 and GND to the TCA9548A; each GY-906 board on one
# TCA9548A channel (SD0/SC0, SD1/SC1, SD2/SC2), all at the sensors' default address 0x5A.
# With no TCA9548A connected, ONE sensor can go straight on GP4/GP5 (it is read as sensor 1).
# The MLX90640 thermal camera has its own bus so it can run fast: Pico GP6 = SDA, GP7 = SCL (I2C1, 400 kHz), 3V3 and GND.
# Copy mlx90640.py to the Pico too. With no camera connected nothing changes.

VERSION = "2026.11.13.1"
SENSORS = 3          # how many channels are read (0 to 7 on the multiplexer)
MUX_ADDR = 0x70
MLX_ADDR = 0x5A
REG_AMBIENT = 0x06
REG_OBJECT = 0x07
PERIOD_MS = 1000
CAM_SDA, CAM_SCL = 6, 7
CAM_W, CAM_H = 32, 24
CAM_BAD = -200.0     # pixels below this are dead pixels the camera could not compute
CAM_HZ = 400000      # camera bus speed; if the camera keeps timing out, try 200000 (or 100000) and keep its wires short
CPU_MHZ = 125        # the Pico's stock clock; 200 makes the camera maths about 1.5x faster and is normally fine


def crc8(data):
    """The SMBus packet error code (polynomial 0x07) the MLX90614 appends to every read."""
    crc = 0
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = ((crc << 1) ^ 0x07) & 0xFF if crc & 0x80 else (crc << 1) & 0xFF
    return crc


def decode(reg, data):
    """Three bytes (low, high, PEC) from the sensor -> degrees C, or None when the packet is bad or flagged as an error."""
    if len(data) != 3:
        return None
    if crc8(bytes([MLX_ADDR << 1, reg, (MLX_ADDR << 1) | 1, data[0], data[1]])) != data[2]:
        return None
    raw = data[0] | (data[1] << 8)
    if raw & 0x8000:      # the sensor flags an invalid reading in the top bit
        return None
    return raw * 0.02 - 273.15


def correct(obj_c, amb_c, emis):
    """Object temperature for a surface that is not a perfect radiator. The sensor assumes emissivity 1; undo that and
    use the real one (the reflected light is taken to be at the sensor's own temperature)."""
    if emis >= 0.999 or obj_c is None or amb_c is None:
        return obj_c
    to = obj_c + 273.15
    ta = amb_c + 273.15
    inner = (to ** 4 - ta ** 4) / emis + ta ** 4
    return inner ** 0.25 - 273.15 if inner > 0 else obj_c


def fmt(v):
    return "" if v is None else "%.2f" % v


def fix_bad(frame):
    """Dead pixels come back as -273.15: copy the nearest good pixel to the left or right so the picture has no holes.
    Returns how many were repaired."""
    n = 0
    for i in range(len(frame)):
        if frame[i] > CAM_BAD:
            continue
        x = i % CAM_W
        for j in (i - 1, i + 1, i - CAM_W, i + CAM_W):
            if 0 <= j < len(frame) and (j // CAM_W == i // CAM_W or j % CAM_W == x) and frame[j] > CAM_BAD:
                frame[i] = frame[j]
                n += 1
                break
    return n


def summarize(frame):
    """(coldest, hottest, average, hottest column, hottest row) over the good pixels, or None when there are none."""
    lo = hi = None
    total = 0.0
    count = 0
    hot = 0
    for i in range(len(frame)):
        v = frame[i]
        if v <= CAM_BAD:
            continue
        total += v
        count += 1
        if lo is None or v < lo:
            lo = v
        if hi is None or v > hi:
            hi = v
            hot = i
    if not count:
        return None
    return lo, hi, total / count, hot % CAM_W, hot // CAM_W


def cam_line(seconds, die, frame):
    """The C line for one camera frame (see the top of this file), or None when the frame has no good pixels."""
    s = summarize(frame)
    if s is None:
        return None
    lo, hi, avg, hx, hy = s
    return "C,%.1f,%.2f,%.1f,%.1f,%.1f,%d,%d,%s" % (seconds, die, lo, hi, avg, hx, hy, ",".join("%.1f" % v for v in frame))


def line(seconds, objs, ambs):
    return "T,%.1f,%s,%s" % (seconds, ",".join(fmt(v) for v in objs), ",".join(fmt(v) for v in ambs))


def main():
    import sys, time, json, select, gc
    from machine import I2C, Pin

    if CPU_MHZ != 125:
        import machine
        machine.freq(CPU_MHZ * 1000000)
    i2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=100000)   # the sensors are SMBus parts: 100 kHz at most
    emis = [1.0] * SENSORS
    cam_cfg = {"on": True, "emis": 0.95}
    mux = [False]   # is a TCA9548A answering? (checked at start and whenever you send ?)
    cam = [None]    # the MLX90640 driver once the camera has answered
    frame = [None]
    fails = [0]     # camera reads that failed in a row
    lost = [False]  # the camera was working and then dropped off

    def find_mux():
        try:
            mux[0] = MUX_ADDR in i2c.scan()
        except OSError:
            mux[0] = False
    try:
        with open("config.json") as f:
            conf = json.load(f)
        for i, e in enumerate(conf.get("emis", [])[:SENSORS]):
            emis[i] = max(0.1, min(1.0, float(e)))
        cam_cfg["on"] = bool(conf.get("cam", True))
        cam_cfg["emis"] = max(0.1, min(1.0, float(conf.get("cam_emis", 0.95))))
    except Exception:
        pass

    def save():
        try:
            with open("config.json", "w") as f:
                json.dump({"emis": emis, "cam": cam_cfg["on"], "cam_emis": cam_cfg["emis"]}, f)
        except Exception:
            pass

    def find_cam():
        """Try to start the thermal camera; leaves cam[0] None when it is off, missing or the driver file is not on the Pico."""
        cam[0] = None
        if not cam_cfg["on"]:
            return
        try:
            bus = I2C(1, sda=Pin(CAM_SDA), scl=Pin(CAM_SCL), freq=CAM_HZ)
            if 0x33 not in bus.scan():
                return
            import mlx90640
            gc.collect()
            c = mlx90640.MLX90640(bus)
            c.refresh_rate = mlx90640.RefreshRate.REFRESH_4_HZ
            if frame[0] is None:
                frame[0] = mlx90640.init_float_array(CAM_W * CAM_H)
            cam[0] = c
            fails[0] = 0
        except Exception as e:
            print("# camera error: %s" % e)
        gc.collect()

    def read_cam():
        """One full camera frame -> (die temperature, frame), or None when it could not be read."""
        if cam[0] is None:
            return None
        try:
            die = cam[0].get_frame(frame[0], cam_cfg["emis"])
            fix_bad(frame[0])
            fails[0] = 0
            return die, frame[0]
        except Exception as e:      # a bad read (or a math error on a bad pixel) skips this frame
            fails[0] += 1
            if fails[0] in (1, 3):
                print("# camera read failed: %s" % e)
            if fails[0] >= 3:       # the camera has dropped off the bus: forget it and keep trying to find it again
                cam[0] = None
                lost[0] = True
                print("# camera lost: check its wires; trying to reconnect")
            return None

    def read(ch, reg):
        if not mux[0] and ch != 0:
            return None      # without the multiplexer only one sensor can be on the bus
        for _ in range(3):
            try:
                if mux[0]:
                    i2c.writeto(MUX_ADDR, bytes([1 << ch]))
                v = decode(reg, i2c.readfrom_mem(MLX_ADDR, reg, 3))
                if v is not None:
                    return v
            except OSError:
                pass
            time.sleep_ms(5)
        return None

    def status():
        find_mux()
        found = []
        for ch in range(SENSORS):
            found.append("1" if read(ch, REG_AMBIENT) is not None else "0")
        if cam[0] is None:
            find_cam()
        print("# hCRI temp logger %s mux=%s sensors=%s emis=%s cam=%s camemis=%.2f" % (
            VERSION, "1" if mux[0] else "0", "".join(found), ",".join("%.2f" % e for e in emis),
            "1" if cam[0] is not None else "0", cam_cfg["emis"]))

    def command(text):
        p = text.split()
        if not p:
            return
        if p[0] == "?":
            status()
        elif p[0].upper() == "E" and len(p) == 3:
            try:
                n, e = int(p[1]), float(p[2])
                if 1 <= n <= SENSORS and 0.1 <= e <= 1.0:
                    emis[n - 1] = e
                    save()
                    status()
                    return
            except ValueError:
                pass
            print("# E needs a sensor number 1-%d and an emissivity from 0.1 to 1.0" % SENSORS)
        elif p[0].upper() == "CE" and len(p) == 2:
            try:
                e = float(p[1])
                if 0.1 <= e <= 1.0:
                    cam_cfg["emis"] = e
                    save()
                    status()
                    return
            except ValueError:
                pass
            print("# CE needs an emissivity from 0.1 to 1.0")
        elif p[0].upper() == "CAM" and len(p) == 2 and p[1] in ("0", "1"):
            cam_cfg["on"] = p[1] == "1"
            cam[0] = None
            save()
            status()
        else:
            print("# unknown command (try ?)")

    def now_s():
        return time.ticks_diff(time.ticks_ms(), t0) / 1000

    poll = select.poll()
    poll.register(sys.stdin, select.POLLIN)
    t0 = time.ticks_ms()
    status()
    nxt = time.ticks_add(t0, PERIOD_MS)
    while True:
        while time.ticks_diff(nxt, time.ticks_ms()) > 0:
            if poll.poll(20):
                command(sys.stdin.readline())
        nxt = time.ticks_add(nxt, PERIOD_MS)
        if time.ticks_diff(time.ticks_ms(), nxt) > 0:    # the camera maths ran long: skip ahead instead of racing to catch up
            nxt = time.ticks_add(time.ticks_ms(), 50)
        # The camera frame comes first (it takes the longest), then the infrared sensors straight after it, so both
        # describe the same moment; the two lines share one timestamp.
        if cam[0] is None and lost[0] and cam_cfg["on"] and (now_s() % 5) < 1.0:
            find_cam()                  # every 5 seconds or so while it is missing
            if cam[0] is not None:
                lost[0] = False
                print("# camera reconnected")
        shot = read_cam()
        objs, ambs = [], []
        for ch in range(SENSORS):
            o, a = read(ch, REG_OBJECT), read(ch, REG_AMBIENT)
            objs.append(correct(o, a, emis[ch]))
            ambs.append(a)
        if mux[0]:
            try:
                i2c.writeto(MUX_ADDR, b"\x00")   # leave every channel off between reads
            except OSError:
                pass
        now = time.ticks_diff(time.ticks_ms(), t0) / 1000
        print(line(now, objs, ambs))
        if shot is not None:
            out = cam_line(now, shot[0], shot[1])
            if out is not None:
                print(out)
            gc.collect()


if __name__ == "__main__":
    main()
