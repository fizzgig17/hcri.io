# Sensor + laser pod: plan (saved Nov 2, 2026)

Parts (measured): sensor tube 9 mm across and 19 mm long (board to tip); board 12.5 mm wide, 18 mm tall with the plug on; laser 6 mm across, about 13 to 14 mm long with its solder tabs (from a photo); clamp stud 1/4"-20.
Mount: ball-head spring clamp on the side of the TKLamp, sensor pointing sideways. Sensor-to-target distance not known yet.

Laser aiming: the laser sits beside the sensor (spacing S), so it is tilted in toward the sensor's line of sight.
tan(tilt) = S / (aim distance + h), where h is the distance from the plug's mid-plane to the pod front face.

Laser placement (changed Nov 5, 2026 at Marc's request):
- The laser sits right beside the sensor can with no wall between them (the two bores overlap slightly; centre spacing 7.75 mm, parts about 0.25 mm apart) and points straight ahead, parallel to the sensor. No tilt, no plugs. The dot lands 7.75 mm to the side of the sensor's spot.
- The laser is short, so it sits in a 12 mm bore at the front; its wires leave into a relief space behind (open at the back and the +x side).
- Earlier designs (tilted laser, swappable plugs) are in git history (commit af7b845).
- Cable tab (10 mm long, 18 mm wide) at the back of the floor: two zip-tie slots (3.2 x 1.6 mm) with a shallow groove between them for a 6 mm braided sleeve. The tie goes down one slot, under the tab, up the other and around the cable.

Files: make_pod.py (parameters at the top) writes sensor_pod.stl.
Print: pod with the open back up, front face on the bed, no supports.
Open questions: stud length, true sensor distance, fit of the 15 mm back space.
