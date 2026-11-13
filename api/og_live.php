<?php
declare(strict_types=1);

/**
 * Open Graph preview image for a live station link: the current output as a big number, what is being shared and a small chart
 * of the last readings. Routed as /api/og/live.png?t=TOKEN. It shows the station as it is when the picture is fetched; link
 * previews are cached by the sites that show them (hours to days), so this is a snapshot, not a live picture.
 */

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/live_station.php';

function ogl_fallback(): void
{
    $def = __DIR__ . '/../assets/og-default.png';
    if (is_file($def)) { header('Content-Type: image/png'); header('Cache-Control: public, max-age=300'); readfile($def); }
    else http_response_code(404);
    exit;
}

if (!function_exists('imagecreatetruecolor')) ogl_fallback();
$fontDir = __DIR__ . '/../assets/fonts/';
$B = $fontDir . 'WorkSans-Bold.ttf'; $R = $fontDir . 'WorkSans-Regular.ttf'; $M = $fontDir . 'JetBrainsMono-Bold.ttf';
foreach ([$B, $R, $M] as $f) if (!is_file($f)) ogl_fallback();

$t = (string)($_GET['t'] ?? '');
if (!live_valid_token($t)) ogl_fallback();
try {
    $db = get_db();
    live_ensure($db);
    $s = $db->prepare('SELECT * FROM live_stations WHERE token = ? AND enabled = 1');
    $s->execute([$t]);
    $r = $s->fetch();
} catch (\Throwable $e) { $r = false; }
if (!$r || $r['run_id'] === '') ogl_fallback();

$sum  = live_run_summary($r);
$vals = json_decode((string)$r['payload'], true) ?: [];
$last = $vals ? (float)end($vals) : null;
$isRun = $sum['kind'] === 'run';
// Temperatures (Temp 1..3) that were sent with the readings: the latest value of each, and the line for the chart.
$tj = json_decode((string)($r['temps'] ?? ''), true);
$tj = is_array($tj) ? $tj : [];
$tser = [];
foreach ([0, 1, 2, 3] as $ch) {
    $tv = $tj[$ch]['values'] ?? null;
    if (!is_array($tv)) continue;
    $lastT = null;
    for ($i = count($tv) - 1; $i >= 0; $i--) if ($tv[$i] !== null) { $lastT = (float)$tv[$i]; break; }
    if ($lastT === null) continue;
    $nm = trim((string)($tj[$ch]['name'] ?? ''));
    $tser[] = ['ch' => $ch, 'name' => $nm !== '' ? $nm : 'Temp ' . ($ch + 1), 'vals' => $tv, 'last' => $lastT];
}
$thermal = live_thermal_view($r);   // the latest thermal camera image, or null
$W = 1200; $H = 630;
$im = imagecreatetruecolor($W, $H);
imageantialias($im, true);
$bg = imagecolorallocate($im, 5, 9, 14); $fg = imagecolorallocate($im, 232, 240, 247); $dim = imagecolorallocate($im, 122, 160, 190);
$acc = imagecolorallocate($im, 74, 163, 255); $grid = imagecolorallocate($im, 24, 36, 50);
$live = $sum['status'] === 'running' && !$sum['stale'];
$chip = $sum['status'] === 'finished' ? ($isRun ? 'FINISHED' : 'STOPPED') : ($sum['status'] === 'error' ? 'PROBLEM' : ($sum['stale'] ? 'NO DATA' : ($isRun ? 'LIVE RUN' : 'LIVE')));
$chipCol = $live ? imagecolorallocate($im, 61, 214, 140) : $dim;
imagefilledrectangle($im, 0, 0, $W, $H, $bg);

$info = live_info($r);
$title = $info['title'] !== '' ? $info['title'] : ($isRun ? ($sum['label'] !== '' ? $sum['label'] : 'TKLamp run') : 'Live reading');
$tmax = $thermal ? 28 : 44;   // the thermal picture takes the top right corner
if (mb_strlen($title) > $tmax) $title = mb_substr($title, 0, $tmax - 1) . '…';
imagettftext($im, $thermal ? 34 : 40, 0, 60, 100, $fg, $B, $title);
imagettftext($im, 26, 0, 60, 150, $chipCol, $B, '● ' . $chip);
$num = $last === null ? '–' : (abs($last) >= 100 ? (string)round($last) : number_format($last, 1));
imagettftext($im, 150, 0, 60, 340, $fg, $M, $num);
$bb = imagettfbbox(150, 0, $M, $num);
imagettftext($im, 44, 0, 60 + ($bb[2] - $bb[0]) + 24, 340, $dim, $R, $sum['unit'] ?: 'lm');
$tcol = [imagecolorallocate($im, 255, 138, 76), imagecolorallocate($im, 255, 210, 63), imagecolorallocate($im, 197, 139, 255), imagecolorallocate($im, 61, 214, 140)];
// current temperatures down the right side, level with the big number
$ty = $thermal ? 362 : 200;
foreach ($tser as $t) {
    $line = $t['name'] . '  ' . number_format($t['last'], 1) . ' °C';
    if (mb_strlen($line) > 26) $line = mb_substr($line, 0, 25) . '…';
    $fs = $thermal ? 26 : 32;
    $tb = imagettfbbox($fs, 0, $B, $line);
    imagettftext($im, $fs, 0, $W - 60 - ($tb[2] - $tb[0]), $ty, $tcol[$t['ch']], $B, $line);
    $ty += $thermal ? 38 : 52;
}

// thermal camera image (MLX90640, 32 x 24): iron palette scaled from its coldest to its hottest pixel, hottest spot marked
if ($thermal) {
    $stops = [[0, 0, 0, 20], [0.2, 60, 10, 110], [0.45, 190, 40, 80], [0.7, 245, 130, 20], [0.9, 255, 225, 70], [1, 255, 255, 235]];
    $tp = $thermal['px'];
    $tlo = min($tp); $thi = max($tp); $span = max($thi - $tlo, 2.0);
    $hot = 0;
    foreach ($tp as $i => $v) if ($v > $tp[$hot]) $hot = $i;
    $tw = 340; $th = 255; $tx = $W - 60 - $tw; $tyy = 36;
    // smooth the 32 x 24 temperatures up to the picture size (bilinear on the temperatures, then colour), like the live views
    $cols = [];
    for ($k = 0; $k <= 255; $k++) {
        $f = $k / 255;
        for ($j = 1; $j < count($stops); $j++) if ($f <= $stops[$j][0]) break;
        $j = min($j, count($stops) - 1);
        $a = $stops[$j - 1]; $b = $stops[$j]; $u = ($f - $a[0]) / ($b[0] - $a[0]);
        $cols[$k] = imagecolorallocate($im, (int)round($a[1] + ($b[1] - $a[1]) * $u), (int)round($a[2] + ($b[2] - $a[2]) * $u), (int)round($a[3] + ($b[3] - $a[3]) * $u));
    }
    for ($y = 0; $y < $th; $y++) {
        $fy = ($y + 0.5) * 24 / $th - 0.5; $y0 = (int)floor($fy); $wy = $fy - $y0; $ya = max(0, min(23, $y0)); $yb = max(0, min(23, $y0 + 1));
        for ($x = 0; $x < $tw; $x++) {
            $fx = ($x + 0.5) * 32 / $tw - 0.5; $x0 = (int)floor($fx); $wx = $fx - $x0; $xa = max(0, min(31, $x0)); $xb = max(0, min(31, $x0 + 1));
            $v = ($tp[$ya * 32 + $xa] * (1 - $wx) + $tp[$ya * 32 + $xb] * $wx) * (1 - $wy) + ($tp[$yb * 32 + $xa] * (1 - $wx) + $tp[$yb * 32 + $xb] * $wx) * $wy;
            imagesetpixel($im, $tx + $x, $tyy + $y, $cols[(int)round(max(0.0, min(1.0, ($v - $tlo) / $span)) * 255)]);
        }
    }
    $white = imagecolorallocate($im, 255, 255, 255); $black = imagecolorallocate($im, 0, 0, 0);
    $hx = (int)round($tx + (($hot % 32) + 0.5) * $tw / 32); $hy = (int)round($tyy + ((intdiv($hot, 32)) + 0.5) * $th / 24);
    imagesetthickness($im, 5); imageline($im, $hx - 10, $hy, $hx + 10, $hy, $black); imageline($im, $hx, $hy - 10, $hx, $hy + 10, $black);
    imagesetthickness($im, 2); imageline($im, $hx - 10, $hy, $hx + 10, $hy, $white); imageline($im, $hx, $hy - 10, $hx, $hy + 10, $white);
    imagesetthickness($im, 1);
    $lbl = number_format($tp[$hot], 1) . '°';
    $lx = $hx + 14; $lb = imagettfbbox(18, 0, $B, $lbl); if ($lx + ($lb[2] - $lb[0]) > $tx + $tw - 4) $lx = $hx - 14 - ($lb[2] - $lb[0]);
    $ly = max($tyy + 22, min($tyy + $th - 8, $hy - 8));
    foreach ([[-1, 0], [1, 0], [0, -1], [0, 1]] as $d) imagettftext($im, 18, 0, $lx + $d[0] * 2, $ly + $d[1] * 2, $black, $B, $lbl);
    imagettftext($im, 18, 0, $lx, $ly, $white, $B, $lbl);
    imagerectangle($im, $tx - 1, $tyy - 1, $tx + $tw, $tyy + $th, $grid);
    imagettftext($im, 17, 0, $tx, $tyy + $th + 26, $dim, $R, 'Thermal ' . number_format($tlo, 0) . '–' . number_format($thi, 0) . ' °C');
}

// last readings, scaled from zero
$n = count($vals);
if ($n >= 2) {
    $x0 = 60; $x1 = $W - 60; $y0 = $thermal && count($tser) > 2 ? 500 : 400; $y1 = $H - 80;
    $max = max(1.0, (float)max($vals)) * 1.08;
    imageline($im, $x0, $y1, $x1, $y1, $grid);
    imagesetthickness($im, 4);
    $step = max(1, (int)ceil($n / 600));
    $px = null; $py = null;
    for ($i = 0; $i < $n; $i += $step) {
        $x = $x0 + ($x1 - $x0) * $i / ($n - 1);
        $y = $y1 - ($y1 - $y0) * (float)$vals[$i] / $max;
        if ($px !== null) imageline($im, (int)$px, (int)$py, (int)$x, (int)$y, $acc);
        $px = $x; $py = $y;
    }
    // temperatures on their own scale (fitted to their range), same time axis
    foreach ($tser as $t) {
        $tv = array_slice($t['vals'], -$n);
        $nn = count($tv);
        $known = array_filter($tv, fn($x) => $x !== null);
        if ($nn < 2 || !$known) continue;
        $lo = min($known); $hi = max($known);
        if ($hi - $lo < 10) { $mid = ($hi + $lo) / 2; $lo = $mid - 5; $hi = $mid + 5; }
        if ($lo < 0) { $lo = 0; if ($hi < 10) $hi = 10; }   // never below zero
        $px = null; $py = null;
        for ($i = 0; $i < $nn; $i += $step) {
            if ($tv[$i] === null) { $px = null; continue; }
            $x = $x0 + ($x1 - $x0) * $i / ($nn - 1);
            $y = $y1 - ($y1 - $y0) * ((float)$tv[$i] - $lo) / ($hi - $lo);
            if ($px !== null) imageline($im, (int)$px, (int)$py, (int)$x, (int)$y, $tcol[$t['ch']]);
            $px = $x; $py = $y;
        }
    }
    imagesetthickness($im, 1);
}
imagettftext($im, 24, 0, 60, $H - 28, $dim, $R, 'hCRI.io live station' . ($isRun ? ' · ' . (int)round(count($vals) * (float)$r['interval_s'] / 60) . ' min' : ''));

header('Content-Type: image/png');
header('Cache-Control: public, max-age=60');
imagepng($im);
