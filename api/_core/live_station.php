<?php
declare(strict_types=1);

/**
 * Live station: one per user. A phone (or any client with the person's API token) feeds the run that is going now; a
 * public link (the station token) shows it to anyone, and the owner can get emails when a run finishes, drops too low,
 * stops sending data or hits an error. The station keeps only the current (or last) run, so it is always "what is
 * running now".
 */

const LIVE_MAX_POINTS = 200000;
const LIVE_CMD_TTL = 60;
const LIVE_MONITOR_POINTS = 1800;   // a monitor keeps the last 30 minutes
const LIVE_DEFAULTS = ['emailDone' => true, 'emailLow' => false, 'emailStale' => true, 'emailError' => true, 'lowLm' => 0, 'staleMin' => 5];

function live_ensure(PDO $db): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    $cols = 'user_id    INT NOT NULL PRIMARY KEY,
            token      VARCHAR(32) NULL,
            enabled    TINYINT(1) NOT NULL DEFAULT 0,
            settings   TEXT NULL,
            run_id     VARCHAR(48) NOT NULL DEFAULT \'\',
            label      VARCHAR(160) NOT NULL DEFAULT \'\',
            unit       VARCHAR(16) NOT NULL DEFAULT \'lm\',
            interval_s DOUBLE NOT NULL DEFAULT 1,
            points     INT NOT NULL DEFAULT 0,
            payload    MEDIUMTEXT NULL,
            status     VARCHAR(12) NOT NULL DEFAULT \'idle\',
            message    VARCHAR(200) NOT NULL DEFAULT \'\',
            started_at BIGINT NULL DEFAULT NULL,
            last_at    BIGINT NULL DEFAULT NULL,
            alerts     TEXT NULL,
            UNIQUE KEY uq_live_token (token)';
    try {
        try { $db->exec("CREATE TABLE IF NOT EXISTS live_stations ($cols, CONSTRAINT fk_live_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)"); }
        catch (\Throwable $e) { $db->exec("CREATE TABLE IF NOT EXISTS live_stations ($cols)"); }
    } catch (\Throwable $e) { error_log('live_stations: ' . $e->getMessage()); }
    // kind: 'run' (a recording) or 'monitor' (just the tester's live reading, no run). base: absolute index of payload[0] (a monitor keeps only its last readings).
    try {
        if (!$db->query("SHOW COLUMNS FROM live_stations LIKE 'kind'")->fetch()) $db->exec("ALTER TABLE live_stations ADD COLUMN kind VARCHAR(8) NOT NULL DEFAULT 'run', ADD COLUMN base INT NOT NULL DEFAULT 0");
    } catch (\Throwable $e) { error_log('live_stations kind: ' . $e->getMessage()); }
    // What the owner is testing, typed by hand ("Olight Warrior 3, turbo, fresh cell"); shown on the live page and changeable mid-run.
    try {
        if (!$db->query("SHOW COLUMNS FROM live_stations LIKE 'info_title'")->fetch()) $db->exec("ALTER TABLE live_stations ADD COLUMN info_title VARCHAR(160) NOT NULL DEFAULT '', ADD COLUMN info_text TEXT NULL");
    } catch (\Throwable $e) { error_log('live_stations info: ' . $e->getMessage()); }

    // Temperatures recorded beside the lumens (Temp Logger sensors): {"0":{"name":"Temp 1","values":[..]},..}, one value per payload reading, null where there is none.
    try {
        if (!$db->query("SHOW COLUMNS FROM live_stations LIKE 'temps'")->fetch()) $db->exec("ALTER TABLE live_stations ADD COLUMN temps MEDIUMTEXT NULL");
    } catch (\Throwable $e) { error_log('live_stations temps: ' . $e->getMessage()); }

    // Remote control: the owner (website or app) leaves a command; whichever sender is connected to the tester picks it up with its next push.
    try {
        if (!$db->query("SHOW COLUMNS FROM live_stations LIKE 'cmd'")->fetch()) $db->exec("ALTER TABLE live_stations ADD COLUMN cmd VARCHAR(8) NOT NULL DEFAULT '', ADD COLUMN cmd_id VARCHAR(16) NOT NULL DEFAULT '', ADD COLUMN cmd_at BIGINT NULL DEFAULT NULL");
    } catch (\Throwable $e) { error_log('live_stations cmd: ' . $e->getMessage()); }
}

/** The command waiting for a sender, or null (commands expire after a minute so an old Start never fires by surprise). */
function live_pending_command(array $r): ?array
{
    if (($r['cmd'] ?? '') === '' || empty($r['cmd_at']) || time() - (int)$r['cmd_at'] > LIVE_CMD_TTL) return null;
    return ['id' => $r['cmd_id'], 'action' => $r['cmd'], 'ageSeconds' => time() - (int)$r['cmd_at']];
}

/** The "command" part of a push answer: the waiting command, unless this push just acknowledged it. */
function live_cmd_reply(array $r, string $ack): array
{
    $c = live_pending_command($r);
    return $c && $c['id'] !== $ack ? ['command' => ['id' => $c['id'], 'action' => $c['action']]] : [];
}

function live_valid_token(mixed $t): bool
{
    return is_string($t) && preg_match('/^[a-f0-9]{24}$/', $t) === 1;
}

function live_settings(?string $json): array
{
    $s = json_decode((string)$json, true);
    $out = LIVE_DEFAULTS;
    if (is_array($s)) {
        foreach (['emailDone', 'emailLow', 'emailStale', 'emailError'] as $k) if (array_key_exists($k, $s)) $out[$k] = (bool)$s[$k];
        if (isset($s['lowLm']))   $out['lowLm']   = max(0, min(1000000, (float)$s['lowLm']));
        if (isset($s['staleMin'])) $out['staleMin'] = max(2, min(240, (int)$s['staleMin']));
    }
    return $out;
}

function live_row(PDO $db, int $uid): array
{
    live_ensure($db);
    $s = $db->prepare('SELECT * FROM live_stations WHERE user_id = ?');
    $s->execute([$uid]);
    $r = $s->fetch();
    if (!$r) {
        $db->prepare('INSERT IGNORE INTO live_stations (user_id) VALUES (?)')->execute([$uid]);
        $s->execute([$uid]);
        $r = $s->fetch();
    }
    return $r;
}

function live_url(string $token): string
{
    // The host the request came to (so dev.hcri.io hands out dev links); cron runs have none, so they use the configured site.
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    $base = preg_match('/^[A-Za-z0-9.-]+(:\d+)?$/', $host) ? 'https://' . $host : (defined('INBOUND_SITE_URL') ? INBOUND_SITE_URL : 'https://www.hcri.io');
    return rtrim($base, '/') . '/?live=' . $token;
}

/** Seconds since the last data, and whether the station counts as silent for its owner's limit. */
function live_age(array $r): ?int
{
    if (empty($r['last_at'])) return null;
    return max(0, time() - (int)$r['last_at']);
}

function live_is_stale(array $r): bool
{
    if ($r['status'] !== 'running') return false;
    $age = live_age($r);
    if ($age === null) return false;
    return $age > live_settings($r['settings'])['staleMin'] * 60;
}

/** What the owner sees (and the app/website settings page). */
function live_owner_view(array $r): array
{
    return [
        'enabled'  => (bool)$r['enabled'],
        'token'    => $r['token'],
        'url'      => $r['token'] ? live_url($r['token']) : null,
        'settings' => live_settings($r['settings']),
        'info'     => live_info($r),
        'run'      => live_run_summary($r),
        'command'  => live_pending_command($r),
    ];
}

function live_info(array $r): array
{
    return ['title' => (string)($r['info_title'] ?? ''), 'details' => (string)($r['info_text'] ?? '')];
}

function live_run_summary(array $r): array
{
    $v = json_decode((string)$r['payload'], true);
    $last = is_array($v) && $v ? (float)end($v) : null;
    return [
        'runId' => $r['run_id'], 'kind' => ($r['kind'] ?? 'run') === 'monitor' ? 'monitor' : 'run', 'label' => $r['label'], 'unit' => $r['unit'], 'status' => $r['status'], 'message' => $r['message'],
        'points' => (int)$r['points'], 'intervalSeconds' => (float)$r['interval_s'], 'last' => $last,
        'startedAt' => $r['started_at'] ? gmdate('c', (int)$r['started_at']) : null,
        'lastAt' => $r['last_at'] ? gmdate('c', (int)$r['last_at']) : null,
        'ageSeconds' => live_age($r), 'stale' => live_is_stale($r),
    ];
}

function live_email(PDO $db, int $uid, string $subject, string $text, string $token): void
{
    try {
        require_once __DIR__ . '/mailer.php';
        $u = $db->prepare('SELECT email, name FROM users WHERE id = ?');
        $u->execute([$uid]);
        $row = $u->fetch();
        if (!$row || !$row['email']) return;
        $who = $row['name'] !== '' ? $row['name'] : 'there';
        send_email($row['email'], $who, $subject, "Hi $who,\n\n$text\n\nWatch it live: " . live_url($token)
            . "\n\nYou can change these alerts in Settings (app) or Runtime → Live station (website).\n\nhCRI.io");
    } catch (\Throwable $e) {
        error_log('live email failed: ' . $e->getMessage());
    }
}

function live_fmt_duration(int $s): string
{
    $h = intdiv($s, 3600); $m = intdiv($s % 3600, 60);
    return $h > 0 ? "{$h} h {$m} min" : "{$m} min";
}

/** Sends each kind of alert at most once per run. $alerts is changed in place; the caller saves it. */
function live_alerts(PDO $db, array $r, array &$alerts, ?array $values = null): void
{
    if (($r['kind'] ?? 'run') !== 'run') return;   // a plain live reading is not a run: no emails
    $set = live_settings($r['settings']);
    $uid = (int)$r['user_id'];
    $label = $r['label'] !== '' ? $r['label'] : 'TKLamp run';
    $unit = $r['unit'] ?: 'lm';
    $vals = $values ?? (json_decode((string)$r['payload'], true) ?: []);
    $last = $vals ? (float)end($vals) : null;
    $dur = live_fmt_duration((int)round(count($vals) * (float)$r['interval_s']));
    $lastTxt = $last !== null ? rtrim(rtrim(number_format($last, 1, '.', ''), '0'), '.') . " $unit" : 'no reading';

    if ($r['status'] === 'finished' && $set['emailDone'] && empty($alerts['done'])) {
        $alerts['done'] = 1;
        live_email($db, $uid, "Run finished: $label", "Your run \"$label\" finished after $dur. Last reading: $lastTxt.", $r['token']);
    }
    if ($r['status'] === 'error' && $set['emailError'] && empty($alerts['error'])) {
        $alerts['error'] = 1;
        live_email($db, $uid, "Problem with your run: $label", "Your run \"$label\" reported a problem after $dur: " . ($r['message'] !== '' ? $r['message'] : 'the instrument stopped working') . ". Last reading: $lastTxt.", $r['token']);
    }
    if ($r['status'] === 'running' && $set['emailLow'] && $set['lowLm'] > 0 && empty($alerts['low']) && count($vals) >= 3) {
        $tail = array_slice($vals, -3);
        if (max($tail) < $set['lowLm']) {
            $alerts['low'] = 1;
            live_email($db, $uid, "Output is low: $label", "The output of \"$label\" has fallen to $lastTxt, below your limit of " . $set['lowLm'] . " $unit, after $dur.", $r['token']);
        }
    }
}

/** Marks silent running stations and emails their owners once. Cheap: call it from anywhere; it runs at most once a minute. */
function live_check_all(PDO $db, bool $force = false): int
{
    live_ensure($db);
    $flag = sys_get_temp_dir() . '/hcri_live_check';
    if (!$force && is_file($flag) && time() - (int)@filemtime($flag) < 60) return 0;
    @touch($flag);
    $n = 0;
    try {
        $rows = $db->query("SELECT * FROM live_stations WHERE enabled = 1 AND status = 'running' AND kind = 'run' AND last_at IS NOT NULL")->fetchAll();
        foreach ($rows as $r) {
            if (!live_is_stale($r)) continue;
            $alerts = json_decode((string)$r['alerts'], true) ?: [];
            if (!empty($alerts['stale'])) continue;
            $set = live_settings($r['settings']);
            $alerts['stale'] = 1;
            $db->prepare('UPDATE live_stations SET alerts = ? WHERE user_id = ?')->execute([json_encode($alerts), $r['user_id']]);
            $n++;
            if ($set['emailStale']) {
                $label = $r['label'] !== '' ? $r['label'] : 'TKLamp run';
                live_email($db, (int)$r['user_id'], "No data from your run: $label", "Nothing has arrived from \"$label\" for more than " . $set['staleMin'] . " minutes. The phone may be off, out of signal, or disconnected from the bridge or tester. The run is not marked finished, and the station will carry on if data returns.", $r['token']);
            }
        }
    } catch (\Throwable $e) { error_log('live check: ' . $e->getMessage()); }
    return $n;
}
