-- LED groups: each LED on a report keeps its own brand, model and CCT together.
-- Safe to run more than once. Run in phpMyAdmin (SQL tab) on the hCRI.io database.
-- The API also creates the table on first use (report_leds_ensure()), so step 1 is optional there.

-- 1. The table. It stores category ids, so renaming or merging a value in the admin tools carries through.
CREATE TABLE IF NOT EXISTS report_leds (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  pos       TINYINT NOT NULL,
  brand_id  INT NULL,
  model_id  INT NULL,
  cct_id    INT NULL,
  UNIQUE KEY uq_report_pos (report_id, pos),
  KEY idx_brand (brand_id), KEY idx_model (model_id), KEY idx_cct (cct_id)
);

-- 2. The seven reports that carry two LEDs (pairings checked by hand). The values are looked up by name in the curated
--    lists; a NULL means "no value" (the SST-20-DR is a deep red, so it has no CCT). INSERT IGNORE skips any that exist.
INSERT IGNORE INTO report_leds (report_id, pos, brand_id, model_id, cct_id)
SELECT v.report_id, v.pos,
       (SELECT id FROM categories WHERE kind = 'led_brand' AND value = v.brand LIMIT 1),
       (SELECT id FROM categories WHERE kind = 'led_model' AND value = v.model LIMIT 1),
       (SELECT id FROM categories WHERE kind = 'led_cct'   AND value = v.cct   LIMIT 1)
FROM (
  SELECT  70 AS report_id, 1 AS pos, 'Nichia' AS brand, '519A' AS model, '1800K' AS cct
  UNION ALL SELECT  70, 2, 'Luminus',             'SST-20-DR', NULL
  UNION ALL SELECT 607, 1, 'Nichia',              '519A',      '1800K'
  UNION ALL SELECT 607, 2, 'Luminus',             'SST-20-DR', NULL
  UNION ALL SELECT 219, 1, 'Nichia',              'B35AM',     '3500K'
  UNION ALL SELECT 219, 2, 'Nichia',              'B35AM',     '4000K'
  UNION ALL SELECT 535, 1, 'Bridgelux',           'THRIVE',    '2700K'
  UNION ALL SELECT 535, 2, 'Bridgelux',           'THRIVE',    '4000K'
  UNION ALL SELECT 1358, 1, 'Bridgelux',          'THRIVE',    '2700K'
  UNION ALL SELECT 1358, 2, 'Bridgelux',          'THRIVE',    '4000K'
  UNION ALL SELECT 1088, 1, 'Seoul Semiconductor','SUNLIKE',   '4000K'
  UNION ALL SELECT 1088, 2, 'Seoul Semiconductor','SUNLIKE',   '5000K'
  UNION ALL SELECT 1180, 1, 'Nichia',             '519A',      '2700K'
  UNION ALL SELECT 1180, 2, 'Nichia',             '519A',      '5700K'
) v;

-- 3. Every other report: one LED from its existing brand / model / CCT tags (reports with at most one value of each).
INSERT INTO report_leds (report_id, pos, brand_id, model_id, cct_id)
SELECT t.report_id, 1,
       MAX(CASE WHEN t.kind = 'led_brand' THEN t.category_id END),
       MAX(CASE WHEN t.kind = 'led_model' THEN t.category_id END),
       MAX(CASE WHEN t.kind = 'led_cct'   THEN t.category_id END)
FROM report_categories t
WHERE t.kind IN ('led_brand', 'led_model', 'led_cct')
  AND t.report_id NOT IN (SELECT report_id FROM report_leds)
GROUP BY t.report_id
HAVING SUM(t.kind = 'led_brand') <= 1 AND SUM(t.kind = 'led_model') <= 1 AND SUM(t.kind = 'led_cct') <= 1;

-- 4. Checks (read-only).
-- Expect leds_total 467 (453 single-LED reports + 14 for the seven) and reports_with_leds 460.
SELECT COUNT(*) AS leds_total, COUNT(DISTINCT report_id) AS reports_with_leds FROM report_leds;

-- Expect 0: every tagged report now has LEDs.
SELECT COUNT(DISTINCT rc.report_id) AS tagged_but_unconverted
FROM report_categories rc
WHERE rc.kind IN ('led_brand', 'led_model', 'led_cct')
  AND rc.report_id NOT IN (SELECT report_id FROM report_leds);

-- Expect 14 rows and no NULL brand/model on the seven (cct is NULL only on the two SST-20-DR rows).
SELECT l.report_id, l.pos, b.value AS brand, m.value AS model, c.value AS cct
FROM report_leds l
LEFT JOIN categories b ON b.id = l.brand_id
LEFT JOIN categories m ON m.id = l.model_id
LEFT JOIN categories c ON c.id = l.cct_id
WHERE l.report_id IN (70, 607, 219, 535, 1358, 1088, 1180)
ORDER BY l.report_id, l.pos;
