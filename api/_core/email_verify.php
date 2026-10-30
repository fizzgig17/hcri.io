<?php
// api/_core/email_verify.php
//
// Email confirmation for new accounts. Accounts that existed before this was added count as confirmed;
// new sign-ups must click the link in the email before they can sign in. A password reset also confirms
// the address (it proves the person can read that mailbox).
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function hcri_verify_ensure(PDO $db): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $has = $db->query("SHOW COLUMNS FROM users LIKE 'email_verified_at'")->fetch();
        if (!$has) {
            $db->exec('ALTER TABLE users ADD COLUMN email_verified_at DATETIME NULL');
            $db->exec('UPDATE users SET email_verified_at = COALESCE(created_at, NOW())');   // everyone who is already here
        }
        $db->exec('CREATE TABLE IF NOT EXISTS email_verifications (
            token_hash CHAR(64) NOT NULL PRIMARY KEY,
            user_id    INT NOT NULL,
            expires_at DATETIME NOT NULL,
            INDEX idx_ev_user (user_id)
        ) ENGINE=InnoDB');
    } catch (\Throwable $e) { error_log('hCRI verify setup: ' . $e->getMessage()); }
}

function hcri_user_is_verified(PDO $db, array $userRow): bool
{
    hcri_verify_ensure($db);
    if (array_key_exists('email_verified_at', $userRow)) return $userRow['email_verified_at'] !== null;
    return true;   // column missing (setup failed): don't lock people out
}

/** Mails a fresh confirmation link (valid 48 hours). Older links for the account stop working. */
function hcri_verify_send(PDO $db, int $userId, string $email, string $name): bool
{
    hcri_verify_ensure($db);
    try {
        require_once __DIR__ . '/mailer.php';
        $db->prepare('DELETE FROM email_verifications WHERE user_id = ?')->execute([$userId]);
        $token = bin2hex(random_bytes(32));
        $db->prepare('INSERT INTO email_verifications (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
           ->execute([hash('sha256', $token), $userId, date('Y-m-d H:i:s', time() + 48 * 3600)]);
        $proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $url   = $proto . '://' . ($_SERVER['HTTP_HOST'] ?? 'hcri.io') . '/?verify=' . $token;
        $who   = $name !== '' ? $name : 'there';
        send_email($email, $who, 'Confirm your hCRI.io email address',
            "Hi $who,\n\nThanks for creating an hCRI.io account. Please confirm your email address:\n\n$url\n\n"
            . "The link is valid for 48 hours. If you didn't sign up, just ignore this email and nothing will happen.\n\nhCRI.io");
        return true;
    } catch (\Throwable $e) {
        error_log('hCRI verification email failed: ' . $e->getMessage());
        return false;
    }
}

/** Confirms the account behind a token from the email. Returns true when it worked. */
function hcri_verify_consume(PDO $db, string $token): bool
{
    hcri_verify_ensure($db);
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) return false;
    try {
        $h = hash('sha256', $token);
        $q = $db->prepare('SELECT user_id FROM email_verifications WHERE token_hash = ? AND expires_at > NOW()');
        $q->execute([$h]);
        $uid = (int)$q->fetchColumn();
        if ($uid <= 0) return false;
        $db->prepare('UPDATE users SET email_verified_at = NOW() WHERE id = ? AND email_verified_at IS NULL')->execute([$uid]);
        $db->prepare('DELETE FROM email_verifications WHERE user_id = ?')->execute([$uid]);
        return true;
    } catch (\Throwable $e) { return false; }
}
