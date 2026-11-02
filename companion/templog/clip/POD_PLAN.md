# Sensor + laser pod: plan (saved Nov 2, 2026)

Parts (measured): MLX90614 can 9 mm; board 12.5 mm wide, 19 mm tall (18 mm with plug); laser 6 mm; clamp stud 1/4"-20.
Mount: ball-head spring clamp on the side of the TKLamp, sensor pointing sideways. Sensor-to-target distance not known yet.

Laser aiming: the laser sits beside the sensor (spacing S), so it is tilted in toward the sensor's line of sight.
tan(tilt) = S / (aim distance + h), where h is the distance from the plug's mid-plane to the pod front face.

Plugs (decided with Marc):
- Three swappable plugs, for aim distances of 30, 50 and 100 mm.
- Each plug slides into one round socket in the pod, flange against the front face. A flat on the bottom of the plug (and socket) means it only fits one way.
- Push a plug out from the open back to swap it.
- The pod has a relief cut behind the socket so the laser body can lean back at the angle.
- Cable tab (10 mm long, 18 mm wide) at the back of the floor: two zip-tie slots (3.2 x 1.6 mm) with a shallow groove between them for a 6 mm braided sleeve. The tie goes down one slot, under the tab, up the other and around the cable.

Files: make_pod.py (parameters at the top) writes sensor_pod.stl and laser_plug_*mm.stl.
Print: pod with the open back up, front face on the bed, no supports; plugs flange down.
Open questions: stud length, true sensor distance, fit of the 15 mm back space.
