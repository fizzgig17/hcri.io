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
SENSOR_BARREL_LEN = 12.0  # how much of the barrel sits in the front bore
BOARD_W, BOARD_H = 17.4, 12.4   # the GY-906 PCB (width, height) plus clearance
LASER_D = 6.2             # 6 mm laser module plus clearance
HOLE_SPACING = 15.0       # sensor centre to laser centre
BACK_SPACE = 15.0         # room behind the barrel for the board and its plug
STUD_HOLE_D = 6.8         # 1/4"-20 stud clearance
NUT_AF = 11.1 + 0.4       # 1/4"-20 hex nut across flats plus clearance
NUT_H = 5.8               # nut thickness plus clearance
FLOOR = 2.5               # plastic under the nut (the stud is only about 6 mm long)
ROOF = 2.2                # plastic between the nut pocket and the sensor cavity
# ----------------------------------------------------------------------------------------------------------------------

sx, lx = -HOLE_SPACING / 2, HOLE_SPACING / 2
x_min = sx - BOARD_W / 2 - WALL
x_max = max(lx + LASER_D / 2, sx + BOARD_W / 2) + WALL
W = x_max - x_min
D = SENSOR_BARREL_LEN + BACK_SPACE + 0.0       # front face at y = D, open back at y = 0
cav_z0 = FLOOR + NUT_H + ROOF
H = cav_z0 + BOARD_H + WALL
cz = cav_z0 + BOARD_H / 2
cx_body = (x_min + x_max) / 2


def box(x, y, z, dx, dy, dz):
    return Manifold.cube((dx, dy, dz)).translate((x, y, z))


def cyl_y(d, length, cx, cz_, y0):
    return Manifold.cylinder(length, d / 2, d / 2, 48).rotate((-90, 0, 0)).translate((cx, y0, cz_))


body = box(x_min, 0, 0, W, D, H)
cuts = [
    cyl_y(SENSOR_BARREL_D, SENSOR_BARREL_LEN + 0.5, sx, cz, D - SENSOR_BARREL_LEN),             # barrel bore through the front
    box(sx - BOARD_W / 2, -0.5, cz - BOARD_H / 2, BOARD_W, D - SENSOR_BARREL_LEN + 0.5, BOARD_H),  # board pocket, open at the back
    cyl_y(LASER_D, D + 1, lx, cz, -0.5),                                                         # laser bore, through
]
# stud hole up through the floor, hex nut pocket above it, slot out the back to slide the nut in
sy = D / 2
cuts.append(Manifold.cylinder(FLOOR + 0.5, STUD_HOLE_D / 2, STUD_HOLE_D / 2, 40).translate((cx_body, sy, -0.25)))
r = (NUT_AF / 2) / math.cos(math.radians(30))
hexp = Manifold.cylinder(NUT_H, r, r, 6).rotate((0, 0, 90)).translate((cx_body, sy, FLOOR))
cuts.append(hexp)
cuts.append(box(cx_body - NUT_AF / 2, -0.5, FLOOR, NUT_AF, sy + 0.5, NUT_H))
for c in cuts:
    body = body - c

mesh = body.to_mesh()
m = trimesh.Trimesh(vertices=np.asarray(mesh.vert_properties)[:, :3], faces=np.asarray(mesh.tri_verts))
m.export('sensor_pod.stl')
print('watertight:', m.is_watertight, ' size mm (x, y, z):', [round(v, 1) for v in m.extents], ' volume cm3:', round(m.volume / 1000, 2))
