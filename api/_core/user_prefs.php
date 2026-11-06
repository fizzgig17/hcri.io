<?php
declare(strict_types=1);

// Per-user switches stored on the users row, created on first use.
//
// reports_allow_download: 0 (default) = report pages offer no raw-data download; 1 = the owner opted in, so every one of
// their reports shows a "Raw Instrument Data" section with a CSV download to whoever can view the report.

function user_prefs_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM users')->fetchAll() as $c) $have[$c['Field']] = true;
    if (!isset($have['reports_allow_download'])) {
        $db->exec('ALTER TABLE users ADD COLUMN reports_allow_download TINYINT(1) NOT NULL DEFAULT 0');
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
