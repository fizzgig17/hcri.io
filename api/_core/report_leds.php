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
const LED_KINDS_FLAT = ['led_brand', 'led_model', 'led_cct'];
const REPORT_LED_FIELDS = ['brand' => 'led_brand', 'model' => 'led_model', 'cct' => 'led_cct'];

function report_leds_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $cols = 'id        INT AUTO_INCREMENT PRIMARY KEY,
            report_id INT NOT NULL,
            pos       TINYINT NOT NULL,
            brand_id  INT NULL,
            model_id  INT NULL,
            cct_id    INT NULL,
            UNIQUE KEY uq_report_pos (report_id, pos),
            KEY idx_brand (brand_id), KEY idx_model (model_id), KEY idx_cct (cct_id)';
    // With foreign keys (a deleted report removes its LEDs; a deleted value just blanks the field), like report_categories.
    $fks = ',
            CONSTRAINT fk_rl_report FOREIGN KEY (report_id) REFERENCES reports (id) ON DELETE CASCADE,
            CONSTRAINT fk_rl_brand  FOREIGN KEY (brand_id)  REFERENCES categories (id) ON DELETE SET NULL,
            CONSTRAINT fk_rl_model  FOREIGN KEY (model_id)  REFERENCES categories (id) ON DELETE SET NULL,
            CONSTRAINT fk_rl_cct    FOREIGN KEY (cct_id)    REFERENCES categories (id) ON DELETE SET NULL';
    try {
        try { $db->exec("CREATE TABLE IF NOT EXISTS report_leds ($cols$fks)"); }
        catch (\Throwable $e) { $db->exec("CREATE TABLE IF NOT EXISTS report_leds ($cols)"); }   // engine/type mismatch: still works
    } catch (\Throwable $e) { /* no CREATE privilege: run sql/report_leds.sql */ }
}

/** The report's LEDs in order: [['brand'=>..,'led'=>..,'model'=>..,'cct'=>..], ...] (null for a blank field). Empty if none/table missing. */
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

/**
 * Brings the LED groups back in line after something wrote the flat led_* category rows directly (bulk assign, the
 * admin report edit, an older client). Never throws away pairing it can keep:
 *   - a report whose flat rows hold at most one brand, one model and one CCT becomes exactly one LED;
 *   - otherwise each existing LED keeps the values still present, and any new flat value is placed in the first LED
 *     that has that field blank, or in a new LED of its own.
 */
function report_leds_resync(PDO $db, int $reportId): void {
    report_leds_ensure($db);
    try {
        $flat = ['led_brand' => [], 'led_model' => [], 'led_cct' => []];
        $s = $db->prepare("SELECT kind, category_id FROM report_categories WHERE report_id = ? AND kind IN ('led_brand','led_model','led_cct') ORDER BY category_id");
        $s->execute([$reportId]);
        foreach ($s->fetchAll() as $r) $flat[$r['kind']][] = (int)$r['category_id'];

        $cur = $db->prepare('SELECT pos, brand_id, model_id, cct_id FROM report_leds WHERE report_id = ? ORDER BY pos');
        $cur->execute([$reportId]);
        $groups = array_map(fn($r) => ['led_brand' => $r['brand_id'] === null ? null : (int)$r['brand_id'],
                                       'led_model' => $r['model_id'] === null ? null : (int)$r['model_id'],
                                       'led_cct'   => $r['cct_id']   === null ? null : (int)$r['cct_id']], $cur->fetchAll());

        $single = count($flat['led_brand']) <= 1 && count($flat['led_model']) <= 1 && count($flat['led_cct']) <= 1;
        if ($single) {
            $new = [];
            if ($flat['led_brand'] || $flat['led_model'] || $flat['led_cct']) {
                $new[] = ['led_brand' => $flat['led_brand'][0] ?? null, 'led_model' => $flat['led_model'][0] ?? null, 'led_cct' => $flat['led_cct'][0] ?? null];
            }
        } else {
            $new = $groups;
            foreach ($flat as $kind => $ids) {
                foreach ($new as &$g) if ($g[$kind] !== null && !in_array($g[$kind], $ids, true)) $g[$kind] = null;
                unset($g);
                $used = array_filter(array_column($new, $kind), fn($v) => $v !== null);
                foreach ($ids as $id) {
                    if (in_array($id, $used, true)) continue;
                    $placed = false;
                    foreach ($new as &$g) if ($g[$kind] === null) { $g[$kind] = $id; $placed = true; break; }
                    unset($g);
                    if (!$placed) $new[] = ['led_brand' => null, 'led_model' => null, 'led_cct' => null, $kind => $id];
                }
            }
            $new = array_values(array_filter($new, fn($g) => $g['led_brand'] !== null || $g['led_model'] !== null || $g['led_cct'] !== null));
        }

        $db->prepare('DELETE FROM report_leds WHERE report_id = ?')->execute([$reportId]);
        $ins = $db->prepare('INSERT INTO report_leds (report_id, pos, brand_id, model_id, cct_id) VALUES (?, ?, ?, ?, ?)');
        foreach (array_slice($new, 0, REPORT_LED_MAX) as $i => $g) $ins->execute([$reportId, $i + 1, $g['led_brand'], $g['led_model'], $g['led_cct']]);
    } catch (\Throwable $e) { /* no groups table yet: nothing to keep in step */ }
}
