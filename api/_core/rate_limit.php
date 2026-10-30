<?php
// api/_core/rate_limit.php
//
// Per-IP request limits for the public read endpoints, so the site can't be walked report by report.
// Counters live in a small MySQL table (created on first use). If the database is unavailable the limiter lets
// the request through rather than taking the site down.
//
//   hcri_rate_limit('item', $uri)   -- call once per request, before doing the work
//
// Limits (per minute / per hour), signed-in users get the second pair:
declare(strict_types=1);

require_once __DIR__ . '/db.php';

const HCRI_RATE_GROUPS = [
    //          guest min/hour   signed-in min/hour
    'item' => [90, 600,          120, 1000],   // one report, shared report, share/OG images
    'list' => [60, 400,          100, 800],    // explore list, stats
    'pdf'  => [15, 60,           30,  150],    // server-built PDFs
];

/** Which group a path belongs to, or null when it isn't limited. */
function hcri_rate_group(string $uri): ?string
{
    if (preg_match('#^/api/explore/stats/?$#', $uri) || preg_match('#^/api/explore/?$#', $uri)) return 'list';
    if (preg_match('#^/api/(explore/[A-Za-z0-9]+|shared/[A-Za-z0-9_-]+|og/.+)$#', $uri)) return 'item';
    if (preg_match('#^/api/(guest_pdf|annexe_pdf|reports/[A-Za-z0-9]+/pdf)$#', $uri)) return 'pdf';
    return null;
}

/** True if `$ip` falls in `$cidr`. */
function hcri_ip_in_cidr(string $ip, string $cidr): bool
{
    [$net, $bits] = explode('/', $cidr) + [1 => '']; $bits = (int)$bits;
    $a = @inet_pton($ip); $b = @inet_pton($net);
    if ($a === false || $b === false || strlen($a) !== strlen($b)) return false;
    $bytes = intdiv($bits, 8); $rem = $bits % 8;
    if ($bytes && substr($a, 0, $bytes) !== substr($b, 0, $bytes)) return false;
    if ($rem) { $mask = (0xFF << (8 - $rem)) & 0xFF; if ((ord($a[$bytes]) & $mask) !== (ord($b[$bytes]) & $mask)) return false; }
    return true;
}

/** The visitor's address. Behind Cloudflare, REMOTE_ADDR is Cloudflare's, so CF-Connecting-IP is trusted only from its ranges. */
function hcri_client_ip(): string
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    $cf = (string)($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '');
    if ($cf !== '' && filter_var($cf, FILTER_VALIDATE_IP)) {
        static $ranges = ['173.245.48.0/20','103.21.244.0/22','103.22.200.0/22','103.31.4.0/22','141.101.64.0/18','108.162.192.0/18',
            '190.93.240.0/20','188.114.96.0/20','197.234.240.0/22','198.41.128.0/17','162.158.0.0/15','104.16.0.0/13','104.24.0.0/14',
            '172.64.0.0/13','131.0.72.0/22','2400:cb00::/32','2606:4700::/32','2803:f800::/32','2405:b500::/32','2405:8100::/32',
            '2a06:98c0::/29','2c0f:f248::/32'];
        foreach ($ranges as $r) if (hcri_ip_in_cidr($ip, $r)) return $cf;
    }
    return $ip;
}

function hcri_rate_limit(string $group, string $uri = ''): void
{
    $lim = HCRI_RATE_GROUPS[$group] ?? null;
    if (!$lim) return;
    $signedIn = false; $userId = 0;
    try {
        require_once __DIR__ . '/auth.php';
        $h = get_auth_header();
        if (str_starts_with($h, 'Bearer ')) { $p = jwt_verify(substr($h, 7)); $signedIn = $p && isset($p['id']); if ($signedIn) $userId = (int)$p['id']; }
    } catch (\Throwable $e) {}
    [$perMin, $perHour] = $signedIn ? [$lim[2], $lim[3]] : [$lim[0], $lim[1]];

    $key = substr(hash('sha256', $group . '|' . hcri_client_ip()), 0, 32);
    $now = time();
    $minute = intdiv($now, 60); $hour = intdiv($now, 3600);
    try {
        $db = get_db();
        $db->exec('CREATE TABLE IF NOT EXISTS rate_limits (
            k CHAR(32) NOT NULL, kind CHAR(1) NOT NULL, slot INT NOT NULL, hits INT NOT NULL DEFAULT 0,
            PRIMARY KEY (k, kind, slot)) ENGINE=InnoDB');
        $up = $db->prepare('INSERT INTO rate_limits (k, kind, slot, hits) VALUES (?, ?, ?, 1) ON DUPLICATE KEY UPDATE hits = hits + 1');
        $get = $db->prepare('SELECT hits FROM rate_limits WHERE k = ? AND kind = ? AND slot = ?');
        $over = 0;
        foreach ([['m', $minute, $perMin, 60 - ($now % 60)], ['h', $hour, $perHour, 3600 - ($now % 3600)]] as [$kind, $slot, $max, $wait]) {
            $up->execute([$key, $kind, $slot]);
            $get->execute([$key, $kind, $slot]);
            if ((int)$get->fetchColumn() > $max) $over = max($over, $wait);
        }
        if ($userId > 0) hcri_account_activity($db, $userId, $minute, $hour);
        if (random_int(1, 200) === 1) {   // tidy old counters now and then
            $db->prepare("DELETE FROM rate_limits WHERE (kind IN ('m','u') AND slot < ?) OR (kind IN ('h','a') AND slot < ?)")->execute([$minute - 2, $hour - 2]);
        }
        if ($over > 0) {
            http_response_code(429);
            header('Retry-After: ' . $over);
            header('Cache-Control: no-store');
            if (str_contains($uri, '/og/')) { header('Content-Type: text/plain'); echo 'Too many requests'; }
            else { header('Content-Type: application/json; charset=utf-8'); echo json_encode(['error' => 'Too many requests. Please slow down and try again shortly.']); }
            exit;
        }
    } catch (\Throwable $e) { /* fail open */ }
}

// A signed-in account making more than this many limited requests in a minute gets reported by email (at most once an hour per account).
const HCRI_ACCOUNT_ALERT_PER_MIN = 30;

function hcri_account_activity(PDO $db, int $userId, int $minute, int $hour): void
{
    try {
        $k = 'u' . str_pad((string)$userId, 31, '0', STR_PAD_LEFT);
        $db->prepare("INSERT INTO rate_limits (k, kind, slot, hits) VALUES (?, 'u', ?, 1) ON DUPLICATE KEY UPDATE hits = hits + 1")->execute([$k, $minute]);
        $q = $db->prepare("SELECT hits FROM rate_limits WHERE k = ? AND kind = 'u' AND slot = ?");
        $q->execute([$k, $minute]);
        $hits = (int)$q->fetchColumn();
        if ($hits <= HCRI_ACCOUNT_ALERT_PER_MIN) return;
        // once per hour per account: the first insert wins
        $a = $db->prepare("INSERT IGNORE INTO rate_limits (k, kind, slot, hits) VALUES (?, 'a', ?, 1)");
        $a->execute([$k, $hour]);
        if ($a->rowCount() !== 1) return;
        $u = $db->prepare('SELECT name, email FROM users WHERE id = ?');
        $u->execute([$userId]);
        $user = $u->fetch();
        if (!$user) return;
        require_once __DIR__ . '/mailer.php';
        $to = getenv('HCRI_ALERT_EMAIL') ?: (defined('HCRI_ALERT_EMAIL') ? HCRI_ALERT_EMAIL : 'fizzgig@hcri.io');
        send_email($to, 'hCRI.io admin', 'hCRI.io: heavy activity from ' . $user['name'],
            "Account \"" . $user['name'] . "\" (" . $user['email'] . ", user id $userId) made $hits requests in one minute"
            . " (alert threshold " . HCRI_ACCOUNT_ALERT_PER_MIN . ").\n\nHost: " . ($_SERVER['HTTP_HOST'] ?? '') . "\nIP: " . hcri_client_ip()
            . "\nTime: " . gmdate('Y-m-d H:i:s') . " UTC\n\nYou get at most one of these per account per hour.");
    } catch (\Throwable $e) { error_log('hCRI activity alert failed: ' . $e->getMessage()); }
}
