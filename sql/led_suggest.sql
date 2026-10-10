-- LED suggestions for the hCRI Companion app (api/_core/led_lists.php).
-- Both tables are also created on first use by led_ensure_tables(), so running this is optional; it is here
-- for databases where the web user has no CREATE privilege.

-- Spectrum "fingerprints" of tagged public reports (81 points, 380-780 nm, summing to 1), built lazily.
CREATE TABLE IF NOT EXISTS spd_fingerprints (
  report_id  INT NOT NULL PRIMARY KEY,
  vec        TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- LED brand / model / CCT values people typed in the app that aren't in the curated lists yet, awaiting an admin.
CREATE TABLE IF NOT EXISTS category_requests (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  report_id  INT NULL,
  kind       VARCHAR(32)  NOT NULL,
  value      VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind_value (kind, value)
);
