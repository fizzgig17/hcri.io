<?php

// api/folders_item.php

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

preg_match('#/api/folders/(\d+)$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$id = isset($m[1]) ? (int)$m[1] : 0;
if (!$id) json_error('Invalid ID', 400);

$own = $db->prepare('SELECT id FROM folders WHERE id = ? AND user_id = ?');
$own->execute([$id, $user['id']]);
if (!$own->fetch()) json_error('Folder not found', 404);

// ── PATCH — rename ───────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $name = trim((string)($b['name'] ?? ''));
    if ($name === '') json_error("'name' required");
    if (mb_strlen($name) > 80) $name = mb_substr($name, 0, 80);

    $db->prepare('UPDATE folders SET name = ? WHERE id = ?')->execute([$name, $id]);
    json_out(['id' => $id, 'name' => $name]);
}

// ── DELETE — remove the folder; its reports become uncategorized, not deleted ─
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $db->prepare('UPDATE reports SET folder_id = NULL WHERE folder_id = ?')->execute([$id]);
    $db->prepare('DELETE FROM folders WHERE id = ?')->execute([$id]);
    json_out(['ok' => true]);
}

json_error('Method not allowed', 405);