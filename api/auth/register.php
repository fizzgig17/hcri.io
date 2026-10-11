<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';
require_once __DIR__ . '/../_core/ratelimit.php';
require_once __DIR__ . '/../_core/gdpr.php';

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

    // At most 10 sign-ups per hour from one address.
    rl_block_if_over('register', rl_client_ip(), 10, 3600);
    rl_hit('register', rl_client_ip(), 3600);
    $consent = !empty($b['consent']);
    if (!$consent) json_error('You must accept the Privacy Policy and Terms to create an account', 400);
    consent_ensure($db);

    $s = $db->prepare('SELECT id FROM users WHERE email=?');
    $s->execute([strtolower($email)]);
    if ($s->fetch()) json_error('Email already registered', 409);

    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    try {
        $s = $db->prepare('INSERT INTO users(email,name,password,consent_at,consent_version) VALUES(?,?,?,NOW(),?)');
        $s->execute([strtolower($email), $name, $hash, CONSENT_VERSION]);
    } catch (\Throwable $e) {
        $s = $db->prepare('INSERT INTO users(email,name,password) VALUES(?,?,?)');
        $s->execute([strtolower($email), $name, $hash]);
    }
    $id = (int)$db->lastInsertId();
    $token = jwt_sign(['id' => $id, 'email' => strtolower($email), 'name' => $name]);
    json_out(['token' => $token, 'user' => ['id' => $id, 'email' => strtolower($email), 'name' => $name]], 201);
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
if ($action === 'login') {
    method('POST');
    $b = body();
    $email    = trim($b['email']    ?? '');
    $password =      $b['password'] ?? '';
    if (!$email || !$password) json_error('email and password required');

    // Password-guessing guard: 10 failures per 15 minutes per address, 8 per account.
    $rlAcct = strtolower($email);
    rl_block_if_over('login_ip', rl_client_ip(), 10, 900);
    rl_block_if_over('login_acct', $rlAcct, 8, 900);

    $s = $db->prepare('SELECT * FROM users WHERE email=?');
    $s->execute([strtolower($email)]);
    $u = $s->fetch();
    if (!$u || !password_verify($password, $u['password'])) {
        rl_hit('login_ip', rl_client_ip(), 900);
        rl_hit('login_acct', $rlAcct, 900);
        json_error('Invalid email or password', 401);
    }
    rl_clear('login_acct', $rlAcct);

    $token = jwt_sign(['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name']]);
    json_out(['token' => $token, 'user' => ['id' => $u['id'], 'email' => $u['email'], 'name' => $u['name']]]);
}

json_error('Not found', 404);