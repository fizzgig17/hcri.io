# hCRI Temp Logger: Raspberry Pi Pico (RP2040) firmware for up to 8 MLX90614 infrared thermometers behind a TCA9548A.
# MicroPython. Copy this file to the Pico as main.py. It prints one line a second over the USB cable:
#
#   T,<seconds>,<obj1>,<obj2>,<obj3>,<amb1>,<amb2>,<amb3>      object and sensor (ambient) temperatures in degrees C
#
# A sensor that is missing or fails leaves its fields empty. Commands you can send back over the same cable:
#   ?            print the status line
#   E <n> <e>    emissivity for sensor n (1-based), 0.1 to 1.0; saved on the Pico (1.0 = the sensor's own reading)
#
# Wiring (see the build page): Pico GP4 = SDA, GP5 = SCL, 3V3 and GND to the TCA9548A; each GY-906 board on one
# TCA9548A channel (SD0/SC0, SD1/SC1, SD2/SC2), all at the sensors' default address 0x5A.

VERSION = "2026.11.01.1"
SENSORS = 3          # how many channels are read (0 to 7 on the multiplexer)
MUX_ADDR = 0x70
MLX_ADDR = 0x5A
REG_AMBIENT = 0x06
REG_OBJECT = 0x07
PERIOD_MS = 1000


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


def line(seconds, objs, ambs):
    return "T,%.1f,%s,%s" % (seconds, ",".join(fmt(v) for v in objs), ",".join(fmt(v) for v in ambs))


def main():
    import sys, time, json, select
    from machine import I2C, Pin

    i2c = I2C(0, sda=Pin(4), scl=Pin(5), freq=100000)   # the sensors are SMBus parts: 100 kHz at most
    emis = [1.0] * SENSORS
    try:
        with open("config.json") as f:
            saved = json.load(f).get("emis", [])
        for i, e in enumerate(saved[:SENSORS]):
            emis[i] = max(0.1, min(1.0, float(e)))
    except Exception:
        pass

    def save():
        try:
            with open("config.json", "w") as f:
                json.dump({"emis": emis}, f)
        except Exception:
            pass

    def read(ch, reg):
        for _ in range(3):
            try:
                i2c.writeto(MUX_ADDR, bytes([1 << ch]))
                v = decode(reg, i2c.readfrom_mem(MLX_ADDR, reg, 3))
                if v is not None:
                    return v
            except OSError:
                pass
            time.sleep_ms(5)
        return None

    def status():
        found = []
        for ch in range(SENSORS):
            found.append("1" if read(ch, REG_AMBIENT) is not None else "0")
        print("# hCRI temp logger %s sensors=%s emis=%s" % (VERSION, "".join(found), ",".join("%.2f" % e for e in emis)))

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
        else:
            print("# unknown command (try ?)")

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
        objs, ambs = [], []
        for ch in range(SENSORS):
            o, a = read(ch, REG_OBJECT), read(ch, REG_AMBIENT)
            objs.append(correct(o, a, emis[ch]))
            ambs.append(a)
        try:
            i2c.writeto(MUX_ADDR, b"\x00")   # leave every channel off between reads
        except OSError:
            pass
        print(line(time.ticks_diff(time.ticks_ms(), t0) / 1000, objs, ambs))


if __name__ == "__main__":
    main()
