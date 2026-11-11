<?php
// api/lights.php -- GET/POST /api/lights, GET/PATCH/DELETE /api/lights/:id,
//   POST /api/lights/:id/reports {reportIds:[..]}, DELETE|PATCH /api/lights/:id/reports/:reportId
declare(strict_types=1);
ini_set('display_errors', '0');
set_exception_handler(function($e) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code(500);
    if (function_exists('hcri_log_exception')) hcri_log_exception($e); else error_log((string)$e);
    echo json_encode(['error' => 'Server error']);
    exit;
});
set_error_handler(function($no, $str, $file, $line) { throw new \ErrorException($str, 0, $no, $file, $line); }, E_ALL & ~E_NOTICE & ~E_DEPRECATED);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/lights.php';

cors_headers();
$db   = get_db();
lights_ensure($db);
$path = rtrim(preg_replace('#^.*?/api/lights#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)), '/');

// ── Public lights (no sign-in): a light is public when at least one of its readings is, and only those readings show ──────────
if (preg_match('#^/public(?:/(\d+))?$#', $path, $pp)) {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
    $hid = [];
    try {
        $mids = array_map(fn($x) => (int)$x['id'], $db->query('SELECT DISTINCT u.id FROM users u JOIN reports r ON r.user_id = u.id WHERE u.name_masked = 1 AND r.is_public = 1 ORDER BY u.id')->fetchAll());
        foreach ($mids as $i => $mid) $hid[$mid] = count($mids) === 1 ? 'hidden' : 'hidden ' . ($i + 1);
    } catch (\Throwable $e) {}
    $sql = 'SELECT l.*, u.name AS owner_name FROM lights l LEFT JOIN users u ON u.id = l.user_id
             WHERE EXISTS (SELECT 1 FROM light_reports lr JOIN reports r ON r.id = lr.report_id WHERE lr.light_id = l.id AND r.is_public = 1)';
    if (!empty($pp[1])) {
        $s = $db->prepare($sql . ' AND l.id = ?'); $s->execute([(int)$pp[1]]);
        $l = $s->fetch();
        if (!$l) json_error('Not found', 404);
        $o = lights_summary($db, $l, true, true);
        $o['owner'] = $hid[(int)$l['user_id']] ?? ($l['owner_name'] ?: 'user');
        json_out($o);
    }
    $out = [];
    foreach ($db->query($sql . ' ORDER BY l.name ASC')->fetchAll() as $l) {
        $o = lights_summary($db, $l, false, true);
        $o['owner'] = $hid[(int)$l['user_id']] ?? ($l['owner_name'] ?: 'user');
        $out[] = $o;
    }
    json_out($out);
}

$user = require_auth();
$uid  = (int)$user['id'];
$m    = $_SERVER['REQUEST_METHOD'];

if ($path === '') {
    if ($m === 'GET') {
        $s = $db->prepare('SELECT * FROM lights WHERE user_id=? ORDER BY name ASC');
        $s->execute([$uid]);
        json_out(array_map(fn($l) => lights_summary($db, $l, false), $s->fetchAll()));
    }
    if ($m === 'POST') {
        $c = lights_clean(body());
        if ($c['name'] === '') json_error("'name' required");
        $db->prepare('INSERT INTO lights(user_id,name,brand,model,led_brand,led_model,optic,notes) VALUES(?,?,?,?,?,?,?,?)')->execute([$uid, $c['name'], $c['brand'], $c['model'], $c['led_brand'], $c['led_model'], $c['optic'], $c['notes']]);
        $id = (int)$db->lastInsertId();
        $ids = array_filter(array_map(fn($k) => hcri_rid($db, $k), (array)(body()['reportIds'] ?? [])));
        if ($ids) lights_attach($db, $uid, $id, $ids);
        json_out(lights_summary($db, lights_owned($db, $uid, $id), true), 201);
    }
    json_error('Method not allowed', 405);
}

if ($path === '/suggest' && $m === 'POST') {
    $ids = array_values(array_filter(array_map(fn($k) => hcri_rid($db, $k), (array)(body()['reportIds'] ?? []))));
    json_out(lights_suggest($db, $uid, $ids));
}

if (!preg_match('#^/(\d+)(?:/reports(?:/([A-Za-z0-9]+))?)?$#', $path, $pm)) json_error('Not found', 404);
$lid = (int)$pm[1];
$light = lights_owned($db, $uid, $lid);
if (!$light) json_error('Not found', 404);
$isReports = (bool)preg_match('#/reports#', $path);
$rkey = $pm[2] ?? '';

if (!$isReports) {
    if ($m === 'GET') json_out(lights_summary($db, $light, true));
    if ($m === 'PATCH') {
        $c = lights_clean(body(), $light);
        if ($c['name'] === '') json_error("'name' cannot be empty");
        $db->prepare('UPDATE lights SET name=?,brand=?,model=?,led_brand=?,led_model=?,optic=?,notes=? WHERE id=?')->execute([$c['name'], $c['brand'], $c['model'], $c['led_brand'], $c['led_model'], $c['optic'], $c['notes'], $lid]);
        json_out(lights_summary($db, lights_owned($db, $uid, $lid), true));
    }
    if ($m === 'DELETE') {   // only the grouping goes; the readings themselves are never touched
        $db->prepare('DELETE FROM light_reports WHERE light_id=?')->execute([$lid]);
        $db->prepare('DELETE FROM lights WHERE id=?')->execute([$lid]);
        json_out(['deleted' => true]);
    }
    json_error('Method not allowed', 405);
}

if ($rkey === '') {
    if ($m !== 'POST') json_error('Method not allowed', 405);
    $ids = array_values(array_filter(array_map(fn($k) => hcri_rid($db, $k), (array)(body()['reportIds'] ?? []))));
    if (!$ids) json_error("'reportIds' required");
    $added = lights_attach($db, $uid, $lid, $ids);
    json_out(['added' => $added, 'light' => lights_summary($db, $light, true)]);
}

$rid = hcri_rid($db, $rkey);
if (!$rid) json_error('Not found', 404);
if ($m === 'DELETE') {
    $db->prepare('DELETE FROM light_reports WHERE light_id=? AND report_id=?')->execute([$lid, $rid]);
    json_out(['removed' => true]);
}
if ($m === 'PATCH') {
    $label = mb_substr(trim((string)(body()['label'] ?? '')), 0, 80);
    $db->prepare('UPDATE light_reports SET label=? WHERE light_id=? AND report_id=?')->execute([$label, $lid, $rid]);
    json_out(['label' => $label]);
}
json_error('Method not allowed', 405);

/** Link the caller's own reports to a light (already-linked ones are skipped). Returns how many were new. */
function lights_attach(PDO $db, int $uid, int $lid, array $ids): int {
    $ids = array_values(array_unique(array_map('intval', $ids)));
    $in = implode(',', array_fill(0, count($ids), '?'));
    $own = $db->prepare("SELECT id FROM reports WHERE user_id=? AND id IN ($in)");
    $own->execute([$uid, ...$ids]);
    $n = 0;
    $ins = $db->prepare('INSERT IGNORE INTO light_reports(light_id,report_id) VALUES(?,?)');
    foreach ($own->fetchAll(PDO::FETCH_COLUMN) as $rid) { $ins->execute([$lid, (int)$rid]); $n += $ins->rowCount(); }
    return $n;
}
