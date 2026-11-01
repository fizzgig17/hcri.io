"""Sensor + laser clip for the edge of the TKLamp (version 0: sizes are assumptions, print a fit test first).

Run:  python3 make_clip.py   ->  sensor_clip.stl   (needs: pip install manifold3d trimesh numpy)
Edit the numbers below (millimetres) to match your parts, then run again.

Shape: a C-shaped clip slides down over the edge of the TKLamp (a plate or lip EDGE_T thick). On the outside of the front
jaw sits a pod holding the MLX90614 sensor barrel and a 6 mm laser module side by side, both looking straight out
(TILT_DEG tips them down). The sensor board sits in a pocket behind its barrel; the wires leave through a slot in the top.
"""
import math
import numpy as np
import trimesh
from manifold3d import Manifold

# ---- sizes you can change -------------------------------------------------------------------------------------------
EDGE_T = 4.0          # thickness of the TKLamp edge the clip grips
FIT = 0.3             # extra gap so it slides on (a printed part is a little oversize)
WALL = 3.0            # thickness of the jaws and spine
GRIP_DEPTH = 22.0     # how far the jaws reach down over the edge
WIDTH = 40.0          # clip width along the edge

SENSOR_BARREL_D = 11.6    # GY-906 DCI black barrel diameter plus clearance
SENSOR_BARREL_LEN = 12.0  # how much of the barrel sits in the bore
BOARD_W, BOARD_H, BOARD_T = 17.4, 12.4, 3.0   # the GY-906 PCB (width, height, pocket depth) plus clearance
LASER_D = 6.2             # 6 mm laser module plus clearance
LASER_LEN = 10.5
HOLE_SPACING = 15.0       # centre to centre between sensor and laser (laser sits beside the sensor)
POD_DEPTH = 26.0          # how far the pod sticks out from the front jaw
POD_HEIGHT = 24.0
TILT_DEG = 0.0            # tip the sensor and laser downward by this many degrees
# ----------------------------------------------------------------------------------------------------------------------

gap = EDGE_T + FIT
depth = gap + 2 * WALL
x0, x1 = -WIDTH / 2, WIDTH / 2


def box(x, y, z, dx, dy, dz):
    return Manifold.cube((dx, dy, dz)).translate((x, y, z))


def cyl_y(d, length, cx, cz, y0):
    """A cylinder along +Y starting at y0."""
    c = Manifold.cylinder(length, d / 2, d / 2, 48)           # along +Z
    c = c.rotate((-90, 0, 0))                                  # +Z -> +Y
    return c.translate((cx, y0, cz))


# Clip body: back jaw, spine, front jaw. Y runs front-back, Z up, the spine on top.
back = box(x0, 0, 0, WIDTH, WALL, GRIP_DEPTH + WALL)
front = box(x0, WALL + gap, 0, WIDTH, WALL, GRIP_DEPTH + WALL)
spine = box(x0, 0, GRIP_DEPTH, WIDTH, depth, WALL)
body = back + front + spine
front_face = depth                         # y of the outside of the front jaw

# Pod on the front jaw
pod_z0 = GRIP_DEPTH + WALL - POD_HEIGHT
pod = box(x0, front_face, pod_z0, WIDTH, POD_DEPTH, POD_HEIGHT)
body = body + pod

cz = pod_z0 + POD_HEIGHT / 2
sx = -HOLE_SPACING / 2                      # sensor on the left, laser on the right
lx = HOLE_SPACING / 2
face = front_face + POD_DEPTH               # the pod's outer face

# Cut the openings from the outer face going inward, then tip them if asked
cuts = []
cuts.append(cyl_y(SENSOR_BARREL_D, SENSOR_BARREL_LEN + 1, sx, cz, face - SENSOR_BARREL_LEN))
cuts.append(box(sx - BOARD_W / 2, face - SENSOR_BARREL_LEN - BOARD_T, cz - BOARD_H / 2, BOARD_W, BOARD_T + 0.01, BOARD_H))
cuts.append(cyl_y(LASER_D, LASER_LEN + 1, lx, cz, face - LASER_LEN))
# wire slot from the board pocket up through the top of the pod, and a hole behind the laser
cuts.append(box(sx - 3, face - SENSOR_BARREL_LEN - BOARD_T, cz, 6, BOARD_T, POD_HEIGHT))
cuts.append(cyl_y(3.0, 6, lx, cz, face - LASER_LEN - 5))
cut = cuts[0]
for c in cuts[1:]:
    cut = cut + c
if TILT_DEG:
    cut = cut.translate((0, -face, -cz)).rotate((TILT_DEG, 0, 0)).translate((0, face, cz))
body = body - cut

# Small lead-in chamfer is skipped on purpose: keep it simple to print. Print with the spine down, no supports needed
# except under the pod overhang (use a few supports or print on its side).

mesh = body.to_mesh()
m = trimesh.Trimesh(vertices=np.asarray(mesh.vert_properties)[:, :3], faces=np.asarray(mesh.tri_verts))
m.export('sensor_clip.stl')
print('watertight:', m.is_watertight, ' size mm:', [round(v, 1) for v in m.extents], ' volume cm3:', round(m.volume / 1000, 2))
