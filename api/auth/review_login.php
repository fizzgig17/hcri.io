<?php
declare(strict_types=1);
// POST /api/auth/review_login  { token }  -> { token, user }   (signs the site owner in from an emailed one-time link)
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';
require_once __DIR__ . '/../_core/review_login.php';

cors_headers();
method('POST');
$b = body();
$db = get_db();
$u = review_token_consume($db, (string)($b['token'] ?? ''), 'category_review');
if (!$u) json_error('This link has expired or was already used. Sign in normally and open Admin > Categories.', 401);
try { $db->prepare('UPDATE users SET last_login_at = NOW(), last_active_at = NOW() WHERE id = ?')->execute([$u['id']]); } catch (\Throwable $e) {}
$user = ['id' => (int)$u['id'], 'email' => $u['email'], 'name' => $u['name'], 'is_admin' => 1];
json_out(['token' => jwt_sign($user), 'user' => $user]);
