<?php
declare(strict_types=1);

// Personal API token helpers. Tokens are random, non-expiring, and stored as
// a SHA-256 hash; the plaintext is returned only once at creation time.

function api_token_generate(): string {
    return 'hcri_' . bin2hex(random_bytes(24)); // 'hcri_' + 48 hex chars
}

function api_token_hash(string $plain): string {
    return hash('sha256', trim($plain));
}

function api_token_prefix(string $plain): string {
    return substr($plain, 0, 13); // 'hcri_' + first 8 chars, for display
}

// Resolve a user from a presented API token. Stamps last_used_at.
// Returns ['id','email','name','is_admin'] or null.
function user_from_api_token(PDO $db, string $plain): ?array {
    $plain = trim($plain);
    if ($plain === '') return null;
    try {
        $s = $db->prepare(
            'SELECT t.id AS tid, u.id, u.email, u.name, u.is_admin
               FROM api_tokens t JOIN users u ON u.id = t.user_id
              WHERE t.token_hash = ? LIMIT 1'
        );
        $s->execute([api_token_hash($plain)]);
        $row = $s->fetch();
        if (!$row) return null;
        try { $db->prepare('UPDATE api_tokens SET last_used_at = NOW() WHERE id = ?')->execute([(int)$row['tid']]); }
        catch (\Throwable $e) {}
        return ['id' => (int)$row['id'], 'email' => $row['email'], 'name' => $row['name'], 'is_admin' => (int)$row['is_admin']];
    } catch (\Throwable $e) {
        return null;
    }
}

// Pull a bearer / X-API-Token / X-API-Key value from the request headers.
function api_token_from_request(): string {
    $tok = '';
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            $lk = strtolower($k);
            if ($lk === 'authorization' && stripos($v, 'bearer ') === 0) $tok = trim(substr($v, 7));
            elseif ($lk === 'x-api-token' || $lk === 'x-api-key') $tok = trim($v);
        }
    }
    if ($tok === '' && !empty($_SERVER['HTTP_AUTHORIZATION']) && stripos($_SERVER['HTTP_AUTHORIZATION'], 'bearer ') === 0) {
        $tok = trim(substr($_SERVER['HTTP_AUTHORIZATION'], 7));
    }
    if ($tok === '' && !empty($_SERVER['HTTP_X_API_TOKEN'])) $tok = trim($_SERVER['HTTP_X_API_TOKEN']);
    if ($tok === '' && !empty($_SERVER['HTTP_X_API_KEY']))   $tok = trim($_SERVER['HTTP_X_API_KEY']);
    return $tok;
}