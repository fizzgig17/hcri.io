<?php
// api/_core/review_login.php
declare(strict_types=1);
//
// One-time "review links" for the site owner: an emailed link that signs the owner straight in to act on one thing
// (a category suggestion). The token is random (256 bits), stored only as a SHA-256 hash, valid for a limited time and
// good for a single use. It is exchanged for a normal session by POST /api/auth/review_login (a POST, not on the page
// load, so email link scanners that merely fetch the URL cannot use it up). Only an admin account can be signed in this way.

function review_tokens_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $db->exec('CREATE TABLE IF NOT EXISTS review_tokens (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT NOT NULL,
            purpose    VARCHAR(32) NOT NULL,
            token_hash CHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at    DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_hash (token_hash)
        )');
    } catch (\Throwable $e) { /* no CREATE privilege */ }
}

/** Creates a token for $userId and returns it (the only time the plain token exists). */
function review_token_create(PDO $db, int $userId, string $purpose, int $ttlSeconds = 259200): string {
    review_tokens_ensure($db);
    $token = bin2hex(random_bytes(32));
    $db->prepare('DELETE FROM review_tokens WHERE expires_at < NOW() OR used_at IS NOT NULL')->execute();
    $db->prepare('INSERT INTO review_tokens (user_id, purpose, token_hash, expires_at) VALUES (?, ?, ?, ?)')
       ->execute([$userId, $purpose, hash('sha256', $token), date('Y-m-d H:i:s', time() + $ttlSeconds)]);
    return $token;
}

/** Uses up a token. Returns the (admin) user row, or null if the token is unknown, expired, already used or not for an admin. */
function review_token_consume(PDO $db, string $token, string $purpose): ?array {
    review_tokens_ensure($db);
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) return null;
    $hash = hash('sha256', $token);
    $db->beginTransaction();
    try {
        $s = $db->prepare('SELECT id, user_id FROM review_tokens WHERE token_hash = ? AND purpose = ? AND used_at IS NULL AND expires_at > NOW() FOR UPDATE');
        $s->execute([$hash, $purpose]);
        $row = $s->fetch();
        if (!$row) { $db->rollBack(); return null; }
        $db->prepare('UPDATE review_tokens SET used_at = NOW() WHERE id = ?')->execute([$row['id']]);
        $db->commit();
    } catch (\Throwable $e) { if ($db->inTransaction()) $db->rollBack(); return null; }
    $u = $db->prepare('SELECT id, email, name, is_admin FROM users WHERE id = ?');
    $u->execute([$row['user_id']]);
    $user = $u->fetch();
    return ($user && (int)$user['is_admin'] === 1) ? $user : null;
}
