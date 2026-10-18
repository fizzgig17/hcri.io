<?php
declare(strict_types=1);

// Private cloud backup for the hCRI Companion app.
//
// One row per backed-up reading (the app's own reading id), owned by the API token's user. These rows are NOT
// reports: they never appear on explore, search, profiles or any public/shared page, and nothing here is
// reachable without the owner's API token. Later the app can offer to turn selected backups into ordinary
// reports; until then the data is only ever returned to the user who stored it.

const COMPANION_BACKUP_MAX_ITEM_BYTES = 262144;   // one reading with its spectrum is a few tens of KB
const COMPANION_BACKUP_MAX_BATCH      = 25;       // items per request
const COMPANION_BACKUP_MAX_PER_USER   = 5000;     // readings kept per account

function companion_backup_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $cols = 'user_id      INT NOT NULL,
            item_id      VARCHAR(64) NOT NULL,
            saved_at     BIGINT NOT NULL,
            updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            payload      MEDIUMTEXT NOT NULL,
            PRIMARY KEY (user_id, item_id),
            KEY idx_user_saved (user_id, saved_at)';
    try {
        try { $db->exec("CREATE TABLE IF NOT EXISTS companion_backups ($cols, CONSTRAINT fk_cb_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)"); }
        catch (\Throwable $e) { $db->exec("CREATE TABLE IF NOT EXISTS companion_backups ($cols)"); }
    } catch (\Throwable $e) { /* no CREATE privilege: run sql/companion_backups.sql */ }
}

/** Removes everything a user backed up (called when an account is deleted). */
function companion_backup_delete_user(PDO $db, int $userId): void {
    try { $db->prepare('DELETE FROM companion_backups WHERE user_id = ?')->execute([$userId]); } catch (\Throwable $e) {}
}

/** Item ids are the app's own ids ("1760000000000-ab12cd"): keep them to a safe, short character set. */
function companion_backup_valid_id(mixed $id): bool {
    return is_string($id) && preg_match('/^[A-Za-z0-9._-]{1,64}$/', $id) === 1;
}
