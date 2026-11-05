# Sensor + laser pod: plan (saved Nov 2, 2026)

Parts (measured): sensor tube 9 mm across its whole length and 19 mm long (board to tip); board with pins and plug 12 mm thick; board 12.5 mm wide, 18 mm tall with the plug on; laser body 5.93 mm across and 7 mm long, then a small board 6.13 mm wide; 13.36 mm long in all, without wires; clamp stud 1/4"-20, 5.83 mm of thread sticking out (assuming that is its length).
Mount: ball-head spring clamp on the side of the TKLamp, sensor pointing sideways. Sensor-to-target distance not known yet.

Laser aiming: the laser sits beside the sensor (spacing S), so it is tilted in toward the sensor's line of sight.
tan(tilt) = S / (aim distance + h), where h is the distance from the plug's mid-plane to the pod front face.

Laser placement (changed Nov 5, 2026 at Marc's request):
- The laser sits right beside the sensor can with no wall between them (the two bores overlap slightly; centre spacing 7.75 mm, parts about 0.25 mm apart) and points straight ahead, parallel to the sensor. No tilt, no plugs. The dot lands 7.75 mm to the side of the sensor's spot.
- The laser bore is straight and runs through the pod, so the laser pushes in from the back (install the laser first, then the sensor board). The front 7.5 mm is snug (6.2 mm); behind it the bore opens to 6.5 mm. There is no side opening any more.
- Earlier designs (tilted laser, swappable plugs) are in git history (commit af7b845).
- Mounting (changed Nov 5, 2026): the stud now enters from the BACK. A solid block under the back end (15 mm tall) holds a hex nut; the stud goes in through the block's 2 mm rear wall and points forward, parallel to the sensor, about 19 mm below its centre. Nut slides in from underneath. The pod's bottom is a plain floor again.
- Cable tab (10 mm long, 18 mm wide) moved to the top edge at the back: two zip-tie slots (3.2 x 1.6 mm) and a shallow groove on its underside; the cable lies under the tab and the tie goes up through both slots.
- Edge cap (make_edge_cap.py -> edge_cap.stl): slides over the 8.64 mm case wall (9.04 mm slot, 14.04 mm outside, 50 mm long, 22 mm deep). The clamp jaws are a wedge when closed (0 mm at the tips, 14 mm at the top, 27.5 mm fully open), so they grip flat across the pads on something about 14 mm thick; the cap makes the case edge that thick.

Files: make_pod.py (parameters at the top) writes sensor_pod.stl.
Print: pod with the open back up, front face on the bed, no supports.
Open questions: stud length, true sensor distance, fit of the 15 mm back space.
