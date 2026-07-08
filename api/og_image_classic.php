<?php
declare(strict_types=1);

/**
 * Open Graph preview image for a shared report: a 1200x630 PNG with the
 * device name, a wavelength-coloured SPD curve, and the headline metrics
 * (CCT, Duv, Ra, R9, Rf, Rg). Routed as /api/og/{token}.png.
 *
 * Requires the GD extension + the bundled TTF fonts in ../assets/fonts.
 * If GD is unavailable it falls back to the static ../assets/og-default.png.
 */

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/share_lookup.php';

const OG_W = 1200;
const OG_H = 630;

function og_fallback(): void
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

// ── Resolve token ───────────────────────────────────────────────────────────
preg_match('#/api/og/([a-zA-Z0-9_-]+)\.png$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$token = $m[1] ?? '';
if ($token === '') og_fallback();

if (!function_exists('imagecreatetruecolor')) og_fallback();

$fontDir  = __DIR__ . '/../assets/fonts/';
$F_WORK_B = $fontDir . 'WorkSans-Bold.ttf';
$F_WORK_R = $fontDir . 'WorkSans-Regular.ttf';
$F_MONO_B = $fontDir . 'JetBrainsMono-Bold.ttf';
$F_MONO_R = $fontDir . 'JetBrainsMono-Regular.ttf';
foreach ([$F_WORK_B, $F_WORK_R, $F_MONO_B, $F_MONO_R] as $f) {
    if (!is_file($f)) og_fallback();
}

$rep = preg_match('/^r(\d+)$/', $token, $mm) ? load_public_report(get_db(), (int)$mm[1]) : load_shared_report(get_db(), $token);
if (!$rep) og_fallback();

// ── Cache ─────────────────────────────────────────────────────────────────
$sig = substr(md5(json_encode(['pk1',
    $rep['label'],
    $rep['cct'], $rep['duv'], $rep['ra'], $rep['r9'], $rep['Rf'], $rep['Rg'],
    count($rep['vals']),
])), 0, 10);
$cacheDir = __DIR__ . '/../uploads/.ogcache';
if (!is_dir($cacheDir)) @mkdir($cacheDir, 0775, true);
$cacheFile = $cacheDir . '/og_' . $token . '_' . $sig . '.png';

// caching disabled — the OG image is rebuilt on every request

// ── Palette (matches the app) ────────────────────────────────────────────────
$im = imagecreatetruecolor(OG_W, OG_H);
imagealphablending($im, true);
imageantialias($im, true);

$rgb = fn($r, $g, $b) => imagecolorallocate($im, $r, $g, $b);
$BG       = $rgb(13, 17, 23);
$SURFACE  = $rgb(22, 27, 34);
$BORDER   = $rgb(48, 56, 65);
$TEXT     = $rgb(230, 237, 243);
$DIM      = $rgb(138, 150, 163);
$ACCENT   = $rgb(88, 166, 255);
$GOOD     = $rgb(63, 185, 120);
$WARN     = $rgb(210, 153, 34);
$BAD      = $rgb(248, 81, 73);

imagefilledrectangle($im, 0, 0, OG_W, OG_H, $BG);

// px (PIL) → GD points
$pt = fn($px) => (int)round($px * 0.75);

// Draw TTF text using top-left semantics (GD's y is the baseline).
$text = function ($size_px, $x, $yTop, $color, $font, $str) use ($im) {
    $sz = max(1, (int)round($size_px * 0.75));
    $bb = imagettfbbox($sz, 0, $font, $str);
    $top = min($bb[5], $bb[7]);          // negative = above baseline
    imagettftext($im, $sz, 0, (int)$x, (int)($yTop - $top), $color, $font, $str);
};
$textw = function ($size_px, $font, $str) {
    $sz = max(1, (int)round($size_px * 0.75));
    $bb = imagettfbbox($sz, 0, $font, $str);
    return abs($bb[2] - $bb[0]);
};

// Rounded filled rect with 1px border.
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

// wavelength → RGB (visible spectrum approximation)
$wl_rgb = function ($wl) use ($im) {
    if ($wl < 380 || $wl > 750) return imagecolorallocate($im, 60, 64, 72);
    if ($wl < 440)      { $r = -($wl - 440) / 60; $g = 0;                 $b = 1; }
    elseif ($wl < 490)  { $r = 0;                 $g = ($wl - 440) / 50;  $b = 1; }
    elseif ($wl < 510)  { $r = 0;                 $g = 1; $b = -($wl - 510) / 20; }
    elseif ($wl < 580)  { $r = ($wl - 510) / 70;  $g = 1; $b = 0; }
    elseif ($wl < 645)  { $r = 1; $g = -($wl - 645) / 65; $b = 0; }
    else                { $r = 1; $g = 0; $b = 0; }
    if ($wl < 420)      $f = 0.3 + 0.7 * ($wl - 380) / 40;
    elseif ($wl > 700)  $f = 0.3 + 0.7 * (750 - $wl) / 50;
    else                $f = 1.0;
    return imagecolorallocate($im, (int)(255 * $r * $f), (int)(255 * $g * $f), (int)(255 * $b * $f));
};
$blend = function ($c1, $c2, $t) {
    $r = (($c1 >> 16) & 255) + (((($c2 >> 16) & 255)) - (($c1 >> 16) & 255)) * $t;
    $g = (($c1 >> 8) & 255)  + (((($c2 >> 8) & 255))  - (($c1 >> 8) & 255))  * $t;
    $b = ($c1 & 255)         + ((($c2 & 255))         - ($c1 & 255))         * $t;
    return [(int)$r, (int)$g, (int)$b];
};

$PAD = 56;

// ── Header ────────────────────────────────────────────────────────────────
$label = (string)$rep['label'];
if (mb_strlen($label) > 34) $label = mb_substr($label, 0, 33) . '…';
$text(46, $PAD, $PAD - 6, $TEXT, $F_WORK_B, $label);






// ── Layout ──────────────────────────────────────────────────────────────────
$top    = $PAD + 104;
$plot_x = $PAD;
$plot_y = $top;
$plot_w = 660;
$plot_h = OG_H - $top - $PAD - 34;
$mx = 18; $my = 14; $myTop = 38; $myBot = 26;

$rrect($plot_x, $plot_y, $plot_x + $plot_w, $plot_y + $plot_h, 16, $SURFACE, $BORDER);

// SPD spectral area fill
$wls  = $rep['wls'];
$vals = $rep['vals'];
$n    = count($vals);
if ($n >= 2) {
    $start = $wls[0];
    $end   = $wls[$n - 1];
    $span  = max(1e-9, $end - $start);
    $vmax  = max($vals) ?: 1.0;
    $ax0 = $plot_x + $mx; $ay0 = $plot_y + $myTop;
    $aw  = $plot_w - 2 * $mx; $ah = $plot_h - $myTop - $myBot;

    $valAt = function ($wl) use ($wls, $vals, $n, $start, $span) {
        $t = ($wl - $start) / $span * ($n - 1);
        $i = max(0, min($n - 2, (int)$t));
        $fr = $t - $i;
        return $vals[$i] + ($vals[$i + 1] - $vals[$i]) * $fr;
    };

    for ($px = 0; $px < $aw; $px++) {
        $wl = $start + $span * $px / ($aw - 1);
        $v  = max(0.0, $valAt($wl)) / $vmax;
        $colh = (int)($v * $ah);
        if ($colh <= 0) continue;
        $base = $wl_rgb($wl);
        $x = $ax0 + $px;
        $ytop = $ay0 + $ah - $colh;
        for ($yy = $ytop; $yy < $ay0 + $ah; $yy++) {
            $tt = ($yy - $ytop) / max(1, $colh);
            [$r, $g, $b] = $blend($base, $SURFACE, 0.55 * $tt + 0.15);
            imagesetpixel($im, $x, $yy, imagecolorallocate($im, $r, $g, $b));
        }
    }
    // curve stroke
    imagesetthickness($im, 2);
    $prevx = $prevy = null;
    for ($px = 0; $px < $aw; $px++) {
        $wl = $start + $span * $px / ($aw - 1);
        $v  = max(0.0, $valAt($wl)) / $vmax;
        $x = $ax0 + $px;
        $y = $ay0 + $ah - (int)($v * $ah);
        if ($prevx !== null) imageline($im, $prevx, $prevy, $x, $y, $TEXT);
        $prevx = $x; $prevy = $y;
    }
    $pk = 0; for ($q = 1; $q < $n; $q++) if ($vals[$q] > $vals[$pk]) $pk = $q;
    $peakX = (int)($ax0 + ($wls[$pk] - $start) / $span * ($aw - 1));
    $plbl = 'peak ' . (int)round($wls[$pk]) . 'nm';
    $plw  = $textw(15, $F_MONO_B, $plbl);
    $plx  = (int)max($ax0, min($ax0 + $aw - $plw, $peakX - $plw / 2));
    imagesetthickness($im, 1);
    for ($yy = $plot_y + 30; $yy < $ay0 + $ah; $yy += 7) imageline($im, $peakX, $yy, $peakX, (int)min($ay0 + $ah, $yy + 3), $ACCENT);
    $text(15, $plx, $plot_y + 12, $ACCENT, $F_MONO_B, $plbl);
    $text(15, $ax0, $ay0 + $ah + 5, $DIM, $F_MONO_R, ((int)round($start)) . 'nm');
    $endlbl = ((int)round($end)) . 'nm';
    $text(15, $ax0 + $aw - $textw(15, $F_MONO_R, $endlbl), $ay0 + $ah + 5, $DIM, $F_MONO_R, $endlbl);
}
$text(18, $plot_x + 14, $plot_y + 10, $TEXT, $F_WORK_B, 'Spectral Power Distribution');

// ── Metric cards ──────────────────────────────────────────────────────────
$mcolor = function ($key, $v) use ($GOOD, $WARN, $BAD, $TEXT) {
    if ($v === null) return $TEXT;
    switch ($key) {
        case 'Ra': return $v >= 90 ? $GOOD : ($v >= 80 ? $WARN : $BAD);
        case 'R9': return $v >= 80 ? $GOOD : ($v >= 50 ? $WARN : $BAD);
        case 'Rf': return $v >= 90 ? $GOOD : ($v >= 80 ? $WARN : $BAD);
        case 'Rg': return ($v >= 95 && $v <= 105) ? $GOOD : (($v >= 90 && $v <= 110) ? $WARN : $BAD);
    }
    return $TEXT;
};
$fmt = fn($v) => $v === null ? '—' : (string)(int)round($v);
$cells = [
    ['CCT', $rep['cct'] === null ? '—' : (string)$rep['cct'], 'K', $ACCENT],
    ['Duv', $rep['duv'] === null ? '—' : sprintf('%+.4f', $rep['duv']), '', $TEXT],
    ['Ra',  $fmt($rep['ra']), '', $mcolor('Ra', $rep['ra'])],
    ['R9',  $fmt($rep['r9']), '', $mcolor('R9', $rep['r9'])],
    ['Rf',  $fmt($rep['Rf']), '', $mcolor('Rf', $rep['Rf'])],
    ['Rg',  $fmt($rep['Rg']), '', $mcolor('Rg', $rep['Rg'])],
];
$gx = $plot_x + $plot_w + 26;
$gw = OG_W - $PAD - $gx;
$cols = 2; $rows = 3; $gap = 14;
$cw = intdiv($gw - $gap, $cols);
$ch = intdiv($plot_h - ($rows - 1) * $gap, $rows);
foreach ($cells as $idx => $cell) {
    [$k, $v, $unit, $col] = $cell;
    $r = intdiv($idx, $cols); $c = $idx % $cols;
    $x0 = $gx + $c * ($cw + $gap); $y0 = $plot_y + $r * ($ch + $gap);
    $rrect($x0, $y0, $x0 + $cw, $y0 + $ch, 14, $SURFACE, $BORDER);
    $text(20, $x0 + 18, $y0 + 14, $DIM, $F_WORK_B, $k);
    // auto-fit the value font to the card width
    $vpx = 46;
    while ($vpx > 24 && $textw($vpx, $F_MONO_B, $v) > $cw - 36) $vpx -= 2;
    $text($vpx, $x0 + 18, $y0 + $ch - $vpx - 14, $col, $F_MONO_B, $v);
    if ($unit !== '') {
        $vw = $textw($vpx, $F_MONO_B, $v);
        $text(22, $x0 + 18 + $vw + 8, $y0 + $ch - 40, $DIM, $F_MONO_R, $unit);
    }
}

// ── Footer ──────────────────────────────────────────────────────────────────
$text(22, $PAD, OG_H - $PAD + 2, $ACCENT, $F_WORK_B, 'hCRI.io');
$text(18, $PAD + 96, OG_H - $PAD + 6, $DIM, $F_WORK_R, 'High-CRI LED & flashlight spectral analysis');

// ── Output (+ cache) ─────────────────────────────────────────────────────────
// drop stale cache files for this token



header('Content-Type: image/png');
header('Cache-Control: no-cache, no-store, must-revalidate');
imagepng($im);
imagedestroy($im);