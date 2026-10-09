<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/gdpr.php';

cors_headers();

$db  = get_db();
$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = preg_replace('#^.*?/api/account#', '', strtok($uri, '?')); // '' | '/export' | '/delete'

$p   = require_auth();
$uid = (int)$p['id'];

/** Decode a column that may hold a JSON string into a PHP value (or leave as-is). */
function maybe_json(mixed $v): mixed {
    if (!is_string($v) || $v === '') return $v;
    $t = ltrim($v);
    if ($t === '' || ($t[0] !== '{' && $t[0] !== '[')) return $v;
    $d = json_decode($v, true);
    return json_last_error() === JSON_ERROR_NONE ? $d : $v;
}

// ── GET /api/account/export ──────────────────────────────────────────────────
// Right of access + data portability: everything we hold tied to this account,
// as a machine-readable JSON download. Excludes the password hash.
if ($path === '/export') {
    method('GET');

    $s = $db->prepare('SELECT * FROM users WHERE id=?');
    $s->execute([$uid]);
    $user = $s->fetch();
    if (!$user) json_error('User not found', 404);
    unset($user['password']); // never export secrets
    foreach (['settings'] as $jf) {
        if (array_key_exists($jf, $user)) $user[$jf] = maybe_json($user[$jf]);
    }

    // Reports owned by this user (full content, incl. metrics + SPD data).
    $reports = [];
    try {
        $rs = $db->prepare('SELECT * FROM reports WHERE user_id=? ORDER BY created_at');
        $rs->execute([$uid]);
        foreach ($rs->fetchAll() as $row) {
            foreach (['meta', 'spd_data'] as $jf) {
                if (array_key_exists($jf, $row)) $row[$jf] = maybe_json($row[$jf]);
            }
            $reports[] = $row;
        }
    } catch (\Throwable $e) {}

    // API tokens — metadata only, never the secret/hash.
    $tokens = [];
    try {
        $ts = $db->prepare('SELECT id,name,token_prefix,created_at,last_used_at FROM api_tokens WHERE user_id=? ORDER BY id');
        $ts->execute([$uid]);
        $tokens = $ts->fetchAll();
    } catch (\Throwable $e) {}

    $export = [
        'export_generated_at' => gmdate('c'),
        'export_format'       => 'hCRI account data export v1',
        'account'             => $user,
        'reports'             => $reports,
        'api_tokens'          => $tokens,
        'notes'               => 'Anonymous up/down votes are stored against a device key, not your account, so they are not personally identifiable and are not included here.',
    ];

    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="hcri-my-data.json"');
    echo json_encode($export, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ── POST /api/account/delete ─────────────────────────────────────────────────
// Right to erasure. Requires the account password as confirmation.
// Body: { password: string, keepPublicReports?: bool }
//   keepPublicReports=true  → public reports are anonymised (owner link removed)
//                              and kept in the public dataset; private reports
//                              and all personal data are deleted.
//   keepPublicReports=false → everything the account owns is deleted (default).
if ($path === '/delete') {
    method('POST');
    $b = body();
    $password = (string)($b['password'] ?? '');
    if ($password === '') json_error('Password confirmation required', 400);

    $s = $db->prepare('SELECT password FROM users WHERE id=?');
    $s->execute([$uid]);
    $hash = $s->fetchColumn();
    if (!$hash || !password_verify($password, $hash)) {
        json_error('Password is incorrect', 401);
    }

    $keepPublic = !empty($b['keepPublicReports']);
    $deletedReports = 0;
    $anonymisedReports = 0;

    try {
        $db->beginTransaction();

        if ($keepPublic && column_is_nullable($db, 'reports', 'user_id')) {
            // Delete private reports (+ their votes), keep & anonymise public ones.
            $db->prepare('DELETE FROM report_votes WHERE report_id IN (SELECT id FROM reports WHERE user_id=? AND is_public=0)')
               ->execute([$uid]);
            $dp = $db->prepare('DELETE FROM reports WHERE user_id=? AND is_public=0');
            $dp->execute([$uid]);
            $deletedReports = $dp->rowCount();

            $an = $db->prepare('UPDATE reports SET user_id=NULL, share_token=NULL WHERE user_id=? AND is_public=1');
            $an->execute([$uid]);
            $anonymisedReports = $an->rowCount();
        } else {
            // Full delete: every report owned by the account, and their votes.
            $db->prepare('DELETE FROM report_votes WHERE report_id IN (SELECT id FROM reports WHERE user_id=?)')
               ->execute([$uid]);
            $dr = $db->prepare('DELETE FROM reports WHERE user_id=?');
            $dr->execute([$uid]);
            $deletedReports = $dr->rowCount();
        }

        // Flicker readings (table is created lazily, so it may not exist yet).
        try { $db->prepare('DELETE FROM flicker_readings WHERE user_id=?')->execute([$uid]); } catch (\Throwable $e) {}

        // Tokens & password-reset rows (tables may not exist on older installs).
        try { $db->prepare('DELETE FROM api_tokens WHERE user_id=?')->execute([$uid]); } catch (\Throwable $e) {}
        try { $db->prepare('DELETE FROM password_resets WHERE user_id=?')->execute([$uid]); } catch (\Throwable $e) {}

        // Finally, the account itself.
        $db->prepare('DELETE FROM users WHERE id=?')->execute([$uid]);

        $db->commit();
    } catch (\Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        json_error('Could not delete account, no changes were made. Please try again.', 500);
    }

    json_out([
        'ok'                => true,
        'deletedReports'    => $deletedReports,
        'anonymisedReports' => $anonymisedReports,
    ]);
}

json_error('Not found', 404);