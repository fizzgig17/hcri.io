<?php
declare(strict_types=1);

// Site notices (the banners): one row per message. Created and upgraded on first use, so no manual migration.
//
// type     info | news | success | warning | issue | important | alert  (sets the colour and the default icon)
// icon     '' = the type's default, otherwise one of NOTICE_ICONS
// location top | report | both
// rev      goes up by one every time the notice is saved. The browser remembers a dismissal as "notice <id> at rev <n>", so
//          saving a notice shows it again to everyone who had dismissed it.
// dismissible  0 = the banner has no close button

const NOTICE_TYPES = ['info', 'news', 'success', 'warning', 'issue', 'important', 'alert'];
const NOTICE_ICONS = ['info', 'check', 'warning', 'alert', 'megaphone', 'wrench', 'clock', 'star', 'bolt', 'heart'];

function notices_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $db->exec("CREATE TABLE IF NOT EXISTS notices (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        type        VARCHAR(16) NOT NULL DEFAULT 'news',
        location    VARCHAR(16) NOT NULL DEFAULT 'top',
        message     TEXT NOT NULL,
        starts_at   DATETIME NOT NULL,
        ends_at     DATETIME NOT NULL,
        enabled     TINYINT(1) NOT NULL DEFAULT 1,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) DEFAULT CHARSET=utf8mb4");
    $have = [];
    foreach ($db->query('SHOW COLUMNS FROM notices')->fetchAll() as $c) $have[$c['Field']] = $c['Type'];
    // an older table may have type as an ENUM of the first three kinds: widen it
    if (isset($have['type']) && stripos($have['type'], 'enum') === 0) {
        $db->exec("ALTER TABLE notices MODIFY type VARCHAR(16) NOT NULL DEFAULT 'news'");
    }
    if (!isset($have['icon']))        $db->exec("ALTER TABLE notices ADD COLUMN icon VARCHAR(16) NOT NULL DEFAULT ''");
    if (!isset($have['dismissible'])) $db->exec('ALTER TABLE notices ADD COLUMN dismissible TINYINT(1) NOT NULL DEFAULT 1');
    if (!isset($have['rev']))         $db->exec('ALTER TABLE notices ADD COLUMN rev INT NOT NULL DEFAULT 1');
}
