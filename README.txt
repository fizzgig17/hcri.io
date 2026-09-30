hCRI.io — TM-30 report fixes (August 2026)
==========================================

The 9 files in this archive are already in their correct folders.
Extract this zip INTO your site root — the folder that contains
index.php, .htaccess, api/, assets/ and frontend/ — and choose
"overwrite / replace" when prompted.

Nothing needs to be moved or renamed afterwards.


CONTENTS
--------
api/_core/spd.php
api/_core/tm30_pdf_builder.php
api/_core/share_lookup.php
api/guest_pdf.php
api/reports_item.php
assets/app.js
assets/hcri-photo.js
frontend/src/components/CVGWheel.jsx
frontend/src/components/ReportView.jsx


BEFORE YOU EXTRACT
------------------
Back up those same 9 files from the live site. That is your rollback
if anything goes wrong.


AFTER YOU EXTRACT — ONE REQUIRED STEP
-------------------------------------
Open the admin panel and click  "⟳ Recalc All"  once.

This computes the new colour-vector-graphic coordinates for every
existing report and stores them. Until it runs, older reports fall
back to rebuilding the shape from data already in the database:
accurate to about 0.1 on Rg, but the arrow bases sit up to ~6 degrees
off around the circle.

There is no SQL to run, no configuration to change, and no database
migration.


OPTIONAL CHECK
--------------
1. Open any report. The red outline in the colour vector graphic should
   now cross the black reference circle instead of sitting entirely
   inside it.
2. Download that report's TM-30 PDF. Same shape, plus a revision note
   in the footer.


NOTE ON assets/app.js
---------------------
That file is the built frontend bundle. If you ever run "npm run build"
inside frontend/, it will be regenerated and this change lost. The two
.jsx source files are included so the source matches the bundle. If you
do not run a build step, the bundle alone is sufficient.


WHAT CHANGED
------------
* Colour vector graphic now plots chroma and hue shift per TM-30-18,
  not per-hue fidelity. Over-saturation is representable for the first
  time; polygon area now corresponds to Rg. Reference-to-test arrows
  added. Applies to the on-screen wheel, the TM-30 PDF, the Annex E
  PNG/PDF export, the share card and the photo-preview inset.
* PDF chroma-shift and hue-shift charts now use the stored per-bin
  data instead of deriving it from fidelity. (The hue chart previously
  read 0.00 on all 16 bins for every report.)
* PDF 99-sample Rf,CES chart now uses the real per-sample values
  instead of interpolating the 16 hue bins.
* PDF spectral chart now draws the actual reference illuminant,
  flux-matched to the test source, instead of a flat line.
* CVG polygon now appears in generated PDFs at all — a malformed PDF
  path operator meant viewers discarded it silently.
* Per-bin lightness shift, bin colours and per-sample fidelity are no
  longer discarded by analyze_spd(), which also removes a duplicate
  full recomputation on every single-report page view.
* Report PDFs no longer divide by zero on an all-zero spectrum, and
  wavelength-wrapped multi-scan exports no longer draw a zigzag.
* Reports with no spectral data print "No spectral data" instead of
  drawing a perfect circle.
* Footer separators and chart axis labels no longer render as mojibake.

Metric values (Rf, Rg, CCT, Duv, Ra, R9, R1-R15) are unchanged.
