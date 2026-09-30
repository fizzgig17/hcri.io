<?php
declare(strict_types=1);

/**
 * Pure RFC822 / MIME parsing helpers for inbound email ingestion.
 * No I/O, no side effects — safe to unit-test in isolation.
 *
 * Caps come from inbound_config.php when present; sensible defaults otherwise.
 */

if (!defined('INBOUND_MAX_ATTACH')) define('INBOUND_MAX_ATTACH', 10);
if (!defined('INBOUND_MAX_BYTES'))  define('INBOUND_MAX_BYTES', 8 * 1024 * 1024);

/** Split a raw message/part into [headerBlock, body] at the first blank line. */
function inbound_split(string $raw): array
{
    $pos = strpos($raw, "\r\n\r\n");
    $len = 4;
    if ($pos === false) { $pos = strpos($raw, "\n\n"); $len = 2; }
    if ($pos === false) return [$raw, ''];
    return [substr($raw, 0, $pos), substr($raw, $pos + $len)];
}

/** Parse a header block into a lowercased-key map, unfolding continuations. */
function inbound_headers(string $block): array
{
    $block = preg_replace('/\r?\n[ \t]+/', ' ', $block); // unfold folded headers
    $out = [];
    foreach (preg_split('/\r?\n/', $block) as $line) {
        if (!preg_match('/^([^:]+):\s?(.*)$/', $line, $m)) continue;
        $k = strtolower(trim($m[1]));
        $out[$k] = isset($out[$k]) ? $out[$k] . ' ' . $m[2] : $m[2];
    }
    return $out;
}

/** Decode RFC2047 encoded-words (=?utf-8?B?...?=) in a header value. */
function inbound_decode_words(string $s): string
{
    if (stripos($s, '=?') === false) return trim($s);
    if (function_exists('iconv_mime_decode')) {
        $d = @iconv_mime_decode($s, ICONV_MIME_DECODE_CONTINUE_ON_ERROR, 'UTF-8');
        if ($d !== false) return trim($d);
    }
    if (function_exists('mb_decode_mimeheader')) return trim(mb_decode_mimeheader($s));
    return trim($s);
}

/** Pull a parameter (boundary, name, filename) out of a structured header. */
function inbound_param(string $header, string $name): ?string
{
    // RFC2231 extended form: name*=charset'lang'percent-encoded
    if (preg_match('/;\s*' . preg_quote($name, '/') . '\*\s*=\s*([^\';]+)\'[^\']*\'([^;\r\n]+)/i', $header, $m)) {
        return rawurldecode(trim($m[2]));
    }
    if (preg_match('/;\s*' . preg_quote($name, '/') . '\s*=\s*"([^"]*)"/i', $header, $m)) return $m[1];
    if (preg_match('/;\s*' . preg_quote($name, '/') . '\s*=\s*([^;\r\n]+)/i', $header, $m)) return trim($m[1]);
    return null;
}

/** Decode a leaf part body according to its transfer encoding. */
function inbound_decode_body(string $body, string $cte): string
{
    $cte = strtolower(trim($cte));
    if ($cte === 'base64')           return base64_decode(preg_replace('/\s+/', '', $body)) ?: '';
    if ($cte === 'quoted-printable') return quoted_printable_decode($body);
    return $body;
}

/**
 * Recursively walk a MIME part, collecting attachments and the first text body.
 * $headers is the header map for THIS part; $body is its (still-encoded) body.
 */
function inbound_walk(array $headers, string $body, array &$atts, string &$text): void
{
    $ctype = strtolower($headers['content-type'] ?? 'text/plain');
    $cte   = $headers['content-transfer-encoding'] ?? '7bit';
    $cdisp = $headers['content-disposition'] ?? '';

    if (str_starts_with($ctype, 'multipart/')) {
        $boundary = inbound_param($headers['content-type'] ?? '', 'boundary');
        if (!$boundary) return;
        foreach (explode('--' . $boundary, $body) as $seg) {
            $seg = ltrim($seg, "\r\n");
            if ($seg === '' || str_starts_with($seg, '--')) continue; // preamble / closing marker
            [$ph, $pb] = inbound_split($seg);
            inbound_walk(inbound_headers($ph), $pb, $atts, $text);
        }
        return;
    }

    // Leaf part
    $filename = inbound_param($cdisp, 'filename') ?? inbound_param($headers['content-type'] ?? '', 'name');
    if ($filename !== null) {
        if (count($atts) >= INBOUND_MAX_ATTACH) return;
        $data = inbound_decode_body($body, $cte);
        if (strlen($data) > 0 && strlen($data) <= INBOUND_MAX_BYTES) {
            $atts[] = ['filename' => inbound_decode_words($filename), 'data' => $data];
        }
        return;
    }

    if ($text === '' && str_starts_with($ctype, 'text/plain')) {
        $text = inbound_decode_body($body, $cte);
    }
}

/** Split a raw "From:" value (e.g. '"Doe, Jane" <j@x.com>') into email + name. */
function inbound_from_parts(string $raw): array
{
    $email = '';
    if (preg_match('/<([^>]+)>/', $raw, $m)) {
        $email = trim($m[1]);
    } elseif (preg_match('/([^\s<>"]+@[^\s<>"]+)/', $raw, $m)) {
        $email = trim($m[1]);
    }
    $name = trim(inbound_decode_words(preg_replace('/<[^>]*>/', '', $raw)), " \t\"");
    $email = strtolower($email);
    return ['email' => $email, 'name' => $name !== '' ? $name : $email];
}

/** Parse a raw RFC822 message into sender, subject, attachments, text body. */
function inbound_parse_message(string $raw): array
{
    [$hb, $body] = inbound_split($raw);
    $H = inbound_headers($hb);

    $fp = inbound_from_parts($H['from'] ?? '');

    $atts = [];
    $text = '';
    inbound_walk($H, $body, $atts, $text);

    return [
        'from'        => $fp['email'],
        'fromName'    => $fp['name'],
        'subject'     => inbound_decode_words($H['subject'] ?? ''),
        'attachments' => $atts,
        'text'        => $text,
        'messageId'   => trim($H['message-id'] ?? '', " <>\t"),
    ];
}

/** Heuristic: does this text body look like rows of "wavelength, value"? */
function inbound_looks_like_csv(string $text): bool
{
    if (trim($text) === '') return false;
    $hits = 0;
    foreach (preg_split('/\r?\n/', trim($text)) as $ln) {
        if (preg_match('/^\s*\d{3,4}(\.\d+)?\s*[,;\t ]\s*-?\d/', $ln)) $hits++;
    }
    return $hits >= 10;
}
