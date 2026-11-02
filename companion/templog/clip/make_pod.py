"""Sensor + laser pod for a camera-style spring clamp with a ball head (version 0: sizes are assumptions, print a fit test first).

Run:  python3 make_pod.py   ->  sensor_pod.stl + laser_plug_*mm.stl   (needs: pip install manifold3d trimesh numpy)
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
BOARD_W, BOARD_H = 12.5 + 0.4, 19.0 + 0.4   # measured: board 12.5 wide, 19 tall, plus clearance
LASER_D = 6.2             # 6 mm laser module plus clearance
HOLE_SPACING = 17.5       # sensor centre to laser-plug centre
AIM_DISTANCES = (30, 50, 100)   # one swappable laser plug per distance (mm in front of the pod where the dot meets the sensor's line of sight)
PLUG_R = 8.5              # laser plug body radius
PLUG_CLEAR = 0.15         # gap between plug and socket
PLUG_LEN = 10.0           # plug body length (sits in the lug at the front)
FLANGE_T, FLANGE_R = 2.0, 10.0   # plug head that stops against the front face
FLAT_D = 6.5              # flat on the plug's bottom, this far below its axis: the plug only fits one way
BACK_SPACE = 15.0         # room behind the barrel for the board and its plug
STUD_HOLE_D = 6.8         # 1/4"-20 stud clearance
NUT_AF = 11.1 + 0.4       # 1/4"-20 hex nut across flats plus clearance
NUT_H = 5.8               # nut thickness plus clearance
FLOOR = 2.5               # plastic under the nut (the stud is only about 6 mm long)
ROOF = 2.2                # plastic between the nut pocket and the sensor cavity
# ----------------------------------------------------------------------------------------------------------------------

sx, lx = -HOLE_SPACING / 2, HOLE_SPACING / 2
x_min = sx - BOARD_W / 2 - WALL
x_max = lx + PLUG_R + PLUG_CLEAR + WALL
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
# cable tab: sticks out the back at the floor; two slots take a zip tie that wraps the sleeved cable lying in the groove between them
TAB_W, TAB_L, TAB_T = 18.0, 10.0, FLOOR     # same thickness as the floor, so the nut still slides in over it
TIE_SLOT_W, TIE_SLOT_T = 3.2, 1.6           # fits a 2.5 mm wide zip tie
TIE_SLOT_X, TIE_SLOT_Y = 5.5, 5.0           # slot centre offset from the tab centre line, and distance behind the back face
GROOVE_W, GROOVE_D = 6.4, 0.6               # shallow cradle for a 6 mm sleeve
tab_cx = (sx + lx) / 2
body = body + box(tab_cx - TAB_W / 2, -TAB_L, 0, TAB_W, TAB_L + 0.5, TAB_T)
cuts = [
    cyl_y(SENSOR_BARREL_D, SENSOR_BARREL_LEN + 0.5, sx, cz, D - SENSOR_BARREL_LEN),             # barrel bore through the front
    box(sx - BOARD_W / 2, -0.5, cz - BOARD_H / 2, BOARD_W, D - SENSOR_BARREL_LEN + 0.5, BOARD_H),  # board pocket, open at the back
]
# stud hole up through the floor, hex nut pocket above it, slot out the back to slide the nut in
sy = D / 2
cuts.append(Manifold.cylinder(FLOOR + 0.5, STUD_HOLE_D / 2, STUD_HOLE_D / 2, 40).translate((cx_body, sy, -0.25)))
r = (NUT_AF / 2) / math.cos(math.radians(30))
hexp = Manifold.cylinder(NUT_H, r, r, 6).rotate((0, 0, 90)).translate((cx_body, sy, FLOOR))
cuts.append(hexp)
cuts.append(box(cx_body - NUT_AF / 2, -0.5, FLOOR, NUT_AF, sy + 0.5, NUT_H))
# laser plug socket: round bore through the front lug, with a flat of material at the bottom (the key)
LUG = PLUG_LEN
sock_r = PLUG_R + PLUG_CLEAR
sock = cyl_y(2 * sock_r, LUG + 1, lx, cz, D - LUG) - box(lx - 20, D - LUG - 1, cz - 40 - (FLAT_D + PLUG_CLEAR), 40, LUG + 3, 40)
cuts.append(sock)
# relief behind the socket so the laser body can lean back at its angle (open at the back and to the +x side)
rx0 = sx + BOARD_W / 2 + WALL
cuts.append(box(rx0, -0.5, cz - sock_r, x_max - rx0 + 1, D - LUG + 0.5, 2 * sock_r))
for sgn in (-1, 1):
    cuts.append(box(tab_cx + sgn * TIE_SLOT_X - TIE_SLOT_W / 2, -TIE_SLOT_Y - TIE_SLOT_T / 2, -0.5, TIE_SLOT_W, TIE_SLOT_T, TAB_T + 1))
cuts.append(box(tab_cx - GROOVE_W / 2, -TAB_L - 0.5, TAB_T - GROOVE_D, GROOVE_W, TAB_L + 0.5, GROOVE_D + 0.5))
for c in cuts:
    body = body - c


def to_trimesh(man):
    ms = man.to_mesh()
    return trimesh.Trimesh(vertices=np.asarray(ms.vert_properties)[:, :3], faces=np.asarray(ms.tri_verts))


m = to_trimesh(body)
m.export('sensor_pod.stl')
print('pod  watertight:', m.is_watertight, ' size mm (x, y, z):', [round(v, 1) for v in m.extents], ' volume cm3:', round(m.volume / 1000, 2))


def make_plug(dist):
    """Plug built in pod coordinates (axis along y at x=lx, z=cz); the body sits in the lug, the flange outside the front face."""
    y_mid = D + (FLANGE_T - PLUG_LEN) / 2
    h = D - y_mid
    phi = math.degrees(math.atan(HOLE_SPACING / (dist + h)))   # exact: the beam crosses the sensor axis at `dist` in front of the pod
    body_ = cyl_y(2 * PLUG_R, PLUG_LEN, lx, cz, D - PLUG_LEN) - box(lx - 20, D - PLUG_LEN - 1, cz - 40 - FLAT_D, 40, PLUG_LEN + 2, 40)
    flange = cyl_y(2 * FLANGE_R, FLANGE_T, lx, cz, D)
    hole = (Manifold.cylinder(60, LASER_D / 2, LASER_D / 2, 48).rotate((-90, 0, 0)).translate((0, -30, 0))
            .rotate((0, 0, phi)).translate((lx, y_mid, cz)))
    return to_trimesh(body_ + flange - hole), phi


for dist in AIM_DISTANCES:
    pm, phi = make_plug(dist)
    pm.export(f'laser_plug_{dist}mm.stl')
    print(f'plug {dist:>3} mm: tilt {phi:4.1f} deg  watertight:', pm.is_watertight, ' size mm:', [round(v, 1) for v in pm.extents])
