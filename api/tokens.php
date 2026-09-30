<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
$__apitok = __DIR__ . '/_core/api_token.php';
if (is_file($__apitok)) require_once $__apitok;

cors_headers();
header('Cache-Control: no-store');

$user = require_auth();
$uid  = (int)$user['id'];
$db   = get_db();
$m    = $_SERVER['REQUEST_METHOD'];
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^.*?/api/tokens#', '', $uri); // '' | '/{id}'

function token_row(array $r): array {
    return [
        'id'         => (int)$r['id'],
        'name'       => $r['name'],
        'prefix'     => $r['token_prefix'],
        'createdAt'  => $r['created_at'],
        'lastUsedAt' => $r['last_used_at'] ?? null,
    ];
}

// ── GET /api/tokens — list the user's tokens (never the secret) ───────────────
if ($m === 'GET' && ($path === '' || $path === '/')) {
    try {
        $s = $db->prepare('SELECT id,name,token_prefix,created_at,last_used_at FROM api_tokens WHERE user_id=? ORDER BY id DESC');
        $s->execute([$uid]);
        json_out(array_map('token_row', $s->fetchAll()));
    } catch (\Throwable $e) {
        json_out([]); // table may not exist yet
    }
}

// ── POST /api/tokens — create a token; returns the plaintext ONCE ─────────────
if ($m === 'POST' && ($path === '' || $path === '/')) {
    $b    = body();
    $name = trim((string)($b['name'] ?? '')) ?: 'API token';
    if (mb_strlen($name) > 100) $name = mb_substr($name, 0, 100);

    if (!function_exists('api_token_generate')) json_error('Server is missing api/_core/api_token.php — deploy it to api/_core/', 500);
    $plain  = api_token_generate();
    try {
        $db->prepare('INSERT INTO api_tokens (user_id,name,token_hash,token_prefix) VALUES (?,?,?,?)')
           ->execute([$uid, $name, api_token_hash($plain), api_token_prefix($plain)]);
    } catch (\Throwable $e) {
        json_error('Could not create token — run the api_tokens.sql migration', 500);
    }
    $id = (int)$db->lastInsertId();
    json_out([
        'id'        => $id,
        'name'      => $name,
        'prefix'    => api_token_prefix($plain),
        'token'     => $plain, // shown once
        'createdAt' => date('Y-m-d H:i:s'),
    ], 201);
}

// ── DELETE /api/tokens/{id} — revoke ──────────────────────────────────────────
if ($m === 'DELETE' && preg_match('#^/(\d+)$#', $path, $mm)) {
    $tid = (int)$mm[1];
    $db->prepare('DELETE FROM api_tokens WHERE id=? AND user_id=?')->execute([$tid, $uid]);
    json_out(['deleted' => true, 'id' => $tid]);
}

json_error('Not found', 404);