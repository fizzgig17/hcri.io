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
if ($run['kind'] === 'run' && $since >= 0 && $since <= count($vals) && count($vals) <= 4000) {
    $out['from'] = $since;
    $out['values'] = array_slice($vals, $since);
    $run['intervalSeconds'] = $interval;
} else {
    [$dv, $di] = $run['kind'] === 'monitor' ? [$vals, $interval] : runtime_downsample($vals, $interval);
    $out['from'] = 0;
    $out['values'] = $dv;
    $run['intervalSeconds'] = $di;
}
$out['run'] = $run;
$out['info'] = live_info($r);
json_out($out);
