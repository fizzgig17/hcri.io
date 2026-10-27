<?php
// api/runtime_shared.php
declare(strict_types=1);

// GET /api/runtime_shared?t=<token>[,<token>...]
//
// Public (no sign-in) read of runtime curves their owners have shared. A curve is only returned if its share token matches;
// curves without a token stay private. Up to 12 tokens, so the same link form carries one light or a comparison.
// Returns label, group, unit, interval, meta and values only: never the owner or any account detail.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/ratelimit.php';
require_once __DIR__ . '/_core/runtime_curves.php';

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
if (rl_count('runtime_shared', $ip, 60) > 120) json_error('Too many requests, try again in a minute', 429);
rl_hit('runtime_shared', $ip, 60);

$toks = array_values(array_unique(array_filter(array_map('trim', explode(',', (string)($_GET['t'] ?? ''))), 'runtime_valid_share_token')));
if (!$toks) json_error('No valid share token', 400);
$toks = array_slice($toks, 0, 12);

$db = get_db();
runtime_curves_ensure($db);
$s = $db->prepare('SELECT label, group_name, unit, interval_s, points, payload, meta FROM runtime_curves WHERE share_token = ?');
$items = [];
foreach ($toks as $t) {
    $s->execute([$t]);
    $r = $s->fetch();
    if (!$r) continue;
    $v = json_decode((string)$r['payload'], true);
    [$dv, $di] = runtime_downsample(is_array($v) ? $v : [], (float)$r['interval_s']);   // long curves are averaged down for drawing
    $items[] = ['id' => $t, 'label' => $r['label'], 'group' => $r['group_name'], 'unit' => $r['unit'],
                'intervalSeconds' => $di, 'points' => (int)$r['points'],
                'meta' => json_decode((string)$r['meta'], true) ?: new stdClass(), 'values' => $dv];
}
if (!$items) json_error('This runtime link is not shared (any more)', 404);
json_out(['items' => $items, 'requested' => count($toks)]);
