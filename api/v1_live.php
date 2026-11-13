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
//   POST /api/v1/live {"action":"info","title":"...","details":"..."} -> what you are testing, shown on the live page (empty clears it)
//   POST /api/v1/live {"action":"clear"}   -> forgets the current/last run
//   POST /api/v1/live {"action":"command","command":"start|stop|clear"} -> asks the connected logger/app to do it; the answer to its next push carries {command:{id,action}}, and it sends "ack":id back
//   POST /api/v1/live {"runId","kind":"run|monitor","label","unit","intervalSeconds","startIndex","values":[...],"status":"running|finished|error","message",
//                      "temps":[{"ch":0,"name":"Temp 1","values":[...]}]}   (optional: temperatures, one per reading in "values", null for none)
//        Optional "thermal":{"die":C,"px":[768 temperatures in C, row by row]} (an MLX90640 image; only the newest is kept and it expires after 2 minutes),
//        and "thermal":null to clear it.
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
    } elseif ($action === 'info') {
        $title = mb_substr(trim((string)($b['title'] ?? '')), 0, 160);
        $details = mb_substr(trim((string)($b['details'] ?? '')), 0, 2000);
        $db->prepare('UPDATE live_stations SET info_title = ?, info_text = ? WHERE user_id = ?')->execute([$title, $details === '' ? null : $details, $uid]);
    } elseif ($action === 'clear') {
        $db->prepare("UPDATE live_stations SET run_id = '', label = '', points = 0, base = 0, payload = NULL, temps = NULL, thermal = NULL, status = 'idle', message = '', started_at = NULL, last_at = NULL, alerts = NULL WHERE user_id = ?")->execute([$uid]);
    } elseif ($action === 'command') {
        // Remote control: a sender that is connected to the tester (the web logger or the app) carries it out with its next push.
        $c = (string)($b['command'] ?? '');
        if (!in_array($c, ['start', 'stop', 'clear'], true)) json_error('command must be start, stop or clear', 400);
        $db->prepare('UPDATE live_stations SET cmd = ?, cmd_id = ?, cmd_at = ? WHERE user_id = ?')->execute([$c, bin2hex(random_bytes(6)), time(), $uid]);
        // While a sender is live it clears the station itself (so its stream restarts clean); otherwise there is nobody to do it, so do it here.
        if ($c === 'clear' && !($r['status'] === 'running' && !live_is_stale($r))) $db->prepare("UPDATE live_stations SET run_id = '', label = '', points = 0, base = 0, payload = NULL, temps = NULL, thermal = NULL, status = 'idle', message = '', started_at = NULL, last_at = NULL, alerts = NULL WHERE user_id = ?")->execute([$uid]);
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
// Temperatures: [{"ch":0,"name":"Temp 1","values":[..]}], the same readings (one per second) as "values", null where a sensor gave nothing.
$temps = [];
if (is_array($b['temps'] ?? null)) foreach (array_slice($b['temps'], 0, 4) as $t) {
    if (!is_array($t)) continue;
    $ch = (int)($t['ch'] ?? -1);
    $tv = $t['values'] ?? [];
    if ($ch < 0 || $ch > 3 || !is_array($tv) || count($tv) > 5000) continue;
    $temps[$ch] = ['name' => mb_substr(trim((string)($t['name'] ?? '')), 0, 24), 'values' => array_map(fn($v) => $v === null ? null : round((float)$v, 2), array_values($tv))];
}
// A thermal camera image (32 x 24): kept as the latest one. thermal:null clears it; leaving the key out leaves it alone.
$thermalSet = array_key_exists('thermal', $b);
$thermal = $thermalSet ? live_thermal_clean($b['thermal']) : null;
$status = (string)($b['status'] ?? 'running');
if (!in_array($status, ['running', 'finished', 'error'], true)) $status = 'running';
$message = mb_substr(trim((string)($b['message'] ?? '')), 0, 200);
$label = mb_substr(trim((string)($b['label'] ?? '')), 0, 160);
$unit = mb_substr(trim((string)($b['unit'] ?? 'lm')), 0, 16) ?: 'lm';
$interval = max(0.05, min(3600, (float)($b['intervalSeconds'] ?? 1)));
$kind = ($b['kind'] ?? 'run') === 'monitor' ? 'monitor' : 'run';
$ack = preg_replace('/[^a-f0-9]/', '', (string)($b['ack'] ?? ''));
if ($ack !== '' && $ack === $r['cmd_id']) $db->prepare("UPDATE live_stations SET cmd = '' WHERE user_id = ? AND cmd_id = ?")->execute([$uid, $ack]);

$db->beginTransaction();
try {
    $s = $db->prepare('SELECT * FROM live_stations WHERE user_id = ? FOR UPDATE');
    $s->execute([$uid]);
    $r = $s->fetch();
    $now = time();
    $fresh = $r['run_id'] !== $runId;
    $have = $fresh ? [] : (json_decode((string)$r['payload'], true) ?: []);
    $base = $fresh ? 0 : (int)($r['base'] ?? 0);
    $count = $base + count($have);
    if ($start > $count) {
        $db->commit();
        json_out(['count' => $count, 'resend' => true] + live_cmd_reply($r, $ack));
    }
    if ($start < $base) {   // the monitor already dropped those
        $cut = $base - $start;
        $values = array_slice($values, $cut);
        foreach ($temps as $ch => $t) $temps[$ch]['values'] = array_slice($t['values'], $cut);
        $start = $base;
    }
    $keep = $start - $base;
    $merged = array_merge(array_slice($have, 0, $keep), $values);
    $cap = $kind === 'monitor' ? LIVE_MONITOR_POINTS : LIVE_MAX_POINTS;
    if (count($merged) > $cap) { $base += count($merged) - $cap; $merged = array_slice($merged, -$cap); }
    $total = $base + count($merged);
    // Temperatures follow the readings: each series is padded and cut so it lines up with $merged index for index.
    $haveT = $fresh ? [] : (json_decode((string)($r['temps'] ?? ''), true) ?: []);
    $n = count($merged);
    $tstore = [];
    foreach ([0, 1, 2, 3] as $ch) {
        if (!isset($temps[$ch]) && !isset($haveT[$ch])) continue;
        $old = array_slice($haveT[$ch]['values'] ?? [], 0, $keep);
        if (count($old) < $keep) $old = array_merge($old, array_fill(0, $keep - count($old), null));
        $tm = array_merge($old, $temps[$ch]['values'] ?? []);
        $c = count($tm);
        if ($c > $n) $tm = array_slice($tm, $c - $n);
        elseif ($c < $n) $tm = array_merge($tm, array_fill(0, $n - $c, null));
        $name = isset($temps[$ch]) && $temps[$ch]['name'] !== '' ? $temps[$ch]['name'] : (string)($haveT[$ch]['name'] ?? '');
        $tstore[$ch] = ['name' => $name, 'values' => $tm];
    }
    $alerts = $fresh ? [] : (json_decode((string)$r['alerts'], true) ?: []);
    if ($values) unset($alerts['stale']);   // data is flowing again: a later silence may alert again
    $row = array_merge($r, [
        'run_id' => $runId, 'label' => $label !== '' ? $label : ($fresh ? '' : $r['label']), 'unit' => $unit, 'interval_s' => $interval,
        'points' => $total, 'kind' => $kind, 'status' => $status, 'message' => $status === 'running' ? '' : $message,
    ]);
    live_alerts($db, $row, $alerts, $merged);
    $db->prepare('UPDATE live_stations SET run_id=?, label=?, unit=?, interval_s=?, points=?, payload=?, temps=?, kind=?, base=?, status=?, message=?, started_at=?, last_at=?, alerts=? WHERE user_id=?')
       ->execute([$runId, $row['label'], $unit, $interval, $total, json_encode($merged), $tstore ? json_encode($tstore) : null, $kind, $base, $status, $row['message'],
                  $fresh ? $now : ($r['started_at'] ?: $now), $now, json_encode($alerts), $uid]);
    // thermal: a new image replaces the old one; a new run (or thermal:null) drops the old run's image
    if ($thermal !== null) $db->prepare('UPDATE live_stations SET thermal = ? WHERE user_id = ?')->execute([json_encode($thermal), $uid]);
    elseif ($thermalSet || $fresh) $db->prepare('UPDATE live_stations SET thermal = NULL WHERE user_id = ?')->execute([$uid]);
    $db->commit();
} catch (\Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log('live push: ' . $e->getMessage());
    json_error('Could not save the readings', 500);
}
json_out(['count' => $total] + live_cmd_reply($r, $ack));
