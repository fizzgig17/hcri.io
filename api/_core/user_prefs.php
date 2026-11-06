<?php
declare(strict_types=1);

// Raw-data download switches, created on first use.
//
// users.reports_allow_download   the account DEFAULT (Account settings > Privacy). Copied onto each NEW report at upload time;
//                                changing it later does not touch reports that already exist.
// reports.allow_download         the per-report switch (0 = off, the default). When 1 the report page shows "Raw Instrument
//                                Data" with a CSV download to whoever can view that report. The owner flips it on the report.

function user_prefs_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM users')->fetchAll() as $c) $have[$c['Field']] = true;
    if (!isset($have['reports_allow_download'])) {
        $db->exec('ALTER TABLE users ADD COLUMN reports_allow_download TINYINT(1) NOT NULL DEFAULT 0');
    }
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM reports')->fetchAll() as $c) $have[$c['Field']] = true;
    if (!isset($have['allow_download'])) {
        $db->exec('ALTER TABLE reports ADD COLUMN allow_download TINYINT(1) NOT NULL DEFAULT 0');
    }
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
    if ($reportId <= 0 || !user_allows_download($userId)) return;
    try {
        $db = get_db();
        $db->prepare('UPDATE reports SET allow_download=1 WHERE id=? AND user_id=?')->execute([$reportId, $userId]);
    } catch (\Throwable $e) {}
}
