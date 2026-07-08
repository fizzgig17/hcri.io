<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';

cors_headers();
method('POST');

$b           = body();
$resetToken  = trim($b['token']    ?? '');
$password    = trim($b['password'] ?? '');

if (!$resetToken)          json_error('Token required', 400);
if (strlen($password) < 8) json_error('Password must be at least 8 characters', 400);

$db = get_db();

$s = $db->prepare(
    'SELECT pr.*, u.id as uid, u.email, u.name, u.is_admin
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > NOW()'
);
$s->execute([$resetToken]);
$r = $s->fetch();

if (!$r) json_error('Invalid or expired reset link', 400);

// Update password
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$db->prepare('UPDATE users SET password = ? WHERE id = ?')->execute([$hash, $r['uid']]);

// Mark token used
$db->prepare('UPDATE password_resets SET used = 1 WHERE token = ?')->execute([$resetToken]);

// Return a JWT so the user is immediately signed in
$jwt = jwt_sign(['id' => $r['uid'], 'email' => $r['email'], 'name' => $r['name'], 'is_admin' => (int)$r['is_admin']]);
json_out(['token' => $jwt, 'user' => [
    'id'       => $r['uid'],
    'email'    => $r['email'],
    'name'     => $r['name'],
    'is_admin' => (bool)$r['is_admin'],
]]);