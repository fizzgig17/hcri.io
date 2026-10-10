-- LED groups: each LED on a report keeps its own brand, model and CCT together.
-- Safe to run more than once. Run in phpMyAdmin (SQL tab) on the hCRI.io database.
-- The API also creates the table on first use (report_leds_ensure()), so step 1 is optional there.

-- 1. The table
CREATE TABLE IF NOT EXISTS report_leds (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  pos       TINYINT NOT NULL,
  brand     VARCHAR(255) NULL,
  model     VARCHAR(255) NULL,
  cct       VARCHAR(255) NULL,
  UNIQUE KEY uq_report_pos (report_id, pos)
);

-- 2. The seven reports that carry two LEDs (checked by hand). Only inserted if the report has no LEDs yet.
INSERT IGNORE INTO report_leds (report_id, pos, brand, model, cct) VALUES
  (70,   1, 'Nichia',             '519A',      '1800K'),
  (70,   2, 'Luminus',            'SST-20-DR', NULL),
  (607,  1, 'Nichia',             '519A',      '1800K'),
  (607,  2, 'Luminus',            'SST-20-DR', NULL),
  (219,  1, 'Nichia',             'B35AM',     '3500K'),
  (219,  2, 'Nichia',             'B35AM',     '4000K'),
  (535,  1, 'Bridgelux',          'THRIVE',    '2700K'),
  (535,  2, 'Bridgelux',          'THRIVE',    '4000K'),
  (1358, 1, 'Bridgelux',          'THRIVE',    '2700K'),
  (1358, 2, 'Bridgelux',          'THRIVE',    '4000K'),
  (1088, 1, 'Seoul Semiconductor','SUNLIKE',   '4000K'),
  (1088, 2, 'Seoul Semiconductor','SUNLIKE',   '5000K'),
  (1180, 1, 'Nichia',             '519A',      '2700K'),
  (1180, 2, 'Nichia',             '519A',      '5700K');

-- 3. Every other report: one LED from its existing brand / model / CCT tags (reports with at most one value of each).
INSERT INTO report_leds (report_id, pos, brand, model, cct)
SELECT t.report_id, 1,
       MAX(CASE WHEN t.kind = 'led_brand' THEN t.value END),
       MAX(CASE WHEN t.kind = 'led_model' THEN t.value END),
       MAX(CASE WHEN t.kind = 'led_cct'   THEN t.value END)
FROM (
  SELECT rc.report_id, rc.kind, c.value
  FROM report_categories rc
  JOIN categories c ON c.id = rc.category_id
  WHERE rc.kind IN ('led_brand', 'led_model', 'led_cct')
) t
WHERE t.report_id NOT IN (SELECT report_id FROM report_leds)
GROUP BY t.report_id
HAVING SUM(t.kind = 'led_brand') <= 1 AND SUM(t.kind = 'led_model') <= 1 AND SUM(t.kind = 'led_cct') <= 1;

-- 4. Checks (read-only). Expect: leds_total about 467; reports_with_leds = reports with LED tags (460); none left unconverted.
SELECT COUNT(*) AS leds_total, COUNT(DISTINCT report_id) AS reports_with_leds FROM report_leds;

SELECT COUNT(DISTINCT rc.report_id) AS tagged_but_unconverted
FROM report_categories rc
WHERE rc.kind IN ('led_brand', 'led_model', 'led_cct')
  AND rc.report_id NOT IN (SELECT report_id FROM report_leds);

-- The seven: every value should exist in the curated lists (expect zero rows).
SELECT l.report_id, 'brand' AS field, l.brand AS value FROM report_leds l
  WHERE l.report_id IN (70,607,219,535,1358,1088,1180) AND l.brand IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.kind = 'led_brand' AND c.value = l.brand)
UNION ALL
SELECT l.report_id, 'model', l.model FROM report_leds l
  WHERE l.report_id IN (70,607,219,535,1358,1088,1180) AND l.model IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.kind = 'led_model' AND c.value = l.model)
UNION ALL
SELECT l.report_id, 'cct', l.cct FROM report_leds l
  WHERE l.report_id IN (70,607,219,535,1358,1088,1180) AND l.cct IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.kind = 'led_cct' AND c.value = l.cct);
