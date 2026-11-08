<?php
// api/_core/api_log.php
//
// Admin-facing log of the latest API requests made by signed-in accounts (login token or API token).
// Kept deliberately small and plain: user id, time, method, URL path (no query string, share tokens replaced),
// HTTP status. No IP address. Only the newest HCRI_API_LOG_KEEP rows are kept. Logging never breaks a request.
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/rate_limit.php';

const HCRI_API_LOG_KEEP = 1000;

function hcri_api_log_ensure(PDO $db): void {
    $db->exec('CREATE TABLE IF NOT EXISTS api_log (
        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, ts INT NOT NULL, user_id INT NOT NULL,
        method VARCHAR(8) NOT NULL, path VARCHAR(200) NOT NULL, status SMALLINT NOT NULL DEFAULT 0,
        KEY by_ts (ts)) ENGINE=InnoDB');
}

/** Call once at the top of API routing; the row is written when the request ends (so the status is known). */
function hcri_api_log_start(string $uri): void {
    $path = hcri_loggable_path($uri);
    // Not worth logging: the notice poll, social-image requests, and the admin log viewer itself.
    if (preg_match('#^/api/(notices|og/|admin/api_log)#', $path)) return;
    $method = substr((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'), 0, 8);
    $ts = time();
    register_shutdown_function(function () use ($path, $method, $ts) {
        try {
            $uid = 0;
            require_once __DIR__ . '/auth.php';
            $h = get_auth_header();
            if (str_starts_with($h, 'Bearer ')) {
                $p = jwt_verify(substr($h, 7));
                if ($p && isset($p['id'])) $uid = (int)$p['id'];
            }
            if ($uid === 0) {
                require_once __DIR__ . '/api_token.php';
                $tok = api_token_from_request();
                if ($tok !== '') { $u = user_from_api_token(get_db(), $tok); if ($u) $uid = (int)$u['id']; }
            }
            if ($uid <= 0) return;   // signed-in accounts only
            $db = get_db();
            hcri_api_log_ensure($db);
            $db->prepare('INSERT INTO api_log (ts, user_id, method, path, status) VALUES (?, ?, ?, ?, ?)')
               ->execute([$ts, $uid, $method, $path, (int)http_response_code()]);
            if (random_int(1, 50) === 1) {
                $db->exec('DELETE FROM api_log WHERE id <= (SELECT id FROM (SELECT id FROM api_log ORDER BY id DESC LIMIT 1 OFFSET ' . HCRI_API_LOG_KEEP . ') t)');
            }
        } catch (\Throwable $e) { /* logging must never break a request */ }
    });
}
