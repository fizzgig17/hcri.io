<?php
// POST /api/auth/resend_verification  { email }  -- mails the confirmation link again.
// Always answers {ok:true}, whatever the address, so it can't be used to find out who has an account.
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/ratelimit.php';
require_once __DIR__ . '/../_core/email_verify.php';
cors_headers();
method('POST');
$email = strtolower(trim((string)(body()['email'] ?? '')));
if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Valid email required', 400);
if (rl_count('verify_ip', rl_client_ip(), 3600) >= 5 || rl_count('verify_mail', $email, 3600) >= 3) json_out(['ok' => true]);
rl_hit('verify_ip', rl_client_ip(), 3600);
rl_hit('verify_mail', $email, 3600);
$db = get_db();
hcri_verify_ensure($db);
$s = $db->prepare('SELECT id, name, email_verified_at FROM users WHERE email = ?');
$s->execute([$email]);
$u = $s->fetch();
if ($u && $u['email_verified_at'] === null) hcri_verify_send($db, (int)$u['id'], $email, (string)$u['name']);
json_out(['ok' => true]);
