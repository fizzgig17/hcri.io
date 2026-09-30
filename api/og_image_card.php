<?php
declare(strict_types=1);

/**
 * Open Graph preview image for a shared report, rendered in the style of the
 * comparison "dark card": a single rounded surface card containing the device
 * name, a tint badge, a wavelength-coloured SPD chart and a 3-column metric
 * grid (CCT, Duv, Ra, R9, Rf, Rg) — with the hCRI.io branding footer outside
 * the card, identical to the classic OG image. 1200x630 PNG.
 *
 * Routed (via og_image.php) for /api/og/{token}.png and /api/og/r{id}.png.
 * Requires the GD extension + the bundled TTF fonts in ../assets/fonts;
 * falls back to ../assets/og-default.png if either is missing.
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

// ── Canvas + palette (dark, matching the app) ────────────────────────────────
$im = imagecreatetruecolor(OG_W, OG_H);
imagealphablending($im, true);
imageantialias($im, true);

$rgb = fn($r, $g, $b) => imagecolorallocate($im, $r, $g, $b);
$BG       = $rgb(13, 17, 23);
$SURFACE  = $rgb(22, 27, 34);
$SURFACE2 = $rgb(28, 34, 43);
$BORDER   = $rgb(48, 56, 65);
$TEXT     = $rgb(230, 237, 243);
$DIM      = $rgb(138, 150, 163);
$ACCENT   = $rgb(88, 166, 255);
$GOOD     = $rgb(63, 185, 120);
$WARN     = $rgb(210, 153, 34);
$BAD      = $rgb(248, 81, 73);

imagefilledrectangle($im, 0, 0, OG_W, OG_H, $BG);

// ── Helpers (top-left text semantics) ────────────────────────────────────────
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

// ── Card container ───────────────────────────────────────────────────────────
$PAD     = 48;
$footerH = 46;
$cardX0  = $PAD;            $cardY0 = $PAD;
$cardX1  = OG_W - $PAD;     $cardY1 = OG_H - $PAD - $footerH;
$rrect($cardX0, $cardY0, $cardX1, $cardY1, 18, $SURFACE, $BORDER);

$inPad = 32;
$inX = $cardX0 + $inPad;
$inY = $cardY0 + $inPad;
$inW = ($cardX1 - $cardX0) - 2 * $inPad;
$innerBottom = $cardY1 - $inPad;

// ── Title (accent dot + device name, monospace, like the card) ───────────────
imagefilledellipse($im, $inX + 9, $inY + 22, 18, 18, $ACCENT);
$label = (string)$rep['label'];
if (mb_strlen($label) > 38) $label = mb_substr($label, 0, 37) . '…';
$titlePx = 42;
while ($titlePx > 26 && $textw($titlePx, $F_MONO_B, $label) > $inW - 30) $titlePx -= 2;
$text($titlePx, $inX + 30, $inY + 4, $TEXT, $F_MONO_B, $label);
$cy = $inY + 52;

// ── Tint badge (Rosy / Neutral / Green from Duv) ─────────────────────────────
$duv = $rep['duv'];
$tint = null;
if ($duv !== null) {
    if ($duv < -0.002)      $tint = ['Rosy',    [224, 113, 155]];
    elseif ($duv > 0.002)   $tint = ['Green',   [155, 191, 58]];
    else                    $tint = ['Neutral', [138, 150, 163]];
}
if ($tint) {
    $tc  = $rgb($tint[1][0], $tint[1][1], $tint[1][2]);
    $tci = ($tint[1][0] << 16) | ($tint[1][1] << 8) | $tint[1][2];
    [$pr, $pg, $pb] = $blend(0x161b22, $tci, 0.18); // dim tint fill over surface
    $pillFill = $rgb($pr, $pg, $pb);
    $bw = $textw(18, $F_MONO_B, $tint[0]) + 30;
    $rrect($inX, $cy, $inX + $bw, $cy + 32, 7, $pillFill, $tc);
    $text(18, $inX + 15, $cy + 8, $tc, $F_MONO_B, $tint[0]);
    $cy += 46;
} else {
    $cy += 4;
}

// ── Metric grid (pinned to the bottom of the card) ───────────────────────────
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
$mCols = 3; $mRows = 2; $mGap = 14;
$cellW = intdiv($inW - ($mCols - 1) * $mGap, $mCols);
$cellH = 84;
$gridH = $mRows * $cellH + ($mRows - 1) * $mGap;
$gridY = $innerBottom - $gridH;

foreach ($cells as $idx => $cell) {
    [$k, $v, $unit, $col] = $cell;
    $r = intdiv($idx, $mCols); $c = $idx % $mCols;
    $x0 = $inX + $c * ($cellW + $mGap);
    $y0 = $gridY + $r * ($cellH + $mGap);
    $rrect($x0, $y0, $x0 + $cellW, $y0 + $cellH, 12, $SURFACE2, $BORDER);
    // label pinned to the top; value anchored on a separate line below it
    $text(17, $x0 + 16, $y0 + 13, $DIM, $F_WORK_B, $k);
    $valTop = $y0 + 38;
    $vpx = min(36, $cellH - 38 - 12);
    while ($vpx > 20 && $textw($vpx, $F_MONO_B, $v) > $cellW - 34) $vpx -= 2;
    $text($vpx, $x0 + 16, $valTop, $col, $F_MONO_B, $v);
    if ($unit !== '') {
        $vw = $textw($vpx, $F_MONO_B, $v);
        $text(18, $x0 + 16 + $vw + 7, $valTop + $vpx - 20, $DIM, $F_MONO_R, $unit);
    }
}

// ── SPD chart box (fills between title/badge and the metric grid) ────────────
$chX0 = $inX; $chY0 = $cy;
$chX1 = $inX + $inW; $chY1 = $gridY - 16;
$chW = $chX1 - $chX0; $chH = $chY1 - $chY0;
$rrect($chX0, $chY0, $chX1, $chY1, 12, $SURFACE2, $BORDER);
$text(13, $chX0 + 14, $chY0 + 11, $DIM, $F_MONO_B, 'SPECTRAL POWER DISTRIBUTION');

$wls  = $rep['wls'];
$vals = $rep['vals'];
$n    = count($vals);
if ($n >= 2 && $chH > 60) {
    $start = $wls[0]; $end = $wls[$n - 1];
    $span  = max(1e-9, $end - $start);
    $vmax  = max($vals) ?: 1.0;
    $ax0 = $chX0 + 16; $ay0 = $chY0 + 36;
    $aw  = $chW - 32;  $ah  = $chH - 36 - 22;

    $valAt = function ($wl) use ($wls, $vals, $n, $start, $span) {
        $t = ($wl - $start) / $span * ($n - 1);
        $i = max(0, min($n - 2, (int)$t));
        $fr = $t - $i;
        return $vals[$i] + ($vals[$i + 1] - $vals[$i]) * $fr;
    };
    // spectral gradient fill
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
            [$rr, $gg, $bb] = $blend($base, $SURFACE2, 0.5 * $tt + 0.18);
            imagesetpixel($im, $x, $yy, imagecolorallocate($im, $rr, $gg, $bb));
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
    // peak marker
    $pk = 0; for ($q = 1; $q < $n; $q++) if ($vals[$q] > $vals[$pk]) $pk = $q;
    $peakX = (int)($ax0 + ($wls[$pk] - $start) / $span * ($aw - 1));
    imagesetthickness($im, 1);
    for ($yy = $ay0; $yy < $ay0 + $ah; $yy += 7) imageline($im, $peakX, $yy, $peakX, (int)min($ay0 + $ah, $yy + 3), $ACCENT);
    // nm labels
    $text(14, $ax0, $ay0 + $ah + 4, $DIM, $F_MONO_R, ((int)round($start)) . 'nm');
    $plbl = 'peak ' . (int)round($wls[$pk]) . 'nm';
    $plw  = $textw(14, $F_MONO_B, $plbl);
    $plx  = (int)max($ax0, min($ax0 + $aw - $plw, $peakX - $plw / 2));
    $text(14, $plx, $ay0 + $ah + 4, $ACCENT, $F_MONO_B, $plbl);
    $endlbl = ((int)round($end)) . 'nm';
    $text(14, $ax0 + $aw - $textw(14, $F_MONO_R, $endlbl), $ay0 + $ah + 4, $DIM, $F_MONO_R, $endlbl);
}

// ── Footer (outside the card — identical to the classic OG) ──────────────────
$text(22, $PAD, OG_H - $PAD + 2, $ACCENT, $F_WORK_B, 'hCRI.io');
$text(18, $PAD + 96, OG_H - $PAD + 6, $DIM, $F_WORK_R, 'High-CRI LED & flashlight spectral analysis');

header('Content-Type: image/png');
header('Cache-Control: no-cache, no-store, must-revalidate');
imagepng($im);
imagedestroy($im);