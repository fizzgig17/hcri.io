<?php

// api/auth/profile.php



declare(strict_types=1);



require_once __DIR__ . '/../_core/response.php';



require_once __DIR__ . '/../_core/db.php';



require_once __DIR__ . '/../_core/auth.php';



require_once __DIR__ . '/../_core/mailer.php';







cors_headers();







$payload = require_auth();



$uid     = (int)$payload['id'];



$db      = get_db();



$method  = $_SERVER['REQUEST_METHOD'];







// ── GET — return current profile ─────────────────────────────────────────────



if ($method === 'GET') {



    $s = $db->prepare('SELECT id, email, name, created_at FROM users WHERE id=?');



    $s->execute([$uid]);



    $u = $s->fetch();



    if (!$u) json_error('User not found', 404);



    $dp=false; try{$x=$db->prepare('SELECT reports_default_private FROM users WHERE id=?');$x->execute([$uid]);$dp=(bool)$x->fetchColumn();}catch(\Throwable $e){} $u['reportsDefaultPrivate']=$dp; $set=[]; try{$sx=$db->prepare('SELECT settings FROM users WHERE id=?');$sx->execute([$uid]);$set=json_decode((string)$sx->fetchColumn(),true)?:[];}catch(\Throwable $e){} $u['timezone']=$set['timezone']??'America/New_York'; json_out($u);



}







// ── POST — update profile ─────────────────────────────────────────────────────



if ($method === 'POST') {



    $b      = body();



    $action = $b['action'] ?? '';







    // ── Change name ───────────────────────────────────────────────────────────



    if ($action === 'name') {



        $name = trim($b['name'] ?? '');



        if (!$name) json_error('Name required');



        $db->prepare('UPDATE users SET name=? WHERE id=?')->execute([$name, $uid]);



        json_out(['ok' => true, 'name' => $name]);



    }







    // ── Change email ──────────────────────────────────────────────────────────



    // ── Default list views (Explore / My Reports) ─────────────────────────

    if ($action === 'views') {

        $ve = (($b['viewExplore']   ?? 'cards') === 'all') ? 'all' : 'cards';

        $vm = (($b['viewMyReports'] ?? 'cards') === 'all') ? 'all' : 'cards';

        try { $db->exec("ALTER TABLE users ADD COLUMN settings TEXT"); } catch (\Throwable $e) {}

        $set = [];

        try { $x = $db->prepare('SELECT settings FROM users WHERE id=?'); $x->execute([$uid]); $set = json_decode((string)$x->fetchColumn(), true) ?: []; } catch (\Throwable $e) {}

        $set['viewExplore'] = $ve; $set['viewMyReports'] = $vm;

        $db->prepare('UPDATE users SET settings=? WHERE id=?')->execute([json_encode($set), $uid]);

        json_out(['ok' => true, 'viewExplore' => $ve, 'viewMyReports' => $vm]);

    }



    if ($action === 'email') {



        $email    = strtolower(trim($b['email'] ?? ''));



        $password = $b['password'] ?? '';



        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Valid email required');



        if (!$password) json_error('Current password required to change email');







        // Verify current password



        $s = $db->prepare('SELECT password FROM users WHERE id=?');



        $s->execute([$uid]);



        $u = $s->fetch();



        if (!$u || !password_verify($password, $u['password'])) json_error('Incorrect password', 401);







        // Check not taken



        $s = $db->prepare('SELECT id FROM users WHERE email=? AND id!=?');



        $s->execute([$email, $uid]);



        if ($s->fetch()) json_error('Email already in use', 409);







        $db->prepare('UPDATE users SET email=? WHERE id=?')->execute([$email, $uid]);







        // Issue new token with updated email



        $s = $db->prepare('SELECT * FROM users WHERE id=?');



        $s->execute([$uid]);



        $updated = $s->fetch();



        $token = jwt_sign(['id' => $uid, 'email' => $email, 'name' => $updated['name'], 'is_admin' => (int)($updated['is_admin'] ?? 0)]);



        json_out(['ok' => true, 'token' => $token, 'email' => $email]);



    }







    // ── Change password ───────────────────────────────────────────────────────



    if ($action === 'password') {



        $current = $b['current'] ?? '';



        $new     = $b['new']     ?? '';



        if (!$current || !$new)        json_error('Current and new password required');



        if (strlen($new) < 8)          json_error('New password must be ≥8 characters');







        $s = $db->prepare('SELECT password FROM users WHERE id=?');



        $s->execute([$uid]);



        $u = $s->fetch();



        if (!$u || !password_verify($current, $u['password'])) json_error('Current password incorrect', 401);







        $hash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);



        $db->prepare('UPDATE users SET password=? WHERE id=?')->execute([$hash, $uid]);



        json_out(['ok' => true]);



    }







    // ── Send reset link to own email ──────────────────────────────────────────



    if ($action === 'send_reset') {



        $s = $db->prepare('SELECT email, name FROM users WHERE id=?');



        $s->execute([$uid]);



        $u = $s->fetch();



        if (!$u) json_error('User not found', 404);







        // Invalidate old tokens



        $db->prepare('UPDATE password_resets SET used=1 WHERE user_id=?')->execute([$uid]);



        $token   = bin2hex(random_bytes(32));



        $expires = date('Y-m-d H:i:s', time() + 3600);



        $db->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)')->execute([$uid, $token, $expires]);







        $proto   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';



        $host    = $_SERVER['HTTP_HOST'] ?? 'hcri.io';



        $url     = $proto . '://' . $host . '/spd/?reset=' . $token;



        $name    = $u['name'] ?: 'there';



        $body    = "Hi $name,\n\nHere is your password reset link (valid for 1 hour):\n\n$url\n\nhCRI.io";







        try {



            send_email($u['email'], $name, 'Reset your hCRI.io password', $body);



        } catch (\Exception $e) {



            error_log('Profile reset email failed: ' . $e->getMessage());



            json_error('Failed to send email', 500);



        }



        json_out(['ok' => true]);



    }







    if ($action === 'timezone') {

        $tz = trim($b['timezone'] ?? '') ?: 'America/New_York';

        if (!in_array($tz, timezone_identifiers_list(), true)) json_error('Unknown timezone');

        try { $db->exec("ALTER TABLE users ADD COLUMN settings TEXT"); } catch (\Throwable $e) {}

        $set = [];

        try { $x = $db->prepare('SELECT settings FROM users WHERE id=?'); $x->execute([$uid]); $set = json_decode((string)$x->fetchColumn(), true) ?: []; } catch (\Throwable $e) {}

        $set['timezone'] = $tz;

        $db->prepare('UPDATE users SET settings=? WHERE id=?')->execute([json_encode($set), $uid]);

        json_out(['ok' => true, 'timezone' => $tz]);

    }



    if($action==='reports_default'){$v=!empty($b['value'])?1:0;try{$db->prepare('UPDATE users SET reports_default_private=? WHERE id=?')->execute([$v,$uid]);}catch(\Throwable $e){json_error('Setting unavailable â run users_reports_default.sql',500);}json_out(['ok'=>true,'reportsDefaultPrivate'=>(bool)$v]);} json_error('Unknown action', 400);



}







json_error('Method not allowed', 405);