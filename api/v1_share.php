<?php
// api/v1_share.php
declare(strict_types=1);

// POST /api/v1/reports/{id}/share
//
// Lets a holder of a long-lived API token (the ONLY credential
// hcri-companion ever has -- see v1_upload.php) get a copyable link for a
// report it just uploaded, without widening what that token can do
// anywhere else. Deliberately its own narrow endpoint rather than making
// reports_item.php's existing shareAction PATCH accept an API token too --
// that endpoint also handles folder moves and (via its sibling actions)
// other report edits, none of which an upload-only token should be able to
// trigger just because it can authenticate at all.
//
// A public report's link needs no share_token at all (it's
// SITE_URL/?report={id}); a private (explore-excluded) one does, and this
// reuses an existing share_token if the report already has one rather than
// minting a new one on every call -- same fix just applied to
// reports_item.php's shareAction:'enable', so tapping "copy link" twice
// never silently invalidates a link already handed out.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/inbound_config.php'; // INBOUND_SITE_URL -- the one site-origin constant that already exists, also used for the inbound-email confirmation's report links

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed -- POST to this endpoint', 405);
}

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) {
    json_error('Invalid or missing API token. Send "Authorization: Bearer <token>".', 401);
}

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) json_error('Missing report id', 400);

$stmt = $db->prepare('SELECT id, user_id, is_public, share_token FROM reports WHERE id = ?');
$stmt->execute([$id]);
$report = $stmt->fetch();
if (!$report || (int)$report['user_id'] !== (int)$user['id']) {
    // Same "not found" either way a mismatched owner gets from
    // reports_item.php -- doesn't confirm or deny that a report with this
    // id exists under someone else's account.
    json_error('Report not found', 404);
}

if ((bool)$report['is_public']) {
    json_out([
        'link'      => INBOUND_SITE_URL . '/?report=' . $report['id'],
        'isPublic'  => true,
    ]);
}

$token = (string)($report['share_token'] ?? '');
if ($token === '') {
    do {
        $token = bin2hex(random_bytes(8)); // 16 chars -- same shape reports_item.php mints
        $exists = $db->prepare('SELECT id FROM reports WHERE share_token = ?');
        $exists->execute([$token]);
    } while ($exists->fetch());
    $db->prepare('UPDATE reports SET share_token=? WHERE id=?')->execute([$token, $id]);
}

json_out([
    'link'       => INBOUND_SITE_URL . '/?share=' . $token,
    'isPublic'   => false,
    'shareToken' => $token,
]);
