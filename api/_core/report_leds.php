<?php
declare(strict_types=1);

// api/_core/report_leds.php
//
// A report's LEDs, stored as groups: each LED has its own brand, model (the LED) and CCT, so a light with two
// different LEDs keeps them paired. The older per-kind category rows (led_brand / led_model / led_cct) stay as the
// flattened index that Explore, filters and the annex read; report_leds_set() rebuilds them from the groups, so
// the two never disagree. The groups store category ids (not text), so renaming, normalizing or merging a value in
// the admin tools carries through on its own; report_leds_forget()/report_leds_repoint() cover delete and merge.

require_once __DIR__ . '/categories.php';

const REPORT_LED_MAX = 8;
const REPORT_LED_FIELDS = ['brand' => 'led_brand', 'model' => 'led_model', 'cct' => 'led_cct'];

function report_leds_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $db->exec('CREATE TABLE IF NOT EXISTS report_leds (
            id        INT AUTO_INCREMENT PRIMARY KEY,
            report_id INT NOT NULL,
            pos       TINYINT NOT NULL,
            brand_id  INT NULL,
            model_id  INT NULL,
            cct_id    INT NULL,
            UNIQUE KEY uq_report_pos (report_id, pos),
            KEY idx_brand (brand_id), KEY idx_model (model_id), KEY idx_cct (cct_id)
        )');
    } catch (\Throwable $e) { /* no CREATE privilege: run sql/report_leds.sql */ }
}

/** The report's LEDs in order: [['brand'=>..,'model'=>..,'cct'=>..], ...] (null for a blank field). Empty if none/table missing. */
function report_leds_get(PDO $db, int $reportId): array {
    report_leds_ensure($db);
    try {
        $s = $db->prepare('SELECT b.value AS brand, m.value AS model, c.value AS cct
                             FROM report_leds l
                             LEFT JOIN categories b ON b.id = l.brand_id
                             LEFT JOIN categories m ON m.id = l.model_id
                             LEFT JOIN categories c ON c.id = l.cct_id
                            WHERE l.report_id = ? ORDER BY l.pos');
        $s->execute([$reportId]);
        return array_map(fn($r) => ['brand' => $r['brand'], 'led' => $r['model'], 'model' => $r['model'], 'cct' => $r['cct']], $s->fetchAll());
    } catch (\Throwable $e) { return []; }
}

/**
 * Turns one typed value into the curated value, or null. A known value (any case) comes back in its list spelling.
 * An unknown one is created for admins; for everyone else it is queued for review (category_requests) and null is returned.
 * $requested collects what was queued, as "kind" => [values].
 */
function report_led_resolve(PDO $db, string $kind, string $value, array $user, int $reportId, array &$requested): ?string {
    $value = trim($value);
    if ($value === '' || mb_strlen($value) > 255) return null;
    $cat = find_category($db, $kind, $value);
    if (!$cat && !empty($user['is_admin'])) $cat = get_or_create_category($db, $kind, $value, (int)$user['id']);
    if ($cat) return (string)$cat['value'];
    try {
        $dup = $db->prepare('SELECT 1 FROM category_requests WHERE report_id = ? AND kind = ? AND LOWER(value) = LOWER(?) LIMIT 1');
        $dup->execute([$reportId, $kind, $value]);
        if (!$dup->fetch()) {
            $db->prepare('INSERT INTO category_requests (user_id, report_id, kind, value) VALUES (?, ?, ?, ?)')
               ->execute([(int)$user['id'], $reportId, $kind, $value]);
        }
    } catch (\Throwable $e) { /* table missing: not recorded */ }
    $requested[$kind][] = $value;
    return null;
}

/**
 * Replaces the report's LEDs with $leds ([['brand','led','cct'], ...]; blank LEDs are dropped, at most REPORT_LED_MAX)
 * and rebuilds the flat led_* category rows from them. Values are resolved as in report_led_resolve().
 * Returns ['leds' => [...as stored...], 'requested' => [kind => [values]]].
 */
function report_leds_set(PDO $db, int $reportId, array $user, array $leds): array {
    report_leds_ensure($db);
    $requested = [];
    $clean = [];
    foreach ($leds as $l) {
        if (!is_array($l)) continue;
        $row = [];
        foreach (REPORT_LED_FIELDS as $field => $kind) {
            // "led" is the preferred name for the model; "model" is accepted too.
            $in = $field === 'model' ? ($l['led'] ?? $l['model'] ?? '') : ($l[$field] ?? '');
            $row[$field] = report_led_resolve($db, $kind, (string)$in, $user, $reportId, $requested);
        }
        if ($row['brand'] === null && $row['model'] === null && $row['cct'] === null) continue;
        $clean[] = $row;
        if (count($clean) >= REPORT_LED_MAX) break;
    }
    $db->prepare('DELETE FROM report_leds WHERE report_id = ?')->execute([$reportId]);
    $ins = $db->prepare('INSERT INTO report_leds (report_id, pos, brand_id, model_id, cct_id) VALUES (?, ?, ?, ?, ?)');
    foreach ($clean as $i => $row) {
        $ids = [];
        foreach (REPORT_LED_FIELDS as $field => $kind) {
            $cat = $row[$field] === null ? null : find_category($db, $kind, $row[$field]);
            $ids[] = $cat ? $cat['id'] : null;
        }
        $ins->execute([$reportId, $i + 1, $ids[0], $ids[1], $ids[2]]);
    }
    // Flat category index = every distinct value used by any LED.
    foreach (REPORT_LED_FIELDS as $field => $kind) {
        $vals = array_values(array_filter(array_column($clean, $field), fn($v) => $v !== null));
        set_report_categories($db, $reportId, $kind, $vals, (int)$user['id'], false);
    }
    return ['leds' => array_map(fn($r) => ['brand' => $r['brand'], 'led' => $r['model'], 'model' => $r['model'], 'cct' => $r['cct']], $clean), 'requested' => (object)$requested];
}

const REPORT_LED_COLUMN = ['led_brand' => 'brand_id', 'led_model' => 'model_id', 'led_cct' => 'cct_id'];

/** A category value is being deleted with nothing to move it to: blank it in every LED that used it. */
function report_leds_forget(PDO $db, int $categoryId, string $kind): void {
    $col = REPORT_LED_COLUMN[$kind] ?? null;
    if (!$col) return;
    try { $db->prepare("UPDATE report_leds SET $col = NULL WHERE $col = ?")->execute([$categoryId]); } catch (\Throwable $e) { /* no table yet */ }
}

/** A category value is being merged / reassigned into another: point every LED that used it at the new one. */
function report_leds_repoint(PDO $db, int $fromId, int $toId, string $kind): void {
    $col = REPORT_LED_COLUMN[$kind] ?? null;
    if (!$col) return;
    try { $db->prepare("UPDATE report_leds SET $col = ? WHERE $col = ?")->execute([$toId, $fromId]); } catch (\Throwable $e) { /* no table yet */ }
}
