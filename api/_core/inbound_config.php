<?php
declare(strict_types=1);

/**
 * Configuration for inbound email ingestion (api/inbound_poll.php).
 *
 * Prefer setting these via environment variables so secrets stay out of source.
 * Defaults assume a dedicated Spacemail mailbox (e.g. reports@hcri.io) that
 * users email their SPD files to.
 */

// ── Mailbox to poll (Spacemail IMAP) ─────────────────────────────────────────
define('IMAP_HOST',    getenv('IMAP_HOST')    ?: 'mail.spacemail.com');
define('IMAP_PORT',    (int)(getenv('IMAP_PORT') ?: 993));
define('IMAP_USER',    getenv('IMAP_USER')    ?: 'reports@hcri.io');
define('IMAP_PASS',    getenv('IMAP_PASS')    ?: '');
define('IMAP_FOLDER',  getenv('IMAP_FOLDER')  ?: 'INBOX');
// Mark processed messages \Seen (default) or delete them outright.
define('IMAP_DELETE',  (bool)(getenv('IMAP_DELETE') ?: false));

// ── Behaviour ────────────────────────────────────────────────────────────────
// Secret required to trigger the poller over HTTP (?key=...). Empty = web
// trigger disabled (CLI/cron only), which is the safer default.
define('INBOUND_POLL_KEY',  getenv('INBOUND_POLL_KEY') ?: '');
// Email a confirmation (with report links) back to the sender.
define('INBOUND_REPLY',     !in_array(strtolower((string)getenv('INBOUND_REPLY')), ['0','false','no','off'], true));
// Safety caps per message.
define('INBOUND_MAX_ATTACH', (int)(getenv('INBOUND_MAX_ATTACH') ?: 10));
define('INBOUND_MAX_BYTES',  (int)(getenv('INBOUND_MAX_BYTES')  ?: 8 * 1024 * 1024));
// If a message has no usable attachment, try treating the plain-text body as CSV.
define('INBOUND_BODY_FALLBACK', !in_array(strtolower((string)getenv('INBOUND_BODY_FALLBACK')), ['0','false','no','off'], true));
// Base URL used when linking back to created reports.
define('INBOUND_SITE_URL',  getenv('INBOUND_SITE_URL') ?: 'https://www.hcri.io');

// ── Inbound webhook (Forward Email -> /api/inbound_webhook.php) ───────────────
// Required secret in the webhook URL (?key=...). Empty = endpoint disabled.
define('INBOUND_WEBHOOK_KEY',     getenv('INBOUND_WEBHOOK_KEY') ?: '');
// Optional: Forward Email "Webhook Signature Payload Verification Key". When set
// AND the raw body is available (non-multipart), the X-Webhook-Signature header
// is verified as HMAC-SHA256 of the body. Multipart bodies fall back to the key.
define('INBOUND_WEBHOOK_SIGNING_KEY', getenv('INBOUND_WEBHOOK_SIGNING_KEY') ?: '');
