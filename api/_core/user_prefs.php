<?php
declare(strict_types=1);

// Raw-data download switches, created on first use.
//
// users.reports_allow_download   the account DEFAULT (1 = on unless the user turns it off) (Account settings > Privacy). Copied onto each NEW report at upload time;
//                                changing it later does not touch reports that already exist.
// reports.allow_download         the per-report switch (1 = on, the default). When 1 the report page shows "Raw Instrument
//                                Data" with a CSV download to whoever can view that report. The owner flips it on the report.

function user_prefs_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    // Download is ON by default. A new column starts at 1 for every existing row too. A column an earlier version created
    // with a default of 0 is moved to 1 once (rows included); after that its default is 1 and this does nothing.
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM users')->fetchAll() as $c) $have[$c['Field']] = $c;
    if (!isset($have['reports_allow_download'])) {
        $db->exec('ALTER TABLE users ADD COLUMN reports_allow_download TINYINT(1) NOT NULL DEFAULT 1');
    } elseif ((string)$have['reports_allow_download']['Default'] === '0') {
        $db->exec('ALTER TABLE users MODIFY reports_allow_download TINYINT(1) NOT NULL DEFAULT 1');
        $db->exec('UPDATE users SET reports_allow_download=1');
    }
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM reports')->fetchAll() as $c) $have[$c['Field']] = $c;
    if (!isset($have['allow_download'])) {
        $db->exec('ALTER TABLE reports ADD COLUMN allow_download TINYINT(1) NOT NULL DEFAULT 1');
    } elseif ((string)$have['allow_download']['Default'] === '0') {
        $db->exec('ALTER TABLE reports MODIFY allow_download TINYINT(1) NOT NULL DEFAULT 1');
        $db->exec('UPDATE reports SET allow_download=1');
    }
    if (!isset($have['license'])) {
        $db->exec("ALTER TABLE reports ADD COLUMN license VARCHAR(16) NOT NULL DEFAULT ''");
    }
    $uh = [];
    foreach ($db->query('SHOW COLUMNS FROM users')->fetchAll() as $c) $uh[$c['Field']] = true;
    if (!isset($uh['reports_license'])) {
        $db->exec("ALTER TABLE users ADD COLUMN reports_license VARCHAR(16) NOT NULL DEFAULT ''");
    }
}

// Licenses a report can carry. '' = none chosen = all rights reserved.
const REPORT_LICENSES = ['', 'cc0', 'by', 'by-sa', 'by-nc', 'by-nd', 'by-nc-sa', 'by-nc-nd'];
function license_clean($v): string {
    $v = is_string($v) ? strtolower(trim($v)) : '';
    return in_array($v, REPORT_LICENSES, true) ? $v : '';
}
function report_license(int $reportId): string {
    try {
        $db = get_db(); user_prefs_ensure($db);
        $q = $db->prepare('SELECT license FROM reports WHERE id=?'); $q->execute([$reportId]);
        return license_clean((string)$q->fetchColumn());
    } catch (\Throwable $e) { return ''; }
}
function user_default_license(int $userId): string {
    try {
        $db = get_db(); user_prefs_ensure($db);
        $q = $db->prepare('SELECT reports_license FROM users WHERE id=?'); $q->execute([$userId]);
        return license_clean((string)$q->fetchColumn());
    } catch (\Throwable $e) { return ''; }
}

function user_allows_download(int $userId): bool {
    static $cache = [];
    if (isset($cache[$userId])) return $cache[$userId];
    $v = false;
    try {
        $db = get_db();
        user_prefs_ensure($db);
        $q = $db->prepare('SELECT reports_allow_download FROM users WHERE id=?');
        $q->execute([$userId]);
        $v = ((int)$q->fetchColumn()) === 1;
    } catch (\Throwable $e) { $v = false; }
    return $cache[$userId] = $v;
}

function report_allows_download(int $reportId): bool {
    try {
        $db = get_db();
        user_prefs_ensure($db);
        $q = $db->prepare('SELECT allow_download FROM reports WHERE id=?');
        $q->execute([$reportId]);
        return ((int)$q->fetchColumn()) === 1;
    } catch (\Throwable $e) { return false; }
}

// Call right after a report row is created: it starts with the owner's default.
function report_apply_download_default(int $reportId, int $userId): void {
    if ($reportId <= 0) return;
    try {
        $db = get_db();
        $db->prepare('UPDATE reports SET allow_download=? WHERE id=? AND user_id=?')->execute([user_allows_download($userId) ? 1 : 0, $reportId, $userId]);
        $lic = user_default_license($userId);
        if ($lic !== '') {
            $db->prepare('UPDATE reports SET license=? WHERE id=? AND user_id=?')->execute([$lic, $reportId, $userId]);
        }
    } catch (\Throwable $e) {}
}
