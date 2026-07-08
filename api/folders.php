<?php

// api/folders.php

declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_exception_handler(function($e) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);
    exit;
});
set_error_handler(function($no, $str, $file, $line) {
    throw new \ErrorException($str, 0, $no, $file, $line);
}, E_ALL & ~E_NOTICE & ~E_DEPRECATED);

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';

cors_headers();

$user = require_auth();
$user['id'] = (int)$user['id'];
$db = get_db();

// ── GET — list this user's folders, with a live count of reports in each ────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = $db->prepare(
        'SELECT f.id, f.name,
                (SELECT COUNT(*) FROM reports r WHERE r.folder_id = f.id) AS report_count
         FROM folders f
         WHERE f.user_id = ?
         ORDER BY f.sort_order ASC, f.id ASC'
    );
    $s->execute([$user['id']]);
    $rows = $s->fetchAll();
    json_out(array_map(fn($r) => [
        'id'    => (int)$r['id'],
        'name'  => $r['name'],
        'count' => (int)$r['report_count'],
    ], $rows));
}

// ── POST /api/folders/reorder — persist a drag-to-reorder of the folder list ─
// body: { folderIds: [id, id, id, ...] } in the desired display order.
$path = preg_replace('#^/api/folders#', '', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $path === '/reorder') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $ids = array_values(array_unique(array_map('intval', (array)($b['folderIds'] ?? []))));
    if (!$ids) json_error('folderIds required', 400);

    // Only ever reorder folders the caller actually owns.
    $in = implode(',', array_fill(0, count($ids), '?'));
    $own = $db->prepare("SELECT id FROM folders WHERE id IN ($in) AND user_id = ?");
    $own->execute([...$ids, $user['id']]);
    $ownedIds = array_map(fn($r) => (int)$r['id'], $own->fetchAll());

    $upd = $db->prepare('UPDATE folders SET sort_order = ? WHERE id = ? AND user_id = ?');
    $pos = 0;
    foreach ($ids as $id) {
        if (!in_array($id, $ownedIds, true)) continue;
        $upd->execute([$pos, $id, $user['id']]);
        $pos++;
    }
    json_out(['ok' => true, 'reordered' => $pos]);
}

// ── POST — create a new folder ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim((string)($b['name'] ?? ''));
    if ($name === '') json_error("'name' required");
    if (mb_strlen($name) > 80) $name = mb_substr($name, 0, 80);

    // Quietly reuse an existing folder with the same name instead of making a duplicate.
    $existing = $db->prepare('SELECT id FROM folders WHERE user_id = ? AND name = ?');
    $existing->execute([$user['id'], $name]);
    $row = $existing->fetch();
    if ($row) {
        json_out(['id' => (int)$row['id'], 'name' => $name, 'count' => 0]);
    }

    $next = $db->prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM folders WHERE user_id = ?');
    $next->execute([$user['id']]);
    $nextOrder = (int)$next->fetchColumn();

    $db->prepare('INSERT INTO folders (user_id, name, sort_order, created_at) VALUES (?, ?, ?, NOW())')
       ->execute([$user['id'], $name, $nextOrder]);
    $id = (int)$db->lastInsertId();
    json_out(['id' => $id, 'name' => $name, 'count' => 0]);
}

json_error('Method not allowed', 405);