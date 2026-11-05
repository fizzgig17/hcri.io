# Sensor + laser pod: plan (saved Nov 2, 2026)

Parts (measured): MLX90614 can 9 mm; board 12.5 mm wide, 19 mm tall (18 mm with plug); laser 6 mm; clamp stud 1/4"-20.
Mount: ball-head spring clamp on the side of the TKLamp, sensor pointing sideways. Sensor-to-target distance not known yet.

Laser aiming: the laser sits beside the sensor (spacing S), so it is tilted in toward the sensor's line of sight.
tan(tilt) = S / (aim distance + h), where h is the distance from the plug's mid-plane to the pod front face.

Laser placement (changed Nov 5, 2026 at Marc's request: laser as close to the sensor as possible):
- The laser bore sits right beside the sensor can with 0.8 mm of plastic between them: centre spacing 8.65 mm. A small wall keeps laser heat off the can.
- The laser is short, so it sits in a 12 mm tilted bore at the front; its wires leave into a relief space behind (open at the back and the +x side).
- Swappable plugs no longer fit at this spacing (they need about 12 mm of width), so there is one pod per aim distance: sensor_pod_30mm / 50mm / 100mm.stl. The earlier plug design is in git history (commit af7b845).
- Cable tab (10 mm long, 18 mm wide) at the back of the floor: two zip-tie slots (3.2 x 1.6 mm) with a shallow groove between them for a 6 mm braided sleeve. The tie goes down one slot, under the tab, up the other and around the cable.

Files: make_pod.py (parameters at the top) writes sensor_pod_30mm.stl, sensor_pod_50mm.stl and sensor_pod_100mm.stl.
Print: pod with the open back up, front face on the bed, no supports.
Open questions: stud length, true sensor distance, fit of the 15 mm back space.
