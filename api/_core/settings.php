<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

/**
 * Lightweight key/value settings store. Created lazily so no migration is needed.
 * Values are stored as JSON.
 */

function settings_ensure(PDO $db): void
{
    $db->exec("CREATE TABLE IF NOT EXISTS settings (k VARCHAR(64) PRIMARY KEY, v TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function setting_get(PDO $db, string $key, $default = null)
{
    try {
        settings_ensure($db);
        $st = $db->prepare('SELECT v FROM settings WHERE k = ?');
        $st->execute([$key]);
        $v = $st->fetchColumn();
        if ($v === false) return $default;
        $decoded = json_decode((string)$v, true);
        return $decoded === null && $v !== 'null' ? $default : $decoded;
    } catch (\Throwable $e) {
        return $default;
    }
}

function setting_set(PDO $db, string $key, $value): void
{
    settings_ensure($db);
    $st = $db->prepare('INSERT INTO settings (k, v) VALUES (?, ?) ON DUPLICATE KEY UPDATE v = VALUES(v)');
    $st->execute([$key, json_encode($value)]);
}