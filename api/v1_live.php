<?php
// api/v1_live.php
declare(strict_types=1);

// The signed-in person's live station (also served at /api/live for the website, with the session sign-in).
//
//   GET  /api/v1/live                      -> {enabled, token, url, settings, run}
//   POST /api/v1/live {"action":"enable"}  -> turns the station on (makes the link on first use)
//   POST /api/v1/live {"action":"disable"} -> turns it off; the link shows "not live"
//   POST /api/v1/live {"action":"rotate"}  -> a new link; the old one stops working
//   POST /api/v1/live {"action":"settings","settings":{emailDone,emailLow,emailStale,emailError,lowLm,staleMin}}
//   POST /api/v1/live {"action":"clear"}   -> forgets the current/last run
//   POST /api/v1/live {"runId","label","unit","intervalSeconds","startIndex","values":[...],"status":"running|finished|error","message"}
//        -> {"count":N}   Sends readings. startIndex is where "values" begin in the run; sending an empty list is a heartbeat.
//        If startIndex is past what the server has, the answer is {"count":N,"resend":true}: send again from N.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/ratelimit.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/live_station.php';

cors_headers();
header('Cache-Control: no-store');

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) $user = require_auth();
$uid = (int)$user['id'];

live_ensure($db);
live_check_all($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_out(live_owner_view(live_row($db, $uid)));
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('GET or POST required', 405);

$b = body();
$r = live_row($db, $uid);
$action = (string)($b['action'] ?? '');

if ($action !== '') {
    if ($action === 'enable') {
        $tok = $r['token'] ?: bin2hex(random_bytes(12));
        $db->prepare('UPDATE live_stations SET enabled = 1, token = ? WHERE user_id = ?')->execute([$tok, $uid]);
    } elseif ($action === 'disable') {
        $db->prepare('UPDATE live_stations SET enabled = 0 WHERE user_id = ?')->execute([$uid]);
    } elseif ($action === 'rotate') {
        $db->prepare('UPDATE live_stations SET token = ? WHERE user_id = ?')->execute([bin2hex(random_bytes(12)), $uid]);
    } elseif ($action === 'settings') {
        $in = is_array($b['settings'] ?? null) ? $b['settings'] : [];
        $merged = array_merge(live_settings($r['settings']), $in);
        $db->prepare('UPDATE live_stations SET settings = ? WHERE user_id = ?')->execute([json_encode(live_settings(json_encode($merged))), $uid]);
    } elseif ($action === 'clear') {
        $db->prepare("UPDATE live_stations SET run_id = '', label = '', points = 0, payload = NULL, status = 'idle', message = '', started_at = NULL, last_at = NULL, alerts = NULL WHERE user_id = ?")->execute([$uid]);
    } else {
        json_error('Unknown action', 400);
    }
    json_out(live_owner_view(live_row($db, $uid)));
}

// ── Readings ─────────────────────────────────────────────────────────────
if (rl_count('live_push', (string)$uid, 60) > 90) json_error('Too many requests, slow down', 429);
rl_hit('live_push', (string)$uid, 60);

if (!$r['enabled'] || !$r['token']) json_out(['enabled' => false, 'count' => 0]);

$runId = preg_replace('/[^A-Za-z0-9_-]/', '', (string)($b['runId'] ?? ''));
if ($runId === '') json_error('runId required', 400);
$runId = substr($runId, 0, 48);
$values = $b['values'] ?? [];
if (!is_array($values) || count($values) > 5000) json_error('values must be a list of at most 5000 readings', 400);
$values = array_map(fn($v) => round((float)$v, 3), array_values($values));
$start = max(0, (int)($b['startIndex'] ?? 0));
$status = (string)($b['status'] ?? 'running');
if (!in_array($status, ['running', 'finished', 'error'], true)) $status = 'running';
$message = mb_substr(trim((string)($b['message'] ?? '')), 0, 200);
$label = mb_substr(trim((string)($b['label'] ?? '')), 0, 160);
$unit = mb_substr(trim((string)($b['unit'] ?? 'lm')), 0, 16) ?: 'lm';
$interval = max(0.05, min(3600, (float)($b['intervalSeconds'] ?? 1)));

$db->beginTransaction();
try {
    $s = $db->prepare('SELECT * FROM live_stations WHERE user_id = ? FOR UPDATE');
    $s->execute([$uid]);
    $r = $s->fetch();
    $now = time();
    $fresh = $r['run_id'] !== $runId;
    $have = $fresh ? [] : (json_decode((string)$r['payload'], true) ?: []);
    if ($start > count($have)) {
        $db->commit();
        json_out(['count' => count($have), 'resend' => true]);
    }
    $merged = array_merge(array_slice($have, 0, $start), $values);
    if (count($merged) > LIVE_MAX_POINTS) $merged = array_slice($merged, -LIVE_MAX_POINTS);
    $alerts = $fresh ? [] : (json_decode((string)$r['alerts'], true) ?: []);
    if ($values) unset($alerts['stale']);   // data is flowing again: a later silence may alert again
    $row = array_merge($r, [
        'run_id' => $runId, 'label' => $label !== '' ? $label : ($fresh ? '' : $r['label']), 'unit' => $unit, 'interval_s' => $interval,
        'points' => count($merged), 'status' => $status, 'message' => $status === 'running' ? '' : $message,
    ]);
    live_alerts($db, $row, $alerts, $merged);
    $db->prepare('UPDATE live_stations SET run_id=?, label=?, unit=?, interval_s=?, points=?, payload=?, status=?, message=?, started_at=?, last_at=?, alerts=? WHERE user_id=?')
       ->execute([$runId, $row['label'], $unit, $interval, count($merged), json_encode($merged), $status, $row['message'],
                  $fresh ? $now : ($r['started_at'] ?: $now), $now, json_encode($alerts), $uid]);
    $db->commit();
} catch (\Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log('live push: ' . $e->getMessage());
    json_error('Could not save the readings', 500);
}
json_out(['count' => count($merged)]);
