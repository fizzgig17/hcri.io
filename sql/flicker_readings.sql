-- sql/flicker_readings.sql
--
-- Flicker readings (from the hCRI Companion app, HPCS-330P class meters).
-- A reading can stand alone or be attached to one report (report_id);
-- a report can have many flicker readings.
--
-- You do NOT have to run this by hand: api/_core/flicker.php creates the
-- table the first time any flicker endpoint is used (CREATE TABLE IF NOT
-- EXISTS). It's here so the schema is documented and can be run manually.

CREATE TABLE IF NOT EXISTS flicker_readings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  report_id       INT NULL,
  label           VARCHAR(255) NOT NULL DEFAULT '',
  notes           TEXT,
  model           VARCHAR(255),
  frequency_hz    FLOAT,
  percent_flicker FLOAT,
  flicker_index   FLOAT,
  cycle_ms        FLOAT,
  span_ms         FLOAT NULL,          -- total time the waveform samples span, if known
  waveform        MEDIUMTEXT,          -- JSON array of 400 raw sample values
  settings        TEXT,                -- JSON: gear, sample rate, etc. (optional)
  captured_at     DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_flicker_user (user_id),
  INDEX idx_flicker_report (report_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
