"""Sensor + laser pod for a camera-style spring clamp with a ball head.

Run:  python3 make_pod.py   ->  sensor_pod.stl   (needs: pip install manifold3d trimesh numpy)
Edit the numbers below (millimetres) to match your parts, then run again.

The sensor tube and a 6 mm aiming laser sit side by side and look straight out of the front face (+Y). The back is open: the sensor
board (with its plug) and the laser slide in from the back, and the wires leave through the back.
The pod screws onto the 1/4"-20 stud of the ball head from BEHIND: a solid mounting block along the bottom (reaching 7.8 mm behind the back face) holds a hex nut, and
the stud goes in through the block's rear wall and points forward, parallel to the sensor. Slide the nut in from underneath.
A small tab on the top edge at the back anchors the cable with a zip tie.
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
LASER_D = 6.2             # laser body measured 5.93 mm, plus clearance (the front part of the bore)
LASER_REAR_D = 6.5        # the little board 7 mm back from the tip is 6.13 mm wide, so the bore opens up behind the body
LASER_FRONT_LEN = 7.5     # length of the snug front part of the bore (the body is 7 mm long)
LASER_WALL = -0.1         # no wall: the two bores overlap slightly, so the laser and the sensor can sit almost touching (about 0.25 mm apart)
BACK_SPACE = 12.5         # measured: board with its pins and plug is 12 mm thick, plus 0.5 clearance
STUD_HOLE_D = 6.8         # 1/4"-20 stud clearance
NUT_AF = 11.1 + 0.4       # 1/4"-20 hex nut across flats plus clearance
NUT_H = 5.8               # nut thickness plus clearance
STUD_WALL = 2.0           # plastic between the knurled disc and the nut: the measured stud is 5.83 mm long, so it reaches about 3.8 mm into the nut
BOTTOM_WALL = 2.5         # plastic under the board pocket
MOUNT_H = 15.0            # height of the mounting block under the back end (the nut sits in its middle)
TAB_W, TAB_L, TAB_T = 18.0, 10.0, WALL      # cable tab on the top edge at the back
TIE_SLOT_W, TIE_SLOT_T = 3.2, 1.6           # fits a 2.5 mm wide zip tie
TIE_SLOT_X, TIE_SLOT_Y = 5.5, 5.0           # slot centre offset from the tab centre line, and distance behind the back face
GROOVE_W, GROOVE_D = 6.4, 0.6               # shallow cradle for a 6 mm sleeve
# ----------------------------------------------------------------------------------------------------------------------

HOLE_SPACING = SENSOR_BARREL_D / 2 + LASER_WALL + LASER_D / 2   # sensor centre to laser centre at the front face
sx, lx = -HOLE_SPACING / 2, HOLE_SPACING / 2
D = SENSOR_BARREL_LEN + BACK_SPACE + 0.0       # front face at y = D, open back at y = 0
cav_z0 = BOTTOM_WALL
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
    x_max = lx + LASER_REAR_D / 2 + WALL
    W = x_max - x_min
    cx_body = (x_min + x_max) / 2
    body = box(x_min, 0, 0, W, D, H)
    tab_cx = (sx + lx) / 2
    body = body + box(tab_cx - TAB_W / 2, -TAB_L, H - TAB_T, TAB_W, TAB_L + 0.5, TAB_T)          # cable tab, top edge at the back
    y_b0 = -(STUD_WALL + NUT_H)                                                                    # outer face of the block's rear wall
    body = body + box(x_min, y_b0, -MOUNT_H, W, D - y_b0, MOUNT_H + 0.01)                       # mounting block along the whole bottom (so nothing overhangs when printed front-down)
    cuts = [
        cyl_y(SENSOR_BARREL_D, SENSOR_BARREL_LEN + 0.5, sx, cz, D - SENSOR_BARREL_LEN),             # barrel bore through the front
        box(sx - BOARD_W / 2, -0.5, cz - BOARD_H / 2, BOARD_W, D - SENSOR_BARREL_LEN + 0.5, BOARD_H),  # board pocket, open at the back
    ]
    # laser bore: straight, through the front lug and on out the back
    cuts.append(cyl_y(LASER_D, LASER_FRONT_LEN + 0.5, lx, cz, D - LASER_FRONT_LEN))
    cuts.append(cyl_y(LASER_REAR_D, D - LASER_FRONT_LEN + 0.6, lx, cz, -0.5))
    # stud: in through the block's rear wall (along +y), hex nut behind that wall, slot down through the bottom to slide the nut in
    mz = -MOUNT_H / 2
    cuts.append(cyl_y(STUD_HOLE_D, STUD_WALL + 0.6, cx_body, mz, y_b0 - 0.3))
    r = (NUT_AF / 2) / math.cos(math.radians(30))
    hexp = Manifold.cylinder(NUT_H, r, r, 6).rotate((0, 0, 90)).rotate((-90, 0, 0)).translate((cx_body, y_b0 + STUD_WALL, mz))
    cuts.append(hexp)
    cuts.append(box(cx_body - NUT_AF / 2, y_b0 + STUD_WALL, -MOUNT_H - 0.5, NUT_AF, NUT_H, MOUNT_H / 2 + 0.5))
    # zip-tie slots and groove in the cable tab (the cable lies under the tab, in the groove; the tie goes up through both slots)
    for sgn in (-1, 1):
        cuts.append(box(tab_cx + sgn * TIE_SLOT_X - TIE_SLOT_W / 2, -TIE_SLOT_Y - TIE_SLOT_T / 2, H - TAB_T - 0.5, TIE_SLOT_W, TIE_SLOT_T, TAB_T + 1))
    cuts.append(box(tab_cx - GROOVE_W / 2, -TAB_L - 0.5, H - TAB_T - 0.5, GROOVE_W, TAB_L + 0.5, GROOVE_D + 0.5))
    for c in cuts:
        body = body - c
    return to_trimesh(body)


print(f'laser-to-sensor centre spacing: {HOLE_SPACING:.2f} mm')
m = make_pod()
m.export('sensor_pod.stl')
print('pod watertight:', m.is_watertight, ' size mm (x, y, z):', [round(float(v), 1) for v in m.extents])
