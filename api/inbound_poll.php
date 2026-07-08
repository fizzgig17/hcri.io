<?php
declare(strict_types=1);

/**
 * Inbound email -> report ingestion.
 *
 * Polls a Spacemail mailbox over IMAP, and for every new (unseen) message whose
 * From: address matches a registered hCRI.io user, turns each supported SPD
 * attachment into a report via ingest_spd_upload() and emails the sender a
 * confirmation with links. Messages from unknown senders are left untouched.
 *
 * Run from cron:        php /path/to/api/inbound_poll.php
 * Or via HTTP (if a key is configured):  /api/inbound_poll.php?key=SECRET
 *
 * Requires the PHP IMAP extension (imap_open). On Spaceship, enable it via the
 * PHP Tweaks plugin / php.ini. On PHP 8.4+ where ext-imap is unbundled, install
 * it from PECL or run this script under a PHP 8.1-8.3 build.
 */

require_once __DIR__ . '/_core/inbound_config.php';
require_once __DIR__ . '/_core/inbound_parse.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/ingest.php';
require_once __DIR__ . '/_core/mailer.php';

$IS_CLI = (PHP_SAPI === 'cli');

function inbound_finish(array $summary, bool $isCli): void
{
    if ($isCli) {
        fwrite(STDOUT, json_encode($summary, JSON_PRETTY_PRINT) . "\n");
    } else {
        header('Content-Type: application/json');
        echo json_encode($summary);
    }
    exit;
}

/** Email the sender a confirmation/summary. Never throws. */
function inbound_reply(array $msg, string $prefix, array $made): void
{
    try {
        $lines = ["Thanks - here is what we did with your email to hCRI.io:\n"];
        if ($prefix !== '') $lines[] = $prefix;
        $okCount = 0;
        foreach ($made as $r) {
            if (isset($r['error'])) {
                $lines[] = "x {$r['_file']}: {$r['error']}";
            } else {
                $okCount++;
                $url = INBOUND_SITE_URL . '/?report=' . $r['id'];
                $cct = $r['cct'] !== null ? $r['cct'] . 'K' : '-';
                $lines[] = "+ {$r['_file']} -> report #{$r['id']}  (CCT {$cct})\n   {$url}";
            }
        }
        if ($made && $okCount === 0) {
            $lines[] = "\nNo reports were created. Check the file format (csv, tsv, txt, json, sp, pdf).";
        }
        $subject = 'Re: ' . ($msg['subject'] !== '' ? $msg['subject'] : 'your hCRI.io upload');
        send_email($msg['from'], $msg['fromName'], $subject, implode("\n", $lines) . "\n");
    } catch (\Throwable $e) {
        error_log('inbound_reply failed: ' . $e->getMessage());
    }
}

// ── Web trigger must present the shared secret (CLI is always allowed) ───────
if (!$IS_CLI) {
    $key = $_GET['key'] ?? '';
    if (INBOUND_POLL_KEY === '' || !hash_equals(INBOUND_POLL_KEY, (string)$key)) {
        http_response_code(403);
        inbound_finish(['ok' => false, 'error' => 'forbidden'], false);
    }
}

// ── Only one run at a time ───────────────────────────────────────────────────
$lockPath = sys_get_temp_dir() . '/hcri_inbound_poll.lock';
$lock = fopen($lockPath, 'c');
if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) {
    inbound_finish(['ok' => true, 'skipped' => 'already running'], $IS_CLI);
}

// ── IMAP must be available ───────────────────────────────────────────────────
if (!function_exists('imap_open')) {
    if (!$IS_CLI) http_response_code(503);
    inbound_finish([
        'ok'    => false,
        'error' => 'PHP IMAP extension not available. Enable ext-imap (Spaceship: PHP Tweaks / php.ini).',
    ], $IS_CLI);
}

// ── Poll the mailbox ─────────────────────────────────────────────────────────
$mailboxRef = '{' . IMAP_HOST . ':' . IMAP_PORT . '/imap/ssl}' . IMAP_FOLDER;
$mbox = @imap_open($mailboxRef, IMAP_USER, IMAP_PASS, 0, 1);
if (!$mbox) {
    inbound_finish(['ok' => false, 'error' => 'IMAP connect failed: ' . imap_last_error()], $IS_CLI);
}

$db = get_db();
$ids = imap_search($mbox, 'UNSEEN UNDELETED');
$processed = [];

if (is_array($ids)) {
    foreach ($ids as $num) {
        $entry = ['msg' => $num, 'reports' => [], 'note' => ''];
        try {
            // Fetch the raw message without flipping \Seen (FT_PEEK).
            $raw = imap_fetchheader($mbox, $num) . imap_body($mbox, $num, FT_PEEK);
            $msg = inbound_parse_message($raw);

            // Match sender to a registered user (case-insensitive).
            $uid = null; $uname = $msg['fromName'];
            if ($msg['from'] !== '') {
                $q = $db->prepare('SELECT id, name FROM users WHERE LOWER(email) = ? LIMIT 1');
                $q->execute([$msg['from']]);
                if ($row = $q->fetch(PDO::FETCH_ASSOC)) { $uid = (int)$row['id']; $uname = $row['name'] ?: $uname; }
            }

            if ($uid === null) {
                // Unknown sender: leave untouched (unseen) and move on.
                $entry['note'] = 'no matching account for ' . ($msg['from'] ?: '(no from)');
                $processed[] = $entry;
                continue;
            }

            // Candidate files: real attachments, plus optional body-as-CSV.
            $files = $msg['attachments'];
            if (!$files && INBOUND_BODY_FALLBACK && inbound_looks_like_csv($msg['text'])) {
                $files[] = ['filename' => 'pasted.csv', 'data' => $msg['text']];
            }

            if (!$files) {
                $entry['note'] = 'no usable attachment';
                if (INBOUND_REPLY) inbound_reply($msg, "We didn't find an SPD file to import in your email.\n", []);
                imap_setflag_full($mbox, (string)$num, '\\Seen');
                $processed[] = $entry;
                continue;
            }

            $made = [];
            foreach ($files as $i => $f) {
                $tmp = tempnam(sys_get_temp_dir(), 'hcri_in_');
                file_put_contents($tmp, $f['data']);
                try {
                    $label = $msg['subject'] !== '' ? $msg['subject'] : pathinfo($f['filename'], PATHINFO_FILENAME);
                    if (count($files) > 1 && $msg['subject'] !== '') $label .= ' (' . ($i + 1) . ')';
                    $r = ingest_spd_upload($db, $uid, $tmp, $f['filename'], $label);
                    $r['_file'] = $f['filename'];
                    $made[] = $r;
                    $entry['reports'][] = $r['id'];
                } catch (\Throwable $e) {
                    $made[] = ['_file' => $f['filename'], 'error' => $e->getMessage()];
                } finally {
                    @unlink($tmp);
                }
            }

            if (INBOUND_REPLY) inbound_reply($msg, '', $made);

            if (IMAP_DELETE) imap_delete($mbox, (string)$num);
            else             imap_setflag_full($mbox, (string)$num, '\\Seen');

        } catch (\Throwable $e) {
            $entry['note'] = 'error: ' . $e->getMessage();
            error_log('inbound_poll message ' . $num . ': ' . $e->getMessage());
        }
        $processed[] = $entry;
    }
}

if (IMAP_DELETE) imap_expunge($mbox);
imap_close($mbox);
flock($lock, LOCK_UN);

inbound_finish(['ok' => true, 'count' => count($processed), 'messages' => $processed], $IS_CLI);
