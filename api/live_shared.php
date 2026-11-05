<?php
// api/live_shared.php
declare(strict_types=1);

// GET /api/live_shared?t=<station token>[&since=<number of readings already held>]
//
// Public (no sign-in) view of a live station: the run that is going now, or the last one. Returns the label, status,
// timing and the readings (averaged down when the run is long), never the owner or any account detail.
// With &since=N and a short run the answer carries only the new readings ("values" start at "from").

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/ratelimit.php';
require_once __DIR__ . '/_core/runtime_curves.php';
require_once __DIR__ . '/_core/live_station.php';

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
if (rl_count('live_shared', $ip, 60) > 180) json_error('Too many requests, try again in a minute', 429);
rl_hit('live_shared', $ip, 60);

$t = (string)($_GET['t'] ?? '');
if (!live_valid_token($t)) json_error('No valid live link', 400);

$db = get_db();
live_ensure($db);
live_check_all($db);
$s = $db->prepare('SELECT * FROM live_stations WHERE token = ?');
$s->execute([$t]);
$r = $s->fetch();
if (!$r) json_error('This live link does not exist (any more)', 404);

$out = ['live' => (bool)$r['enabled'], 'serverTime' => gmdate('c')];
if (!$r['enabled']) json_out($out + ['run' => null]);

$run = live_run_summary($r);
$vals = json_decode((string)$r['payload'], true);
$vals = is_array($vals) ? $vals : [];
$interval = (float)$r['interval_s'];
$since = isset($_GET['since']) ? (int)$_GET['since'] : -1;
$tj = json_decode((string)($r['temps'] ?? ''), true);
$tj = is_array($tj) ? $tj : [];
$incremental = $run['kind'] === 'run' && $since >= 0 && $since <= count($vals) && count($vals) <= 4000;
$k = count($vals) > RUNTIME_LIST_POINTS ? (int)ceil(count($vals) / RUNTIME_LIST_POINTS) : 1;   // the same averaging factor runtime_downsample() uses
if ($incremental) {
    $out['from'] = $since;
    $out['values'] = array_slice($vals, $since);
    $run['intervalSeconds'] = $interval;
} else {
    [$dv, $di] = $run['kind'] === 'monitor' ? [$vals, $interval] : runtime_downsample($vals, $interval);
    $out['from'] = 0;
    $out['values'] = $dv;
    $run['intervalSeconds'] = $di;
}
// Temperatures (Temp 1..3), lined up with "values": the same slice or the same averaging.
$out['temps'] = [];
foreach ([0, 1, 2] as $ch) {
    $tv = $tj[$ch]['values'] ?? null;
    if (!is_array($tv) || !array_filter($tv, fn($x) => $x !== null)) continue;
    if ($incremental) $tv = array_slice($tv, $since);
    elseif ($k > 1) {
        $avg = [];
        for ($i = 0; $i < count($tv); $i += $k) {
            $chunk = array_filter(array_slice($tv, $i, $k), fn($x) => $x !== null);
            $avg[] = $chunk ? round(array_sum($chunk) / count($chunk), 2) : null;
        }
        $tv = $avg;
    }
    $nm = trim((string)($tj[$ch]['name'] ?? ''));
    $out['temps'][] = ['ch' => $ch, 'name' => $nm !== '' ? $nm : 'Temp ' . ($ch + 1), 'values' => $tv];
}
$out['run'] = $run;
$out['info'] = live_info($r);
json_out($out);
