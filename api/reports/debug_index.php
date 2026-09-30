<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';

cors_headers();
$user = require_auth();
$db   = get_db();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Just return empty list for now
    json_out([]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Step by step debug
    $debug = [];
    $debug['files'] = !empty($_FILES) ? array_keys($_FILES) : 'none';
    $debug['file_name'] = $_FILES['file']['name'] ?? 'missing';
    $debug['file_size'] = $_FILES['file']['size'] ?? 0;
    $debug['user_id']   = $user['id'];

    // Try insert
    try {
        $db->prepare('INSERT INTO reports(user_id,label,source_type,cct,rf,rg) VALUES(?,?,?,?,?,?)')
           ->execute([$user['id'], 'debug test', 'csv', 3000, 85, 100]);

        $debug['lastInsertId'] = $db->lastInsertId();
        $debug['lastInsertId_int'] = (int)$db->lastInsertId();

        // Try fetch by id
        $id = (int)$db->lastInsertId();
        $s = $db->prepare('SELECT id,label FROM reports WHERE id=?');
        $s->execute([$id]);
        $row = $s->fetch();
        $debug['fetch_by_id'] = $row ? $row : 'null';

        // Try fetch most recent
        $s2 = $db->prepare('SELECT id,label FROM reports WHERE user_id=? ORDER BY id DESC LIMIT 3');
        $s2->execute([$user['id']]);
        $debug['recent_rows'] = $s2->fetchAll();

    } catch (\Throwable $e) {
        $debug['error'] = $e->getMessage();
    }

    json_out($debug);
}
