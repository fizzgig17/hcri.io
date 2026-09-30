<?php
declare(strict_types=1);

/**
 * Inbound email webhook receiver (Forward Email / Mailgun-compatible).
 *
 * Forward Email POSTs each message sent to submit@report.hcri.io here. We match
 * the sender to a registered user and turn supported attachments into reports
 * via ingest_spd_upload(), then email the sender their report links.
 *
 * Configure the alias destination in Forward Email to:
 *   https://www.hcri.io/api/inbound_webhook.php?key=YOUR_INBOUND_WEBHOOK_KEY
 *
 * Auth: the ?key must match INBOUND_WEBHOOK_KEY. If a signing key is configured
 * and the raw body is available (non-multipart), X-Webhook-Signature is also
 * verified. Always returns 200 on accepted messages so the provider does not
 * retry; only auth failures return 4xx.
 */

require_once __DIR__ . '/_core/inbound_config.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/inbound_ingest.php';

header('Content-Type: application/json');

function wh_out(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

// ── Method + auth ────────────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') wh_out(405, ['ok' => false, 'error' => 'POST only']);

$key = (string)($_GET['key'] ?? '');
if (INBOUND_WEBHOOK_KEY === '' || !hash_equals(INBOUND_WEBHOOK_KEY, $key)) {
    wh_out(403, ['ok' => false, 'error' => 'forbidden']);
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$rawInput    = file_get_contents('php://input') ?: ''; // empty for multipart/form-data

// Optional HMAC signature check (only meaningful when we have the raw body).
if (INBOUND_WEBHOOK_SIGNING_KEY !== '' && $rawInput !== '') {
    $sig = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
    $calc = hash_hmac('sha256', $rawInput, INBOUND_WEBHOOK_SIGNING_KEY);
    if ($sig === '' || !hash_equals($calc, $sig)) {
        wh_out(403, ['ok' => false, 'error' => 'bad signature']);
    }
}

// ── Normalise the payload ────────────────────────────────────────────────────
$msg = inbound_collect($_POST, $_FILES, $rawInput, $contentType);

// Best-effort idempotency: skip a Message-Id we processed in the last hour
// (providers may retry on timeout).
if ($msg['messageId'] !== '') {
    $seen = sys_get_temp_dir() . '/hcri_wh_' . md5($msg['messageId']);
    if (is_file($seen) && (time() - filemtime($seen)) < 3600) {
        wh_out(200, ['ok' => true, 'duplicate' => true]);
    }
    @touch($seen);
}

// ── Match sender, ingest, reply ──────────────────────────────────────────────
$db  = get_db();
$user = inbound_match_user($db, $msg['from']);

if (!$user) {
    // Unknown sender — accept (200, no retry) but do nothing.
    wh_out(200, ['ok' => true, 'ignored' => 'no matching account', 'from' => $msg['from']]);
}

$files = $msg['attachments'];
if (!$files && INBOUND_BODY_FALLBACK && inbound_looks_like_csv($msg['text'])) {
    $files[] = ['filename' => 'pasted.csv', 'data' => $msg['text']];
}

if (!$files) {
    inbound_reply($msg['from'], $msg['fromName'], $msg['subject'], "We didn't find an SPD file to import in your email.\n", []);
    wh_out(200, ['ok' => true, 'note' => 'no usable attachment']);
}

$made = inbound_ingest_files($db, (int)$user['id'], $msg['subject'], $files);
inbound_reply($msg['from'], $msg['fromName'], $msg['subject'], '', $made);

$reportIds = [];
foreach ($made as $m) if (!isset($m['error'])) $reportIds[] = $m['id'];

wh_out(200, ['ok' => true, 'user' => (int)$user['id'], 'reports' => $reportIds, 'files' => count($files)]);
