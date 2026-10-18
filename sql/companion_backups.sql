-- Private cloud backup for the hCRI Companion app: one row per backed-up reading, owned by the API token's user.
-- Not reports: never shown on explore, profiles or any public page. Safe to run more than once.
-- The API also creates this table on first use (companion_backup_ensure()), so running this is optional.
CREATE TABLE IF NOT EXISTS companion_backups (
  user_id    INT NOT NULL,
  item_id    VARCHAR(64) NOT NULL,
  saved_at   BIGINT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  payload    MEDIUMTEXT NOT NULL,
  PRIMARY KEY (user_id, item_id),
  KEY idx_user_saved (user_id, saved_at),
  CONSTRAINT fk_cb_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
