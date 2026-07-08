<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';

cors_headers();

$user = require_auth();
$uid  = (int)$user['id'];
$db   = get_db();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // All of the current user's reports that currently have an active share token
    $s = $db->prepare('SELECT id, label, share_token, is_public, created_at FROM reports WHERE user_id = ? AND share_token IS NOT NULL ORDER BY created_at DESC');
    $s->execute([$uid]);
    $tokens = [];
    foreach ($s->fetchAll() as $r) {
        $tokens[] = [
            'id'        => (int)$r['id'],
            'label'     => $r['label'],
            'token'     => $r['share_token'],
            'private'   => ((int)($r['is_public'] ?? 1)) === 0,
            'createdAt' => $r['created_at'],
        ];
    }
    json_out(['tokens' => $tokens]);
}

if ($method === 'DELETE') {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('#/api/share_tokens/(\d+)$#', $path, $m)) {
        // Clear a single report's share token (ownership enforced)
        $id = (int)$m[1];
        $db->prepare('UPDATE reports SET share_token = NULL WHERE id = ? AND user_id = ?')->execute([$id, $uid]);
        json_out(['ok' => true, 'cleared' => $id]);
    }
    // Clear all of the current user's share tokens
    $db->prepare('UPDATE reports SET share_token = NULL WHERE user_id = ? AND share_token IS NOT NULL')->execute([$uid]);
    json_out(['ok' => true, 'clearedAll' => true]);
}

json_error('Method not allowed', 405);