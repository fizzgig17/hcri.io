<?php
declare(strict_types=1);

// Small file-based rate limiter (no DB schema needed). Counters live in the system temp dir, keyed by a
// hash, and expire with their window. Good enough to stop password guessing and mail flooding; if the
// temp dir is cleared the counters simply reset.

function rl_client_ip(): string {
    require_once __DIR__ . '/rate_limit.php';   // knows about Cloudflare's forwarded address
    return hcri_client_ip();
}

function rl_path(string $bucket, string $key): string {
    return sys_get_temp_dir() . '/hcri_rl_' . $bucket . '_' . hash('sha256', $key);
}

/** Number of hits recorded for $bucket/$key within the last $window seconds. */
function rl_count(string $bucket, string $key, int $window): int {
    $f = rl_path($bucket, $key);
    if (!is_file($f)) return 0;
    $raw = @file_get_contents($f);
    $times = $raw ? (json_decode($raw, true) ?: []) : [];
    $cut = time() - $window;
    return count(array_filter($times, fn($t) => $t > $cut));
}

/** Records one hit. */
function rl_hit(string $bucket, string $key, int $window): void {
    $f = rl_path($bucket, $key);
    $fh = @fopen($f, 'c+');
    if (!$fh) return;
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $times = $raw ? (json_decode($raw, true) ?: []) : [];
    $cut = time() - $window;
    $times = array_values(array_filter($times, fn($t) => $t > $cut));
    $times[] = time();
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($times));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
}

/** Forgets the counter (e.g. after a successful login). */
function rl_clear(string $bucket, string $key): void {
    @unlink(rl_path($bucket, $key));
}

/** Responds 429 when $bucket/$key already has $max hits in the window. */
function rl_block_if_over(string $bucket, string $key, int $max, int $window, string $msg = 'Too many attempts. Please wait a few minutes and try again.'): void {
    if (rl_count($bucket, $key, $window) >= $max) {
        header('Retry-After: ' . $window);
        json_error($msg, 429);
    }
}
