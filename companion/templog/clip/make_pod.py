"""Sensor + laser pod for a camera-style spring clamp with a ball head (version 0: sizes are assumptions, print a fit test first).

Run:  python3 make_pod.py   ->  sensor_pod.stl   (needs: pip install manifold3d trimesh numpy)
Edit the numbers below (millimetres) to match your parts, then run again.

The pod screws onto the 1/4"-20 stud of the ball head (a standard camera thread). The stud goes up through a 6.8 mm hole in the
floor into a 1/4"-20 hex nut held in a pocket; slide the nut in from the back through the slot. The sensor and a 6 mm aiming laser sit
side by side and look straight out of the front face (+Y). With the stud pointing up, they point sideways; tilt the ball head to aim.
The back is open: the sensor board (with its plug) and the laser slide in from the back, wires leave through the back.
"""
import math
import numpy as np
import trimesh
from manifold3d import Manifold

# ---- sizes you can change -------------------------------------------------------------------------------------------
WALL = 2.5
SENSOR_BARREL_D = 9.5     # measured can 9.0 mm + 0.5 clearance
SENSOR_BARREL_LEN = 19.5  # the black tube is 19 mm long (board to tip); the board stops against the step at its base
BOARD_W, BOARD_H = 12.5 + 0.4, 18.0 + 0.4   # measured: board 12.5 wide, 18 tall with the plug on, plus clearance
LASER_D = 6.2             # 6 mm laser module plus clearance
LASER_WALL = -0.1         # no wall: the two bores overlap slightly, so the laser and the sensor can sit almost touching (about 0.25 mm apart)
LASER_LUG = 12.0          # depth of the laser's bore, at the front (the laser is short; its wires leave into the open space behind)
BACK_SPACE = 12.5         # measured: board with its pins and plug is 12 mm thick, plus 0.5 clearance
STUD_HOLE_D = 6.8         # 1/4"-20 stud clearance
NUT_AF = 11.1 + 0.4       # 1/4"-20 hex nut across flats plus clearance
NUT_H = 5.8               # nut thickness plus clearance
FLOOR = 2.0               # plastic under the nut: the measured stud is 5.83 mm long, so a thinner floor lets it reach about 3.8 mm into the nut
ROOF = 2.2                # plastic between the nut pocket and the sensor cavity
TAB_W, TAB_L, TAB_T = 18.0, 10.0, FLOOR     # cable tab at the back of the floor: same thickness as the floor, so the nut still slides in over it
TIE_SLOT_W, TIE_SLOT_T = 3.2, 1.6           # fits a 2.5 mm wide zip tie
TIE_SLOT_X, TIE_SLOT_Y = 5.5, 5.0           # slot centre offset from the tab centre line, and distance behind the back face
GROOVE_W, GROOVE_D = 6.4, 0.6               # shallow cradle for a 6 mm sleeve
# ----------------------------------------------------------------------------------------------------------------------

HOLE_SPACING = SENSOR_BARREL_D / 2 + LASER_WALL + LASER_D / 2   # sensor centre to laser centre at the front face
sx, lx = -HOLE_SPACING / 2, HOLE_SPACING / 2
D = SENSOR_BARREL_LEN + BACK_SPACE + 0.0       # front face at y = D, open back at y = 0
cav_z0 = FLOOR + NUT_H + ROOF
H = cav_z0 + BOARD_H + WALL
cz = cav_z0 + BOARD_H / 2


def box(x, y, z, dx, dy, dz):
    return Manifold.cube((dx, dy, dz)).translate((x, y, z))


def cyl_y(d, length, cx, cz_, y0):
    return Manifold.cylinder(length, d / 2, d / 2, 48).rotate((-90, 0, 0)).translate((cx, y0, cz_))


def to_trimesh(man):
    ms = man.to_mesh()
    return trimesh.Trimesh(vertices=np.asarray(ms.vert_properties)[:, :3], faces=np.asarray(ms.tri_verts))


def make_pod():
    """The laser bore is straight, parallel to the sensor (the dot lands HOLE_SPACING mm to the side of the sensor's spot)."""
    x_min = sx - BOARD_W / 2 - WALL
    x_max = lx + LASER_D / 2 + WALL
    W = x_max - x_min
    cx_body = (x_min + x_max) / 2
    body = box(x_min, 0, 0, W, D, H)
    tab_cx = (sx + lx) / 2
    body = body + box(tab_cx - TAB_W / 2, -TAB_L, 0, TAB_W, TAB_L + 0.5, TAB_T)
    cuts = [
        cyl_y(SENSOR_BARREL_D, SENSOR_BARREL_LEN + 0.5, sx, cz, D - SENSOR_BARREL_LEN),             # barrel bore through the front
        box(sx - BOARD_W / 2, -0.5, cz - BOARD_H / 2, BOARD_W, D - SENSOR_BARREL_LEN + 0.5, BOARD_H),  # board pocket, open at the back
    ]
    # laser bore: straight, through the front lug and on out the back
    cuts.append(cyl_y(LASER_D, D + 1, lx, cz, -0.5))
    # relief behind the lug so the laser body and its wires have room (open at the back and to the +x side)
    rx0 = sx + BOARD_W / 2 + WALL
    cuts.append(box(rx0, -0.5, cz - 6.0, x_max - rx0 + 1, D - LASER_LUG + 0.5, 12.0))
    # stud hole up through the floor, hex nut pocket above it, slot out the back to slide the nut in
    sy = D / 2
    cuts.append(Manifold.cylinder(FLOOR + 0.5, STUD_HOLE_D / 2, STUD_HOLE_D / 2, 40).translate((cx_body, sy, -0.25)))
    r = (NUT_AF / 2) / math.cos(math.radians(30))
    cuts.append(Manifold.cylinder(NUT_H, r, r, 6).rotate((0, 0, 90)).translate((cx_body, sy, FLOOR)))
    cuts.append(box(cx_body - NUT_AF / 2, -0.5, FLOOR, NUT_AF, sy + 0.5, NUT_H))
    # zip-tie slots and groove in the cable tab
    for sgn in (-1, 1):
        cuts.append(box(tab_cx + sgn * TIE_SLOT_X - TIE_SLOT_W / 2, -TIE_SLOT_Y - TIE_SLOT_T / 2, -0.5, TIE_SLOT_W, TIE_SLOT_T, TAB_T + 1))
    cuts.append(box(tab_cx - GROOVE_W / 2, -TAB_L - 0.5, TAB_T - GROOVE_D, GROOVE_W, TAB_L + 0.5, GROOVE_D + 0.5))
    for c in cuts:
        body = body - c
    return to_trimesh(body)


print(f'laser-to-sensor centre spacing: {HOLE_SPACING:.2f} mm')
m = make_pod()
m.export('sensor_pod.stl')
print('pod watertight:', m.is_watertight, ' size mm (x, y, z):', [round(float(v), 1) for v in m.extents])
