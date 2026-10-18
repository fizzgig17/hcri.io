<?php
// api/v1_backup.php
declare(strict_types=1);

// Private cloud backup for the hCRI Companion app, authenticated by the person's API token.
//
//   GET  /api/v1/backup?after=<cursor>&limit=25   -> {"items":[{"id","savedAt","reading":{...}}], "next":"<cursor>"|null, "total":N}
//   POST /api/v1/backup  {"items":[{"id":"...","savedAt":1760000000000,"reading":{...}}]}   -> {"saved":N}
//   POST /api/v1/backup  {"delete":["id", ...]}                                           -> {"deleted":N}
//
// What is stored is private to the token's owner: it is not a report and never appears on any public page.
// Items are upserted by id, so repeating a request is harmless (the app retries until it succeeds).

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/ratelimit.php';
require_once __DIR__ . '/_core/companion_backup.php';

cors_headers();
header('Cache-Control: no-store');

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) json_error('Invalid or missing API token. Send "Authorization: Bearer <token>".', 401);
$uid = (int)$user['id'];

companion_backup_ensure($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = max(1, min(COMPANION_BACKUP_MAX_BATCH, (int)($_GET['limit'] ?? COMPANION_BACKUP_MAX_BATCH)));
    // Cursor is "<saved_at>:<item_id>" of the last row of the previous page; newest first.
    $after = (string)($_GET['after'] ?? '');
    $where = 'user_id = ?';
    $args  = [$uid];
    if ($after !== '' && preg_match('/^(\d{1,20}):([A-Za-z0-9._-]{1,64})$/', $after, $m)) {
        $where .= ' AND (saved_at < ? OR (saved_at = ? AND item_id < ?))';
        array_push($args, (int)$m[1], (int)$m[1], $m[2]);
    }
    $s = $db->prepare("SELECT item_id, saved_at, payload FROM companion_backups WHERE $where ORDER BY saved_at DESC, item_id DESC LIMIT " . ($limit + 1));
    $s->execute($args);
    $rows = $s->fetchAll();
    $next = null;
    if (count($rows) > $limit) {
        array_pop($rows);
        $last = end($rows);
        $next = $last['saved_at'] . ':' . $last['item_id'];
    }
    $items = [];
    foreach ($rows as $r) {
        $reading = json_decode((string)$r['payload'], true);
        if (!is_array($reading)) continue;
        $items[] = ['id' => $r['item_id'], 'savedAt' => (int)$r['saved_at'], 'reading' => $reading];
    }
    $c = $db->prepare('SELECT COUNT(*) FROM companion_backups WHERE user_id = ?');
    $c->execute([$uid]);
    json_out(['items' => $items, 'next' => $next, 'total' => (int)$c->fetchColumn()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

// A generous cap that still stops a runaway client.
if (rl_count('cbackup', (string)$uid, 60) > 120) json_error('Too many backup requests, try again in a minute', 429);
rl_hit('cbackup', (string)$uid, 60);

$b = body();

if (isset($b['delete']) && is_array($b['delete'])) {
    $n = 0;
    $del = $db->prepare('DELETE FROM companion_backups WHERE user_id = ? AND item_id = ?');
    foreach (array_slice($b['delete'], 0, 200) as $id) {
        if (!companion_backup_valid_id($id)) continue;
        $del->execute([$uid, $id]);
        $n += $del->rowCount();
    }
    json_out(['deleted' => $n]);
}

if (!isset($b['items']) || !is_array($b['items'])) json_error('Send {"items":[...]} or {"delete":[...]}', 400);
if (count($b['items']) > COMPANION_BACKUP_MAX_BATCH) json_error('Too many items in one request (max ' . COMPANION_BACKUP_MAX_BATCH . ')', 413);

$count = $db->prepare('SELECT COUNT(*) FROM companion_backups WHERE user_id = ?');
$count->execute([$uid]);
$have = (int)$count->fetchColumn();

$ins = $db->prepare(
    'INSERT INTO companion_backups (user_id, item_id, saved_at, payload) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE saved_at = VALUES(saved_at), payload = VALUES(payload)'
);
$exists = $db->prepare('SELECT 1 FROM companion_backups WHERE user_id = ? AND item_id = ?');

$saved = 0;
$skipped = [];
foreach ($b['items'] as $it) {
    $id = is_array($it) ? ($it['id'] ?? null) : null;
    if (!companion_backup_valid_id($id) || !isset($it['reading']) || !is_array($it['reading'])) { $skipped[] = is_string($id) ? $id : '?'; continue; }
    $json = json_encode($it['reading'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false || strlen($json) > COMPANION_BACKUP_MAX_ITEM_BYTES) { $skipped[] = $id; continue; }
    $exists->execute([$uid, $id]);
    $isNew = !$exists->fetchColumn();
    if ($isNew && $have >= COMPANION_BACKUP_MAX_PER_USER) { $skipped[] = $id; continue; }
    $ins->execute([$uid, $id, (int)($it['savedAt'] ?? 0), $json]);
    $saved++;
    if ($isNew) $have++;
}
json_out(['saved' => $saved, 'skipped' => $skipped]);
