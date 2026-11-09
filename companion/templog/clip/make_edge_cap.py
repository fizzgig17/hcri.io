"""Cap that slides over the edge of the case, so the spring clamp grips a thicker, flat, parallel block instead of the thin lip.

Run:  python3 make_edge_cap.py   ->  edge_cap.stl   (needs: pip install manifold3d trimesh numpy)

The clamp's jaws are a wedge when closed (0 mm at the tips, about 14 mm at the top). They grip flat across the pads when they are
holding something about 14 mm thick, so the cap's outside is made that thick: the 8.64 mm case wall, a little clearance, and a wall
on each side. The clamp then holds the cap, and the cap sits over the case edge.
Print it standing on its closed end, with the slot opening upward. No supports.
"""
import numpy as np
import trimesh
from manifold3d import Manifold

# ---- sizes you can change (mm) --------------------------------------------------------------------------------------
CASE_T = 8.64          # measured thickness of the case wall
CLEAR = 0.4            # total clearance in the slot (0.2 each side)
SIDE_WALL = 2.5        # plastic on each side of the slot
LENGTH = 50.0          # how far the cap runs along the edge (about the clamp pad length; trim it if the pads are shorter)
DEPTH = 22.0           # how far down over the case wall the cap reaches
END_T = 2.5            # closed end (the part that sits on the very edge)
CHAMFER = 1.0          # lead-in at the mouth of the slot, to slide it on
# ---------------------------------------------------------------------------------------------------------------------

SLOT = CASE_T + CLEAR
T = SLOT + 2 * SIDE_WALL                     # outside thickness, between the clamp pads
H = DEPTH + END_T


def box(x, y, z, dx, dy, dz):
    return Manifold.cube((dx, dy, dz)).translate((x, y, z))


body = box(0, 0, 0, LENGTH, T, H)
body = body - box(-0.5, SIDE_WALL, END_T, LENGTH + 1, SLOT, DEPTH + 1)
for y_edge in (SIDE_WALL, SIDE_WALL + SLOT):          # 45 degree lead-in on both sides of the slot mouth
    c = Manifold.cube((LENGTH + 1, CHAMFER * 2 ** 0.5, CHAMFER * 2 ** 0.5)).rotate((45, 0, 0)).translate((-0.5, y_edge, H))
    body = body - c
ms = body.to_mesh()
m = trimesh.Trimesh(vertices=np.asarray(ms.vert_properties)[:, :3], faces=np.asarray(ms.tri_verts))
m.export('edge_cap.stl')
print(f'edge cap: outside thickness {T:.2f} mm, slot {SLOT:.2f} mm, size (x, y, z) {[round(float(v), 1) for v in m.extents]}  watertight: {m.is_watertight}')
