<?php
declare(strict_types=1);

/**
 * Open Graph preview image for a shared comparison: a 1200x630 PNG showing the
 * dark "overlay" graph — every report's normalized SPD curve drawn on one set
 * of axes, in the same series colours the app uses, plus a colour-coded legend.
 * Routed as /api/og/compare.png?c=ID[.TOKEN],ID,...
 *
 * Requires the GD extension + the bundled TTF fonts in ../assets/fonts.
 * If GD is unavailable, or no readable reports resolve, it falls back to the
 * static ../assets/og-default.png.
 */

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/share_lookup.php';

const OGC_W = 1200;
const OGC_H = 630;

function ogc_fallback(): void
{
    $def = __DIR__ . '/../assets/og-default.png';
    if (is_file($def)) {
        header('Content-Type: image/png');
        header('Cache-Control: public, max-age=86400');
        readfile($def);
    } else {
        http_response_code(404);
    }
    exit;
}

if (!function_exists('imagecreatetruecolor')) ogc_fallback();

$fontDir  = __DIR__ . '/../assets/fonts/';
$F_WORK_B = $fontDir . 'WorkSans-Bold.ttf';
$F_WORK_R = $fontDir . 'WorkSans-Regular.ttf';
$F_MONO_B = $fontDir . 'JetBrainsMono-Bold.ttf';
$F_MONO_R = $fontDir . 'JetBrainsMono-Regular.ttf';
foreach ([$F_WORK_B, $F_WORK_R, $F_MONO_B, $F_MONO_R] as $f) {
    if (!is_file($f)) ogc_fallback();
}

// ── Resolve the comparison list (id or id.token, comma separated) ────────────
$raw     = isset($_GET['c']) ? (string)$_GET['c'] : '';
$entries = array_slice(array_filter(array_map('trim', explode(',', $raw))), 0, 10);
if (!$entries) ogc_fallback();

$db   = get_db();
$reps = [];
foreach ($entries as $en) {
    if (!preg_match('/^(\d+)(?:\.([a-zA-Z0-9_-]+))?$/', $en, $mm)) continue;
    $id  = (int)$mm[1];
    $tok = $mm[2] ?? '';
    try {
        // A token grants access to a private report; a bare id must be public.
        $rep = $tok !== '' ? load_shared_report($db, $tok) : load_public_report($db, $id);
    } catch (\Throwable $e) {
        $rep = null;
    }
    if ($rep && !empty($rep['wls']) && count($rep['wls']) >= 2) $reps[] = $rep;
}
if (count($reps) < 1) ogc_fallback();

// ── Canvas + palette (dark theme, matching the app's overlay) ────────────────
$im = imagecreatetruecolor(OGC_W, OGC_H);
imagealphablending($im, true);
imageantialias($im, true);

$rgb     = fn($r, $g, $b) => imagecolorallocate($im, $r, $g, $b);
$BG      = $rgb(13, 17, 23);
$SURFACE = $rgb(22, 27, 34);
$BORDER  = $rgb(48, 56, 65);
$GRID    = $rgb(38, 45, 54);
$TEXT    = $rgb(230, 237, 243);
$DIM     = $rgb(138, 150, 163);
$ACCENT  = $rgb(88, 166, 255);

imagefilledrectangle($im, 0, 0, OGC_W, OGC_H, $BG);

// Series colours — identical to the app's SERIES_COLORS (dark-mode/bright set).
$SERIES = [
    [88, 166, 255], [63, 185, 120], [224, 113, 155], [210, 153, 34], [163, 113, 247],
    [46, 196, 182], [248, 81, 73], [255, 159, 64], [141, 219, 94], [201, 123, 214],
];

// ── Text helpers (top-left semantics; GD's y is the baseline) ────────────────
$text = function ($size_px, $x, $yTop, $color, $font, $str) use ($im) {
    $sz = max(1, (int)round($size_px * 0.75));
    $bb = imagettfbbox($sz, 0, $font, $str);
    $top = min($bb[5], $bb[7]);
    imagettftext($im, $sz, 0, (int)$x, (int)($yTop - $top), $color, $font, $str);
};
$textw = function ($size_px, $font, $str) {
    $sz = max(1, (int)round($size_px * 0.75));
    $bb = imagettfbbox($sz, 0, $font, $str);
    return abs($bb[2] - $bb[0]);
};
$rrect = function ($x0, $y0, $x1, $y1, $rad, $fill, $border) use ($im) {
    $d = $rad * 2;
    imagefilledrectangle($im, $x0 + $rad, $y0, $x1 - $rad, $y1, $fill);
    imagefilledrectangle($im, $x0, $y0 + $rad, $x1, $y1 - $rad, $fill);
    imagefilledellipse($im, $x0 + $rad, $y0 + $rad, $d, $d, $fill);
    imagefilledellipse($im, $x1 - $rad, $y0 + $rad, $d, $d, $fill);
    imagefilledellipse($im, $x0 + $rad, $y1 - $rad, $d, $d, $fill);
    imagefilledellipse($im, $x1 - $rad, $y1 - $rad, $d, $d, $fill);
    if ($border !== null) {
        imagesetthickness($im, 1);
        imagearc($im, $x0 + $rad, $y0 + $rad, $d, $d, 180, 270, $border);
        imagearc($im, $x1 - $rad, $y0 + $rad, $d, $d, 270, 360, $border);
        imagearc($im, $x0 + $rad, $y1 - $rad, $d, $d, 90, 180, $border);
        imagearc($im, $x1 - $rad, $y1 - $rad, $d, $d, 0, 90, $border);
        imageline($im, $x0 + $rad, $y0, $x1 - $rad, $y0, $border);
        imageline($im, $x0 + $rad, $y1, $x1 - $rad, $y1, $border);
        imageline($im, $x0, $y0 + $rad, $x0, $y1 - $rad, $border);
        imageline($im, $x1, $y0 + $rad, $x1, $y1 - $rad, $border);
    }
};

$PAD = 56;

// ── Title ────────────────────────────────────────────────────────────────────
$text(42, $PAD, $PAD - 6, $TEXT, $F_WORK_B, 'Spectral Comparison');
$cntLbl = '(' . count($reps) . ' light' . (count($reps) === 1 ? '' : 's') . ')';
$text(22, $PAD + $textw(42, $F_WORK_B, 'Spectral Comparison') + 16, $PAD + 9, $DIM, $F_WORK_R, $cntLbl);

// ── Legend (wraps; up to 2 rows) ─────────────────────────────────────────────
$lineH = 28;
$lx    = $PAD;
$ly    = $PAD + 54;
$right = OGC_W - $PAD;
$legendBottom = $ly;
foreach ($reps as $i => $rep) {
    $col = $SERIES[$i % count($SERIES)];
    $c   = $rgb($col[0], $col[1], $col[2]);
    $lab = (string)$rep['label'];
    if (mb_strlen($lab) > 22) $lab = mb_substr($lab, 0, 21) . '…';
    if ($rep['cct'] !== null) $lab .= '  ' . $rep['cct'] . 'K';
    $itemW = 16 + 9 + $textw(18, $F_MONO_R, $lab) + 26;
    if ($lx + $itemW > $right && $lx > $PAD) { $lx = $PAD; $ly += $lineH; }
    if ($ly > $PAD + 54 + $lineH) break; // cap at 2 rows
    imagefilledrectangle($im, $lx, $ly + 5, $lx + 16, $ly + 11, $c);
    $text(18, $lx + 25, $ly, $TEXT, $F_MONO_R, $lab);
    $lx += $itemW;
    $legendBottom = $ly;
}

// ── Plot ─────────────────────────────────────────────────────────────────────
$plot_x = $PAD;
$plot_y = $legendBottom + $lineH + 6;
$plot_w = OGC_W - 2 * $PAD;
$plot_h = OGC_H - $plot_y - $PAD - 28;
$rrect($plot_x, $plot_y, $plot_x + $plot_w, $plot_y + $plot_h, 16, $SURFACE, $BORDER);

$mx = 26; $myTop = 18; $myBot = 30;
$ax0 = $plot_x + $mx;       $ay0 = $plot_y + $myTop;
$aw  = $plot_w - 2 * $mx;   $ah  = $plot_h - $myTop - $myBot;
$x0wl = 380; $x1wl = 780;

// gridlines + axis labels
imagesetthickness($im, 1);
foreach ([0.0, 0.5, 1.0] as $gv) {
    $gy = (int)round($ay0 + $ah - $gv * $ah);
    imageline($im, $ax0, $gy, $ax0 + $aw, $gy, $GRID);
    $text(14, $plot_x + 6, $gy - 8, $DIM, $F_MONO_R, rtrim(rtrim(number_format($gv, 1), '0'), '.'));
}
foreach ([400, 500, 600, 700] as $gw) {
    $gx = (int)round($ax0 + ($gw - $x0wl) / ($x1wl - $x0wl) * $aw);
    imageline($im, $gx, $ay0, $gx, $ay0 + $ah, $GRID);
    $text(14, $gx - 14, $ay0 + $ah + 6, $DIM, $F_MONO_R, (string)$gw);
}

// curves — each normalized to its own peak, like the app's overlay
foreach ($reps as $i => $rep) {
    $wls  = $rep['wls'];
    $vals = $rep['vals'];
    $n    = min(count($wls), count($vals));
    // stop at the first non-increasing wavelength (guards malformed tails)
    for ($q = 1; $q < $n; $q++) { if ($wls[$q] < $wls[$q - 1]) { $n = $q; break; } }
    if ($n < 2) continue;

    $vmax = 0.0;
    for ($q = 0; $q < $n; $q++) if ($vals[$q] > $vmax) $vmax = $vals[$q];
    if ($vmax <= 0) $vmax = 1.0;

    $valAt = function ($wl) use ($wls, $vals, $n) {
        if ($wl <= $wls[0]) return $vals[0];
        if ($wl >= $wls[$n - 1]) return $vals[$n - 1];
        $j = 0;
        while ($j < $n - 1 && $wls[$j + 1] < $wl) $j++;
        $den = $wls[$j + 1] - $wls[$j];
        $fr  = $den ? ($wl - $wls[$j]) / $den : 0;
        return $vals[$j] + ($vals[$j + 1] - $vals[$j]) * $fr;
    };

    $col = $SERIES[$i % count($SERIES)];
    $c   = $rgb($col[0], $col[1], $col[2]);
    imagesetthickness($im, 3);
    $prevx = $prevy = null;
    for ($px = 0; $px <= $aw; $px++) {
        $wl = $x0wl + ($x1wl - $x0wl) * $px / $aw;
        $v  = max(0.0, $valAt($wl)) / $vmax;
        $x  = $ax0 + $px;
        $y  = (int)round($ay0 + $ah - $v * $ah);
        if ($prevx !== null) imageline($im, $prevx, $prevy, $x, $y, $c);
        $prevx = $x; $prevy = $y;
    }
}
imagesetthickness($im, 1);

// ── Footer ───────────────────────────────────────────────────────────────────
$text(22, $PAD, OGC_H - $PAD + 2, $ACCENT, $F_WORK_B, 'hCRI.io');
$text(18, $PAD + 96, OGC_H - $PAD + 6, $DIM, $F_WORK_R, 'High-CRI LED & flashlight spectral analysis');

header('Content-Type: image/png');
header('Cache-Control: no-cache, no-store, must-revalidate');
imagepng($im);
imagedestroy($im);