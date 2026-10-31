<?php

declare(strict_types=1);

/**
 * One-time, self-applying fix so names and descriptions with accented letters (Kōsen, Müller, ...) can be stored. The
 * original schema (database.sql) was created with the latin1 default, which cannot hold them; the connection already speaks
 * utf8mb4 (db.php). Only the human text columns are converted, one column at a time, so the large spectrum columns are
 * left alone. A marker file in the temp directory keeps this to one cheap file check per request.
 */
function utf8mb4_text_ensure(PDO $db): void
{
    static $ran = false;
    if ($ran) return;
    $ran = true;
    $flag = sys_get_temp_dir() . '/hcri_utf8mb4_v1_' . md5((string)DB_NAME . (string)DB_HOST);
    if (is_file($flag)) return;
    try {
        $want = [
            'users'   => ['name'],
            'reports' => ['label', 'model', 'manufacturer', 'led_details', 'notes', 'meta'],
            'folders' => ['name', 'description'],
        ];
        foreach ($want as $table => $cols) {
            $in = implode(',', array_fill(0, count($cols), '?'));
            $st = $db->prepare(
                "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_SET_NAME
                   FROM information_schema.COLUMNS
                  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME IN ($in)"
            );
            $st->execute(array_merge([$table], $cols));
            foreach ($st->fetchAll() as $c) {
                if (!$c['CHARACTER_SET_NAME'] || $c['CHARACTER_SET_NAME'] === 'utf8mb4') continue;
                $def = $c['COLUMN_TYPE'] . ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ' . ($c['IS_NULLABLE'] === 'YES' ? 'NULL' : 'NOT NULL');
                if ($c['IS_NULLABLE'] === 'NO' && $c['COLUMN_DEFAULT'] !== null && stripos((string)$c['COLUMN_TYPE'], 'text') === false) {
                    $def .= ' DEFAULT ' . $db->quote((string)$c['COLUMN_DEFAULT']);
                }
                $db->exec('ALTER TABLE `' . $table . '` MODIFY `' . $c['COLUMN_NAME'] . '` ' . $def);
            }
        }
        @file_put_contents($flag, '1');
    } catch (\Throwable $e) {
        error_log('utf8mb4 text migration: ' . $e->getMessage());
    }
}
