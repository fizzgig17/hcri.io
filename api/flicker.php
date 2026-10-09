<?php
declare(strict_types=1);

// api/flicker.php -- flicker readings.
//
//   GET    /api/flicker                 your readings (no waveforms); ?unattached=1, ?report_id=N
//   GET    /api/flicker/{id}            one reading with its waveform (yours, or attached to a report you may view)
//   POST   /api/flicker                 create (JSON). Also at /api/v1/flicker for API-token clients (the app)
//   PATCH  /api/flicker/{id}            change label / notes / reportId (null detaches)
//   DELETE /api/flicker/{id}
//
// Auth: a personal API token ("hcri_...") or the normal login JWT.

ini_set('display_errors', '0');
set_exception_handler(function ($e) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
});

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/flicker.php';

cors_headers();
header('Cache-Control: no-store');

$db = get_db();
ensure_flicker_schema($db);
$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
preg_match('#/api/(?:v1/)?flicker(?:/(\d+))?/?$#', $path, $pm);
$id = isset($pm[1]) ? (int)$pm[1] : 0;

// ── who is calling ───────────────────────────────────────────────────────────
$myId = 0;
$isSuper = false;
$presented = api_token_from_request();
if ($presented !== '' && str_starts_with($presented, 'hcri_')) {
    $u = user_from_api_token($db, $presented);
    if ($u) $myId = (int)$u['id'];
} else {
    try {
        $hdr = get_auth_header();
        if (str_starts_with($hdr, 'Bearer ')) {
            $tok = jwt_verify(substr($hdr, 7));
            if ($tok && isset($tok['id'])) $myId = (int)$tok['id'];
        }
    } catch (\Throwable $e) {}
}
if ($myId > 0) {
    try { $q = $db->prepare('SELECT is_super_admin FROM users WHERE id=?'); $q->execute([$myId]); $isSuper = ((int)$q->fetchColumn()) === 1; } catch (\Throwable $e) {}
}

$shareTok = (string)($_GET['t'] ?? '');

/** The report must exist and belong to $uid. */
function own_report_or_fail(PDO $db, int $rid, int $uid): void {
    $s = $db->prepare('SELECT 1 FROM reports WHERE id=? AND user_id=?');
    $s->execute([$rid, $uid]);
    if (!$s->fetchColumn()) json_error('Report not found', 404);
}

// ── GET ──────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    if ($id) {
        $s = $db->prepare(flicker_select_sql(true) . ' WHERE f.id=?');
        $s->execute([$id]);
        $row = $s->fetch();
        if (!$row) json_error('Not found', 404);
        $mine = $myId > 0 && (int)$row['user_id'] === $myId;
        if (!$mine && !$isSuper) {
            // Someone else's reading is visible only through a report they may view.
            $rid = (int)($row['report_id'] ?? 0);
            if (!$rid || !flicker_can_view_report($db, $rid, $myId, $shareTok)) json_error('Not found', 404);
        }
        json_out(flicker_out($row, true));
    }
    if ($myId <= 0) json_error('Sign in required', 401);
    $sql = flicker_select_sql(false) . ' WHERE f.user_id=?';
    $args = [$myId];
    if (!empty($_GET['unattached'])) $sql .= ' AND r.id IS NULL';
    if (!empty($_GET['report_id']))  { $sql .= ' AND f.report_id=?'; $args[] = (int)$_GET['report_id']; }
    $sql .= ' ORDER BY COALESCE(f.captured_at, f.created_at) DESC, f.id DESC LIMIT 500';
    $s = $db->prepare($sql);
    $s->execute($args);
    json_out(['readings' => array_map(fn($r) => flicker_out($r, false), $s->fetchAll())]);
}

if ($myId <= 0) json_error('Invalid or missing token', 401);

// ── POST (create) ────────────────────────────────────────────────────────────
if ($method === 'POST' && !$id) {
    $b = body();
    try { $c = flicker_clean_payload($b, true); }
    catch (InvalidArgumentException $e) { json_error($e->getMessage(), 400); }
    $reportId = isset($b['reportId']) && $b['reportId'] !== null && $b['reportId'] !== '' ? (int)$b['reportId'] : null;
    if ($reportId) own_report_or_fail($db, $reportId, $myId);
    $label = trim((string)($b['label'] ?? ''));
    if ($label === '') $label = 'Flicker ' . gmdate('Y-m-d H:i');
    $captured = null;
    if (!empty($b['capturedAt'])) { $ts = strtotime((string)$b['capturedAt']); if ($ts) $captured = gmdate('Y-m-d H:i:s', $ts); }
    $settings = isset($b['settings']) && is_array($b['settings']) ? json_encode($b['settings']) : null;
    $s = $db->prepare('INSERT INTO flicker_readings(user_id,report_id,label,notes,model,frequency_hz,percent_flicker,flicker_index,cycle_ms,span_ms,waveform,settings,captured_at)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $s->execute([$myId, $reportId, mb_substr($label, 0, 255), (string)($b['notes'] ?? ''), isset($b['model']) ? mb_substr((string)$b['model'], 0, 255) : null,
                 $c['frequency_hz'], $c['percent_flicker'], $c['flicker_index'], $c['cycle_ms'], $c['span_ms'], $c['waveform'], $settings, $captured]);
    json_out(['success' => true, 'id' => (int)$db->lastInsertId(), 'reportId' => $reportId], 201);
}

if (!$id) json_error('Invalid ID', 400);

$s = $db->prepare('SELECT * FROM flicker_readings WHERE id=?');
$s->execute([$id]);
$row = $s->fetch();
if (!$row || ((int)$row['user_id'] !== $myId && !$isSuper)) json_error('Not found', 404);
$ownerId = (int)$row['user_id'];

// ── PATCH ────────────────────────────────────────────────────────────────────
if ($method === 'PATCH') {
    $b = body();
    $set = []; $args = [];
    if (array_key_exists('label', $b)) { $l = trim((string)$b['label']); if ($l === '') json_error('Title cannot be empty', 400); $set[] = 'label=?'; $args[] = mb_substr($l, 0, 255); }
    if (array_key_exists('notes', $b)) { $set[] = 'notes=?'; $args[] = (string)$b['notes']; }
    if (array_key_exists('reportId', $b)) {
        $rid = $b['reportId'] === null || $b['reportId'] === '' ? null : (int)$b['reportId'];
        if ($rid) own_report_or_fail($db, $rid, $ownerId);
        $set[] = 'report_id=?'; $args[] = $rid;
    }
    if (!$set) json_error('Nothing to update', 400);
    $args[] = $id;
    $db->prepare('UPDATE flicker_readings SET ' . implode(',', $set) . ' WHERE id=?')->execute($args);
    $q = $db->prepare(flicker_select_sql(false) . ' WHERE f.id=?');
    $q->execute([$id]);
    json_out(flicker_out($q->fetch(), false));
}

// ── DELETE ───────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $db->prepare('DELETE FROM flicker_readings WHERE id=?')->execute([$id]);
    json_out(['success' => true]);
}

json_error('Method not allowed', 405);
