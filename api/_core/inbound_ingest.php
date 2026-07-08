<?php
declare(strict_types=1);

/**
 * Shared inbound-email processing used by the webhook receiver (and usable by
 * the IMAP poller). Pure-ish orchestration on top of ingest_spd_upload().
 */

require_once __DIR__ . '/inbound_parse.php';
require_once __DIR__ . '/ingest.php';
require_once __DIR__ . '/mailer.php';

/**
 * Normalise an inbound webhook request into a common shape, regardless of
 * whether the provider sent raw MIME, urlencoded fields, or multipart + files.
 * Returns ['from','fromName','subject','files'=>[['filename','data'],...],'text','messageId'].
 *
 * For security, uploaded files are only read when is_uploaded_file() is true
 * (a genuine HTTP upload). Tests may define INBOUND_ALLOW_PLAIN_FILES.
 */
function inbound_collect(array $post, array $files, string $rawInput, string $contentType): array
{
    // 1) Raw MIME available? (Forward Email body-mime, SendGrid "email", or a
    //    message/rfc822 POST.) Parse it directly — most faithful.
    $rawMime = $post['body-mime'] ?? ($post['email'] ?? '');
    if ($rawMime === '' && stripos($contentType, 'message/rfc822') !== false) $rawMime = $rawInput;
    if (is_string($rawMime) && $rawMime !== '' && strpos($rawMime, "\n") !== false) {
        return inbound_parse_message($rawMime);
    }

    // 2) Parsed fields (Mailgun / Forward Email / SendGrid style).
    $fp      = inbound_from_parts((string)($post['from'] ?? $post['sender'] ?? ''));
    $subject = (string)($post['subject'] ?? '');
    $text    = (string)($post['body-plain'] ?? $post['text'] ?? '');

    $allowPlain = defined('INBOUND_ALLOW_PLAIN_FILES');
    $out = [];
    foreach ($files as $fa) {
        $names = $fa['name'] ?? null;
        $tmps  = $fa['tmp_name'] ?? null;
        if (is_array($tmps)) {
            foreach ($tmps as $j => $tn) {
                if ($tn && (is_uploaded_file($tn) || ($allowPlain && is_file($tn)))) {
                    $out[] = ['filename' => (string)($names[$j] ?? 'attachment'), 'data' => (string)@file_get_contents($tn)];
                }
            }
        } elseif (is_string($tmps) && $tmps !== '' && (is_uploaded_file($tmps) || ($allowPlain && is_file($tmps)))) {
            $out[] = ['filename' => (string)($names ?? 'attachment'), 'data' => (string)@file_get_contents($tmps)];
        }
    }

    return [
        'from'        => $fp['email'],
        'fromName'    => $fp['name'],
        'subject'     => $subject,
        'attachments' => $out,
        'text'        => $text,
        'messageId'   => trim((string)($post['message-id'] ?? $post['Message-Id'] ?? ''), " <>\t"),
    ];
}

/** Look up a registered user by email (case-insensitive). Returns row or null. */
function inbound_match_user(PDO $db, string $email): ?array
{
    if ($email === '') return null;
    $q = $db->prepare('SELECT id, name FROM users WHERE LOWER(email) = ? LIMIT 1');
    $q->execute([strtolower($email)]);
    $r = $q->fetch(PDO::FETCH_ASSOC);
    return $r ?: null;
}

/**
 * Ingest each candidate file into a report for $uid. Returns a list of result
 * rows (each is the ingest_spd_upload() return + '_file', or ['_file','error']).
 */
function inbound_ingest_files(PDO $db, int $uid, string $subject, array $files): array
{
    $made = [];
    $n = count($files);
    foreach ($files as $i => $f) {
        $tmp = tempnam(sys_get_temp_dir(), 'hcri_in_');
        file_put_contents($tmp, $f['data']);
        try {
            $label = $subject !== '' ? $subject : pathinfo($f['filename'], PATHINFO_FILENAME);
            if ($n > 1 && $subject !== '') $label .= ' (' . ($i + 1) . ')';
            $r = ingest_spd_upload($db, $uid, $tmp, $f['filename'], $label);
            $r['_file'] = $f['filename'];
            $made[] = $r;
        } catch (\Throwable $e) {
            $made[] = ['_file' => $f['filename'], 'error' => $e->getMessage()];
        } finally {
            @unlink($tmp);
        }
    }
    return $made;
}

/** Email the sender a confirmation/summary. Never throws. */
function inbound_reply(string $from, string $fromName, string $subject, string $prefix, array $made): void
{
    if (!INBOUND_REPLY || $from === '') return;
    try {
        $lines = ["Thanks - here is what we did with your email to hCRI.io:\n"];
        if ($prefix !== '') $lines[] = $prefix;
        $ok = 0;
        foreach ($made as $r) {
            if (isset($r['error'])) {
                $lines[] = "x {$r['_file']}: {$r['error']}";
            } else {
                $ok++;
                $url = INBOUND_SITE_URL . '/?report=' . $r['id'];
                $cct = $r['cct'] !== null ? $r['cct'] . 'K' : '-';
                $lines[] = "+ {$r['_file']} -> report #{$r['id']}  (CCT {$cct})\n   {$url}";
            }
        }
        if ($made && $ok === 0) $lines[] = "\nNo reports were created. Check the file format (csv, tsv, txt, json, sp, pdf).";
        $subj = 'Re: ' . ($subject !== '' ? $subject : 'your hCRI.io upload');
        send_email($from, $fromName !== '' ? $fromName : $from, $subj, implode("\n", $lines) . "\n");
    } catch (\Throwable $e) {
        error_log('inbound_reply failed: ' . $e->getMessage());
    }
}
