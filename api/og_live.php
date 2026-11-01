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
if (mb_strlen($title) > 44) $title = mb_substr($title, 0, 43) . '…';
imagettftext($im, 40, 0, 60, 100, $fg, $B, $title);
imagettftext($im, 26, 0, 60, 150, $chipCol, $B, '● ' . $chip);
$num = $last === null ? '–' : (abs($last) >= 100 ? (string)round($last) : number_format($last, 1));
imagettftext($im, 150, 0, 60, 340, $fg, $M, $num);
$bb = imagettfbbox(150, 0, $M, $num);
imagettftext($im, 44, 0, 60 + ($bb[2] - $bb[0]) + 24, 340, $dim, $R, $sum['unit'] ?: 'lm');

// last readings, scaled from zero
$n = count($vals);
if ($n >= 2) {
    $x0 = 60; $x1 = $W - 60; $y0 = 400; $y1 = $H - 80;
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
    imagesetthickness($im, 1);
}
imagettftext($im, 24, 0, 60, $H - 28, $dim, $R, 'hCRI.io live station' . ($isRun ? ' · ' . (int)round(count($vals) * (float)$r['interval_s'] / 60) . ' min' : ''));

header('Content-Type: image/png');
header('Cache-Control: public, max-age=60');
imagepng($im);
