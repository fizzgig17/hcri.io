<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/mailer.php';

cors_headers();
method('POST');

$b     = body();
$email = strtolower(trim($b['email'] ?? ''));
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Valid email required', 400);

$db = get_db();

$s = $db->prepare('SELECT id, name FROM users WHERE email = ?');
$s->execute([$email]);
$u = $s->fetch();

// Always return success to prevent email enumeration
if (!$u) { json_out(['ok' => true]); }

// Invalidate old tokens for this user
$db->prepare('UPDATE password_resets SET used=1 WHERE user_id=?')->execute([$u['id']]);

// Generate token
$token   = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 3600);
$db->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)')->execute([$u['id'], $token, $expires]);

// Build reset URL
$proto   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host    = $_SERVER['HTTP_HOST'] ?? 'hcri.io';
$url     = $proto . '://' . $host . '/spd/?reset=' . $token;

$name    = $u['name'] ?: 'there';
$body    = "Hi $name,\n\nYou requested a password reset for your hCRI.io account.\n\nClick the link below to set a new password (valid for 1 hour):\n\n$url\n\nIf you didn't request this, you can ignore this email.\n\nhCRI.io";

try {
    send_email($email, $name, 'Reset your hCRI.io password', $body);
} catch (\Exception $e) {
    // Log but don't reveal to client
    error_log('Password reset email failed: ' . $e->getMessage());
    // Still return ok — token is saved, user can retry
}

json_out(['ok' => true]);
