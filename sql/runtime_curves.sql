-- Private runtime (output-over-time) curves: one row per light, owned by the API token's user.
-- Not reports: never shown on explore, profiles or any public page. Safe to run more than once.
-- The API also creates this table on first use (runtime_curves_ensure()), so running this is optional.
CREATE TABLE IF NOT EXISTS runtime_curves (
  user_id    INT NOT NULL,
  curve_id   VARCHAR(64) NOT NULL,
  label      VARCHAR(160) NOT NULL,
  group_name VARCHAR(80) NOT NULL DEFAULT '',
  unit       VARCHAR(16) NOT NULL DEFAULT '',
  interval_s DOUBLE NOT NULL,
  points     INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  payload    MEDIUMTEXT NOT NULL,
  meta       TEXT NULL,
  PRIMARY KEY (user_id, curve_id),
  KEY idx_user_group (user_id, group_name, label),
  CONSTRAINT fk_rc_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Existing installs: ALTER TABLE runtime_curves ADD COLUMN meta TEXT NULL;

-- Share links: ALTER TABLE runtime_curves ADD COLUMN share_token VARCHAR(32) NULL; ALTER TABLE runtime_curves ADD UNIQUE KEY uq_rc_share (share_token);
