<?php
declare(strict_types=1);

// ── GDPR / privacy helpers ───────────────────────────────────────────────────
// The version string of the Privacy Policy + Terms a user agreed to at signup.
// Bump this whenever the policy materially changes (and consider re-prompting).
const CONSENT_VERSION = '2026-10-05';

/**
 * Best-effort: make sure the consent columns exist on the users table.
 * Safe to call repeatedly; only runs the schema check once per request.
 * Silently no-ops if the DB user lacks ALTER privileges — callers must
 * tolerate the columns being absent (use try/catch around consent INSERTs).
 */
function consent_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $cols = $db->query(
            "SELECT COLUMN_NAME FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
        )->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('consent_at', $cols, true)) {
            $db->exec("ALTER TABLE users ADD COLUMN consent_at DATETIME NULL");
        }
        if (!in_array('consent_version', $cols, true)) {
            $db->exec("ALTER TABLE users ADD COLUMN consent_version VARCHAR(32) NULL");
        }
    } catch (\Throwable $e) {
        // best effort only
    }
}

/** Is a column on a table nullable? Used to decide anonymise-vs-delete. */
function column_is_nullable(PDO $db, string $table, string $column): bool {
    try {
        $s = $db->prepare(
            "SELECT IS_NULLABLE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?"
        );
        $s->execute([$table, $column]);
        return strtoupper((string)$s->fetchColumn()) === 'YES';
    } catch (\Throwable $e) {
        return false;
    }
}