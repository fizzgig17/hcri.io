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
//          Optional info rows under the header, first cell "#group", "#unit", "#cct", "#duv", "#cri", "#r9", "#r12", "#rf", "#rg", "#tempF".
//          Optional query: ?group=<name>&unit=<lumens>
//          Optional per item: "meta":{"cct","duv","cri","r9","r12","rf","rg","tempF"}. An item with only label + meta updates the readings of an existing curve.
//   POST   /api/v1/runtime?share=<id>           -> {"shareToken":"..."}  (makes or reuses the curve's share link token)
//   POST   /api/v1/runtime?unshare=<id>         -> {"shareToken":null}   (stops sharing; old links stop working)
//   POST   /api/v1/runtime?trim=<id>            -> {"trimmed":N,"points":M}  (drops the near-dark readings before the light came on)
//   DELETE /api/v1/runtime?id=<id>              -> {"deleted":1}   (or POST ?delete=<id>)
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
        $s = $db->prepare('SELECT curve_id, label, group_name, unit, interval_s, points, payload, meta, share_token FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
        $s->execute([$uid, $id]);
        $r = $s->fetch();
        if (!$r) json_error('Not found', 404);
        $vals = json_decode((string)$r['payload'], true);
        json_out(['id' => $r['curve_id'], 'label' => $r['label'], 'group' => $r['group_name'], 'unit' => $r['unit'],
                  'intervalSeconds' => (float)$r['interval_s'], 'points' => (int)$r['points'], 'meta' => json_decode((string)$r['meta'], true) ?: new stdClass(), 'shareToken' => $r['share_token'] ?? null,
                  'values' => is_array($vals) ? $vals : []]);
    }
    $full = !empty($_GET['full']); // ?full=1 also returns every curve's values (the website uses this)
    $s = $db->prepare('SELECT curve_id, label, group_name, unit, interval_s, points, meta, share_token, updated_at' . ($full ? ', payload' : '') . ' FROM runtime_curves WHERE user_id = ? ORDER BY group_name, label');
    $s->execute([$uid]);
    $items = [];
    foreach ($s->fetchAll() as $r) {
        $row = ['id' => $r['curve_id'], 'label' => $r['label'], 'group' => $r['group_name'], 'unit' => $r['unit'],
                'intervalSeconds' => (float)$r['interval_s'], 'points' => (int)$r['points'], 'meta' => json_decode((string)$r['meta'], true) ?: new stdClass(), 'shareToken' => $r['share_token'] ?? null, 'updatedAt' => $r['updated_at']];
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

if (isset($_GET['delete'])) {   // same as DELETE ?id=, for clients and hosts that only allow GET and POST
    $did = $_GET['delete'];
    if (!runtime_curve_valid_id($did)) json_error('Bad id', 400);
    $d = $db->prepare('DELETE FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
    $d->execute([$uid, $did]);
    json_out(['deleted' => $d->rowCount()]);
}

if (isset($_GET['trim'])) {
    $tid = $_GET['trim'];
    if (!runtime_curve_valid_id($tid)) json_error('Bad id', 400);
    $q = $db->prepare('SELECT interval_s, payload FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
    $q->execute([$uid, $tid]);
    $row = $q->fetch();
    if (!$row) json_error('Not found', 404);
    $vals = json_decode((string)$row['payload'], true);
    if (!is_array($vals)) json_error('Curve has no values', 422);
    $new = runtime_trim_leading($vals, (float)$row['interval_s']);
    $n = count($vals) - count($new);
    if ($n > 0) {
        $db->prepare('UPDATE runtime_curves SET payload = ?, points = ? WHERE user_id = ? AND curve_id = ?')->execute([json_encode($new), count($new), $uid, $tid]);
    }
    json_out(['trimmed' => $n, 'points' => count($new)]);
}

// Sharing: a curve stays private until its owner makes a link. Asking again returns the same token, so a link already handed
// out is never silently replaced; unshare clears it and the old link stops working.
foreach (['share', 'unshare'] as $act) {
    if (!isset($_GET[$act])) continue;
    $sid = $_GET[$act];
    if (!runtime_curve_valid_id($sid)) json_error('Bad id', 400);
    $cur = $db->prepare('SELECT share_token FROM runtime_curves WHERE user_id = ? AND curve_id = ?');
    $cur->execute([$uid, $sid]);
    $row = $cur->fetch();
    if (!$row) json_error('Not found', 404);
    if ($act === 'unshare') {
        $db->prepare('UPDATE runtime_curves SET share_token = NULL WHERE user_id = ? AND curve_id = ?')->execute([$uid, $sid]);
        json_out(['shareToken' => null]);
    }
    $tok = (string)($row['share_token'] ?? '');
    if ($tok === '') {
        $tok = runtime_new_share_token($db);
        $db->prepare('UPDATE runtime_curves SET share_token = ? WHERE user_id = ? AND curve_id = ?')->execute([$tok, $uid, $sid]);
    }
    json_out(['shareToken' => $tok]);
}

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
    'INSERT INTO runtime_curves (user_id, curve_id, label, group_name, unit, interval_s, points, payload, meta) VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE label = VALUES(label), group_name = VALUES(group_name), unit = VALUES(unit),
                             interval_s = VALUES(interval_s), points = VALUES(points), payload = VALUES(payload),
                             meta = COALESCE(VALUES(meta), meta)'
);
$setMeta = $db->prepare('UPDATE runtime_curves SET meta = ? WHERE user_id = ? AND curve_id = ?');

$saved = 0;
$skipped = [];
foreach ($items as $it) {
    $label = is_array($it) ? trim((string)($it['label'] ?? '')) : '';
    // {"label":..., "meta":{...}} with no values: attach meter readings to a curve that already exists.
    if (is_array($it) && !isset($it['values']) && isset($it['meta'])) {
        $mid = runtime_curve_id($label);
        $exists->execute([$uid, $mid]);
        if ($label === '' || !$exists->fetchColumn()) { $skipped[] = ['label' => $label, 'reason' => 'no such curve to attach readings to']; continue; }
        $mm = runtime_meta_clean($it['meta']);
        $setMeta->execute([$mm ? json_encode($mm) : null, $uid, $mid]);
        $saved++;
        continue;
    }
    $c = runtime_curve_normalize($it);
    if (is_string($c)) { $skipped[] = ['label' => $label, 'reason' => $c]; continue; }
    $id = runtime_curve_id($c['label']);
    $exists->execute([$uid, $id]);
    $isNew = !$exists->fetchColumn();
    if ($isNew && $have >= RUNTIME_MAX_PER_USER) { $skipped[] = ['label' => $c['label'], 'reason' => 'curve limit reached (' . RUNTIME_MAX_PER_USER . ')']; continue; }
    $json = json_encode($c['values']);
    if ($json === false) { $skipped[] = ['label' => $c['label'], 'reason' => 'values could not be stored']; continue; }
    $ins->execute([$uid, $id, $c['label'], $c['group'], $c['unit'], $c['interval'], count($c['values']), $json, $c['meta'] ? json_encode($c['meta']) : null]);
    $saved++;
    if ($isNew) $have++;
}
json_out(['saved' => $saved, 'skipped' => $skipped]);
