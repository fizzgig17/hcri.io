<?php
declare(strict_types=1);

/**
 * Open Graph preview image for a shared runtime link: a 1200x630 PNG of the output-over-time chart (one light in real
 * units, several as % of each light's starting output) with a colour-coded legend. Routed as /api/og/runtime.png?t=TOKEN[,TOKEN...]
 * Only curves whose share token matches are drawn. Falls back to the static og-default.png when GD or the fonts are missing.
 */

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/runtime_curves.php';

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


// ── Resolve the shared curves ────────────────────────────────────────────────
$toks = array_slice(array_values(array_unique(array_filter(array_map('trim', explode(',', (string)($_GET['t'] ?? ''))), 'runtime_valid_share_token'))), 0, 10);
if (!$toks) ogc_fallback();
$db = get_db();
runtime_curves_ensure($db);
$q = $db->prepare('SELECT label, unit, interval_s, payload FROM runtime_curves WHERE share_token = ?');
$curves = [];
foreach ($toks as $t) {
    try { $q->execute([$t]); $r = $q->fetch(); } catch (\Throwable $e) { $r = false; }
    if (!$r) continue;
    $v = json_decode((string)$r['payload'], true);
    if (!is_array($v) || count($v) < 2) continue;
    $curves[] = ['label' => (string)$r['label'], 'unit' => (string)$r['unit'], 'dt' => (float)$r['interval_s'], 'v' => $v];
}
if (!$curves) ogc_fallback();
$pct = count($curves) > 1;

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
$text(42, $PAD, $PAD - 6, $TEXT, $F_WORK_B, ($pct ? 'Runtime comparison' : 'Runtime'));
$cntLbl = $pct ? '(' . count($curves) . ' lights)' : '';
$text(22, $PAD + $textw(42, $F_WORK_B, ($pct ? 'Runtime comparison' : 'Runtime')) + 16, $PAD + 9, $DIM, $F_WORK_R, $cntLbl);

// ── Legend (wraps; up to 2 rows) ─────────────────────────────────────────────
$lineH = 28;
$lx    = $PAD;
$ly    = $PAD + 54;
$right = OGC_W - $PAD;
$legendBottom = $ly;
foreach ($curves as $i => $rep) {
    $col = $SERIES[$i % count($SERIES)];
    $c   = $rgb($col[0], $col[1], $col[2]);
    $lab = (string)$rep['label'];
    if (mb_strlen($lab) > 22) $lab = mb_substr($lab, 0, 21) . '…';
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
// axes: minutes across, output (or % of start) up
$xMax = 0.0; $yMax = 0.0;
foreach ($curves as &$cv) {
    $base = $pct ? max(1e-9, (float)$cv['v'][0]) / 100.0 : 1.0;
    $cv['y'] = array_map(fn($x) => (float)$x / $base, $cv['v']);
    $xMax = max($xMax, (count($cv['v']) - 1) * $cv['dt'] / 60.0);
    $yMax = max($yMax, max($cv['y']));
}
unset($cv);
if ($xMax <= 0) $xMax = 1.0;
$yMax = $pct ? max(100.0, $yMax) * 1.04 : $yMax * 1.06;
if ($yMax <= 0) $yMax = 1.0;
$nice = function (float $hi, int $n) {
    $raw = $hi / $n; $mag = 10 ** floor(log10($raw));
    foreach ([1, 2, 2.5, 5, 10] as $m) if ($m * $mag >= $raw) return $m * $mag;
    return $raw;
};
$yStep = $nice($yMax, 4);
$xStep = $nice($xMax, 6);
imagesetthickness($im, 1);
for ($gv = 0.0; $gv <= $yMax + 1e-9; $gv += $yStep) {
    $gy = (int)round($ay0 + $ah - ($gv / $yMax) * $ah);
    imageline($im, $ax0, $gy, $ax0 + $aw, $gy, $GRID);
    $lbl = $pct ? (int)round($gv) . '%' : (string)(abs($gv) >= 100 ? (int)round($gv) : round($gv, 1));
    $text(14, $plot_x + 6, $gy - 8, $DIM, $F_MONO_R, $lbl);
}
for ($gx0 = 0.0; $gx0 <= $xMax + 1e-9; $gx0 += $xStep) {
    $gx = (int)round($ax0 + 36 + ($gx0 / $xMax) * ($aw - 40));
    imageline($im, $gx, $ay0, $gx, $ay0 + $ah, $GRID);
    $text(14, $gx - 10, $ay0 + $ah + 6, $DIM, $F_MONO_R, (string)(round($gx0, 1)) . ($gx0 + $xStep > $xMax ? ' min' : ''));
}
foreach ($curves as $i => $cv) {
    $col = $SERIES[$i % count($SERIES)];
    $c   = $rgb($col[0], $col[1], $col[2]);
    imagesetthickness($im, 3);
    $n = count($cv['y']);
    $step = max(1, (int)floor($n / 600));
    $prevx = $prevy = null;
    for ($k = 0; $k < $n; $k += $step) {
        $x = (int)round($ax0 + 36 + (($k * $cv['dt'] / 60.0) / $xMax) * ($aw - 40));
        $y = (int)round($ay0 + $ah - (max(0.0, $cv['y'][$k]) / $yMax) * $ah);
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