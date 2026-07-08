<?php

declare(strict_types=1);

require_once __DIR__ . '/../_core/response.php';

require_once __DIR__ . '/../_core/db.php';

require_once __DIR__ . '/../_core/auth.php';



cors_headers();



$action = basename(__FILE__, '.php'); // login | register | me

$db = get_db();



// ── GET /api/auth/me ──────────────────────────────────────────────────────────

if ($action === 'me') {

    method('GET');

    $p = require_auth();

    $s = $db->prepare('SELECT id,email,name,created_at FROM users WHERE id=?');

    $s->execute([$p['id']]);

    $u = $s->fetch();

    if (!$u) json_error('User not found', 404);

    json_out($u);

}



// ── POST /api/auth/register ───────────────────────────────────────────────────

if ($action === 'register') {

    method('POST');

    $b = body();

    $email    = trim($b['email']    ?? '');

    $name     = trim($b['name']     ?? '');

    $password =      $b['password'] ?? '';

    if (!$email || !$name || !$password)  json_error('email, name and password required');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email');

    if (strlen($password) < 8)            json_error('Password must be ≥8 characters');



    $s = $db->prepare('SELECT id FROM users WHERE email=?');

    $s->execute([strtolower($email)]);

    if ($s->fetch()) json_error('Email already registered', 409);



    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

    $s = $db->prepare('INSERT INTO users(email,name,password) VALUES(?,?,?)');

    $s->execute([strtolower($email), $name, $hash]);

    $id = (int)$db->lastInsertId();

    $token = jwt_sign(['id' => $id, 'email' => strtolower($email), 'name' => $name, 'is_admin' => 0]);

    json_out(['token' => $token, 'user' => ['id' => $id, 'email' => strtolower($email), 'name' => $name, 'is_admin' => 0]], 201);

}



// ── POST /api/auth/login ──────────────────────────────────────────────────────

if ($action === 'login') {

    method('POST');

    $b = body();

    $email    = trim($b['email']    ?? '');

    $password =      $b['password'] ?? '';

    if (!$email || !$password) json_error('email and password required');



    // Accept email OR name (case-insensitive)

    $s = $db->prepare('SELECT * FROM users WHERE email=? OR LOWER(name)=?');

    $s->execute([strtolower($email), strtolower($email)]);

    $u = $s->fetch();

    if (!$u || !password_verify($password, $u['password'])) json_error('Invalid email or password', 401);

    if (!empty($u['disabled'])) json_error('This account has been disabled.', 403);



    $isAdmin = (int)($u['is_admin'] ?? 0);

    try { $db->prepare('UPDATE users SET last_login_at = NOW(), last_active_at = NOW() WHERE id = ?')->execute([$u['id']]); } catch (\Throwable $e) {}
    $token = jwt_sign(['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name'], 'is_admin' => $isAdmin]);

    json_out(['token' => $token, 'user' => ['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name'], 'is_admin' => $isAdmin]]);

}



json_error('Not found', 404);