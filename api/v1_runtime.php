<?php
// api/v1_runtime.php
declare(strict_types=1);

// Private runtime (output-over-time) curves, authenticated by the person's API token.
//
//   GET    /api/v1/runtime                      -> {"items":[{"id","label","group","unit","intervalSeconds","points","updatedAt"}], "total":N}
//   GET    /api/v1/runtime?full=1               -> same list, each item also carrying "values"
//   GET    /api/v1/runtime?id=<id>              -> {"id","label","group","unit","intervalSeconds","points","values":[...]}
//   POST   /api/v1/runtime  {"items":[{"label","group","unit","intervalSeconds","values":[...]}]}   -> {"saved":N,"skipped":[...]}
//   POST   /api/v1/runtime  (Content-Type: text/csv, or multipart field "file")                      -> {"saved":N,"skipped":[...]}
//          CSV: first column = minutes, every other column = one light (header = its label).
//          Optional query: ?group=<name>&unit=<lumens>
//   DELETE /api/v1/runtime?id=<id>              -> {"deleted":1}
//
// The same endpoint is also served at /api/runtime for the website (session sign-in instead of an API token).
// Admins: add ?for_user=<id> to any call to act on that user's curves.
// Curves are stored per user and are private to the token's owner. Re-sending a label replaces that curve.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/ratelimit.php';
require_once __DIR__ . '/_core/runtime_curves.php';
require_once __DIR__ . '/_core/auth.php';

cors_headers();
header('Cache-Control: no-store');

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) $user = require_auth(); // the website sends its session token instead of an API token
$uid = (int)$user['id'];

// Admins can work on another user's curves: add ?for_user=<user id> (or a "for_user" form field).
$forUser = (int)($_GET['for_user'] ?? $_POST['for_user'] ?? 0);
if ($forUser > 0 && $forUser !== $uid) {
    $a = $db->prepare('SELECT is_admin FROM users WHERE id = ?');
    $a->execute([$uid]);
    if ((int)$a->fetchColumn() !== 1) json_error('Admins only', 403);
    $t = $db->prepare('SELECT 1 FROM users WHERE id = ?');
    $t->execute([$forUser]);
    if (!$t->fetchColumn()) json_error('No such user', 404);
    $uid = $forUser;
}

runtime_curves_ensure($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        if (!runtime_curve_valid_id($id)) json_error('Bad id', 400);
        $s = $db->prepare('SELECT curve_id, label, group_name, unit, interval_s, points, payload FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
        $s->execute([$uid, $id]);
        $r = $s->fetch();
        if (!$r) json_error('Not found', 404);
        $vals = json_decode((string)$r['payload'], true);
        json_out(['id' => $r['curve_id'], 'label' => $r['label'], 'group' => $r['group_name'], 'unit' => $r['unit'],
                  'intervalSeconds' => (float)$r['interval_s'], 'points' => (int)$r['points'], 'values' => is_array($vals) ? $vals : []]);
    }
    $full = !empty($_GET['full']); // ?full=1 also returns every curve's values (the website uses this)
    $s = $db->prepare('SELECT curve_id, label, group_name, unit, interval_s, points, updated_at' . ($full ? ', payload' : '') . ' FROM runtime_curves WHERE user_id = ? ORDER BY group_name, label');
    $s->execute([$uid]);
    $items = [];
    foreach ($s->fetchAll() as $r) {
        $row = ['id' => $r['curve_id'], 'label' => $r['label'], 'group' => $r['group_name'], 'unit' => $r['unit'],
                'intervalSeconds' => (float)$r['interval_s'], 'points' => (int)$r['points'], 'updatedAt' => $r['updated_at']];
        if ($full) { $v = json_decode((string)$r['payload'], true); $row['values'] = is_array($v) ? $v : []; }
        $items[] = $row;
    }
    json_out(['items' => $items, 'total' => count($items)]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!runtime_curve_valid_id($id)) json_error('Send ?id=<curve id>', 400);
    $d = $db->prepare('DELETE FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
    $d->execute([$uid, $id]);
    json_out(['deleted' => $d->rowCount()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

if (rl_count('runtime', (string)$uid, 60) > 30) json_error('Too many requests, try again in a minute', 429);
rl_hit('runtime', (string)$uid, 60);

// CSV (raw body or uploaded file) or JSON.
$type = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
$items = null;
if (!empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $parsed = runtime_curves_from_csv((string)file_get_contents($_FILES['file']['tmp_name']), trim((string)($_POST['group'] ?? $_GET['group'] ?? '')), trim((string)($_POST['unit'] ?? $_GET['unit'] ?? '')));
    if ($parsed['error']) json_error($parsed['error'], 400);
    $items = $parsed['items'];
} elseif (str_contains($type, 'text/csv') || str_contains($type, 'text/plain')) {
    $parsed = runtime_curves_from_csv((string)file_get_contents('php://input'), trim((string)($_GET['group'] ?? '')), trim((string)($_GET['unit'] ?? '')));
    if ($parsed['error']) json_error($parsed['error'], 400);
    $items = $parsed['items'];
} else {
    $b = body();
    if (isset($b['items']) && is_array($b['items'])) $items = $b['items'];
}
if ($items === null) json_error('Send {"items":[...]}, a text/csv body, or a multipart "file"', 400);
if (count($items) > RUNTIME_MAX_PER_BATCH) json_error('Too many curves in one request (max ' . RUNTIME_MAX_PER_BATCH . ')', 413);

$count = $db->prepare('SELECT COUNT(*) FROM runtime_curves WHERE user_id = ?');
$count->execute([$uid]);
$have = (int)$count->fetchColumn();

$exists = $db->prepare('SELECT 1 FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
$ins = $db->prepare(
    'INSERT INTO runtime_curves (user_id, curve_id, label, group_name, unit, interval_s, points, payload) VALUES (?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE label = VALUES(label), group_name = VALUES(group_name), unit = VALUES(unit),
                             interval_s = VALUES(interval_s), points = VALUES(points), payload = VALUES(payload)'
);

$saved = 0;
$skipped = [];
foreach ($items as $it) {
    $label = is_array($it) ? trim((string)($it['label'] ?? '')) : '';
    $c = runtime_curve_normalize($it);
    if (is_string($c)) { $skipped[] = ['label' => $label, 'reason' => $c]; continue; }
    $id = runtime_curve_id($c['label']);
    $exists->execute([$uid, $id]);
    $isNew = !$exists->fetchColumn();
    if ($isNew && $have >= RUNTIME_MAX_PER_USER) { $skipped[] = ['label' => $c['label'], 'reason' => 'curve limit reached (' . RUNTIME_MAX_PER_USER . ')']; continue; }
    $json = json_encode($c['values']);
    if ($json === false) { $skipped[] = ['label' => $c['label'], 'reason' => 'values could not be stored']; continue; }
    $ins->execute([$uid, $id, $c['label'], $c['group'], $c['unit'], $c['interval'], count($c['values']), $json]);
    $saved++;
    if ($isNew) $have++;
}
json_out(['saved' => $saved, 'skipped' => $skipped]);
