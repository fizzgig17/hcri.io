<?php
declare(strict_types=1);

// api/_core/led_lists.php
//
// Helpers for the hCRI Companion app's "what LED is this?" feature:
//   - led_lists_payload():  the LED brand / model / CCT dropdown values, plus which models go with
//                           which brand (worked out from reports that already carry both tags)
//   - led_suggest():        nearest-neighbour match of a spectrum against public, tagged reports
//   - led_save_report_details(): sets a report's LED brand/model/CCT, queueing unknown values for
//                           admin review instead of inventing new category values (only admins may)
//
// Everything degrades to "no data" if the optional tables are missing, so it can be deployed before
// the SQL in sql/led_suggest.sql has been run.

require_once __DIR__ . '/categories.php';
require_once __DIR__ . '/spd.php';

const LED_KINDS = ['led_brand', 'led_model', 'led_cct'];

/** Create the two helper tables if they don't exist yet (cheap no-op afterwards). */
function led_ensure_tables(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $db->exec('CREATE TABLE IF NOT EXISTS spd_fingerprints (
            report_id INT NOT NULL PRIMARY KEY,
            vec       TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )');
        $db->exec('CREATE TABLE IF NOT EXISTS category_requests (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT NULL,
            report_id  INT NULL,
            kind       VARCHAR(32)  NOT NULL,
            value      VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_kind_value (kind, value)
        )');
    } catch (\Throwable $e) { /* no CREATE privilege: callers cope with the tables being absent */ }
}

/** led_brand / led_model / led_cct values, brand -> models, and a version string for caching. */
function led_lists_payload(PDO $db): array {
    $all = all_categories($db, false);
    $lists = [];
    foreach (LED_KINDS as $k) {
        $lists[$k] = array_values(array_map(fn($e) => (string)$e['value'], $all[$k] ?? []));
    }
    // CCT presets read best in numeric order.
    usort($lists['led_cct'], fn($a, $b) => ((int)preg_replace('/\D+/', '', $a)) <=> ((int)preg_replace('/\D+/', '', $b)) ?: strcmp($a, $b));

    $modelsByBrand = [];
    try {
        $rows = $db->query(
            "SELECT bc.value AS brand, mc.value AS model, COUNT(*) AS n
               FROM report_categories rb
               JOIN categories bc ON bc.id = rb.category_id AND bc.kind = 'led_brand'
               JOIN report_categories rm ON rm.report_id = rb.report_id AND rm.kind = 'led_model'
               JOIN categories mc ON mc.id = rm.category_id
              WHERE rb.kind = 'led_brand'
              GROUP BY bc.value, mc.value
              ORDER BY bc.value, n DESC, mc.value"
        )->fetchAll();
        foreach ($rows as $r) $modelsByBrand[(string)$r['brand']][] = (string)$r['model'];
    } catch (\Throwable $e) { /* tables absent: lists simply have no brand->model links yet */ }

    $payload = ['lists' => $lists, 'modelsByBrand' => (object)$modelsByBrand];
    $payload['version'] = substr(md5(json_encode($payload, JSON_UNESCAPED_UNICODE)), 0, 16);
    return $payload;
}

/** 81-point (380-780 nm, 5 nm) spectrum scaled to sum to 1, or null if it has no usable signal. */
function led_fingerprint(array $wls, array $vals): ?array {
    $n = min(count($wls), count($vals));
    if ($n < 10) return null;
    $w = []; $v = [];
    for ($i = 0; $i < $n; $i++) {
        if (!is_numeric($wls[$i]) || !is_numeric($vals[$i])) continue;
        $w[] = (float)$wls[$i]; $v[] = max(0.0, (float)$vals[$i]);
    }
    if (count($w) < 10) return null;
    $order = range(0, count($w) - 1);
    usort($order, fn($a, $b) => $w[$a] <=> $w[$b]);
    $w = array_map(fn($i) => $w[$i], $order); $v = array_map(fn($i) => $v[$i], $order);
    $g = interpolate_spd($w, $v);
    $sum = array_sum($g);
    if ($sum <= 0) return null;
    return array_map(fn($x) => $x / $sum, $g);
}

/** Overlap of two unit-sum spectra, 0..1 (1 = identical shape). */
function led_overlap(array $a, array $b): float {
    $s = 0.0;
    for ($i = 0, $n = min(count($a), count($b)); $i < $n; $i++) $s += min($a[$i], $b[$i]);
    return $s;
}

/**
 * Best LED match for a spectrum from public reports that already have an LED brand AND model.
 * Returns ['suggestion' => {...}|null, 'alternatives' => [...]]. A suggestion is only returned when
 * it is clearly ahead of the other candidates; a wrong confident guess is worse than none.
 */
function led_suggest(PDO $db, array $wls, array $vals): array {
    $none = ['suggestion' => null, 'alternatives' => []];
    $fp = led_fingerprint($wls, $vals);
    if (!$fp) return $none;
    led_ensure_tables($db);

    try {
        $rows = $db->query(
            "SELECT r.id, bc.value AS brand, mc.value AS model, cc.value AS cct, r.spd_data, fp.vec
               FROM reports r
               JOIN report_categories rb ON rb.report_id = r.id AND rb.kind = 'led_brand'
               JOIN categories bc ON bc.id = rb.category_id
               JOIN report_categories rm ON rm.report_id = r.id AND rm.kind = 'led_model'
               JOIN categories mc ON mc.id = rm.category_id
               LEFT JOIN report_categories rc ON rc.report_id = r.id AND rc.kind = 'led_cct'
               LEFT JOIN categories cc ON cc.id = rc.category_id
               LEFT JOIN spd_fingerprints fp ON fp.report_id = r.id
              WHERE r.is_public = 1 AND r.spd_data IS NOT NULL"
        )->fetchAll();
    } catch (\Throwable $e) { return $none; }

    $built = 0;
    $scored = [];
    foreach ($rows as $r) {
        $vec = null;
        if (!empty($r['vec'])) {
            $vec = json_decode((string)$r['vec'], true);
        } elseif ($built < 300) {
            // Build missing fingerprints lazily, a few hundred per request, so the first calls warm the cache.
            $pairs = json_decode((string)$r['spd_data'], true);
            if (is_array($pairs) && $pairs) {
                $vec = led_fingerprint(array_column($pairs, 0), array_column($pairs, 1));
                if ($vec) {
                    try { $db->prepare('INSERT IGNORE INTO spd_fingerprints (report_id, vec) VALUES (?, ?)')->execute([(int)$r['id'], json_encode($vec)]); } catch (\Throwable $e) {}
                }
            }
            $built++;
        }
        if (!is_array($vec) || count($vec) !== count($fp)) continue;
        $scored[] = ['brand' => (string)$r['brand'], 'model' => (string)$r['model'], 'cct' => $r['cct'] !== null ? (string)$r['cct'] : null, 'score' => led_overlap($fp, $vec)];
    }
    if (!$scored) return $none;

    usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
    $top = array_slice($scored, 0, 12);

    // Group the closest matches by brand+model; weight each member sharply by how close it is.
    $groups = [];
    foreach ($top as $c) {
        $key = mb_strtolower($c['brand'] . '|' . $c['model']);
        $g =& $groups[$key];
        if (!isset($g)) $g = ['brand' => $c['brand'], 'model' => $c['model'], 'best' => 0.0, 'weight' => 0.0, 'close' => 0, 'ccts' => []];
        $g['best']    = max($g['best'], $c['score']);
        $g['weight'] += exp(60 * ($c['score'] - 1));
        if ($c['score'] >= 0.93) $g['close']++;
        if ($c['cct'] !== null) $g['ccts'][$c['cct']] = ($g['ccts'][$c['cct']] ?? 0) + 1;
        unset($g);
    }
    $total = array_sum(array_column($groups, 'weight'));
    $out = [];
    foreach ($groups as $g) {
        arsort($g['ccts']);
        $out[] = [
            'brand'      => $g['brand'],
            'model'      => $g['model'],
            'cct'        => $g['ccts'] ? (string)array_key_first($g['ccts']) : null,
            'score'      => round($g['best'], 4),
            'confidence' => $total > 0 ? round($g['weight'] / $total, 3) : 0.0,
            'support'    => $g['close'],
        ];
    }
    usort($out, fn($a, $b) => [$b['confidence'], $b['score']] <=> [$a['confidence'], $a['score']]);

    $first = $out[0];
    $confident = $first['score'] >= 0.94 && $first['confidence'] >= 0.55;
    // Alternatives are only worth showing if they are genuinely close.
    $alts = array_values(array_filter(array_slice($out, $confident ? 1 : 0, 3), fn($g) => $g['score'] >= 0.85));
    return [
        'suggestion'   => $confident ? $first : null,
        'alternatives' => $alts,
    ];
}

/**
 * Set a report's LED brand / model / CCT. Values that exist as categories are assigned. Values that don't
 * are created for admins, and queued in category_requests for everyone else (the lists stay curated).
 * $details: ['led_brand' => string, 'led_model' => string, 'led_cct' => string]; empty/absent keys are left alone.
 * Returns ['saved' => [kind => value], 'requested' => [kind => value]].
 */
function led_save_report_details(PDO $db, int $reportId, array $user, array $details): array {
    led_ensure_tables($db);
    $saved = []; $requested = [];
    $isAdmin = !empty($user['is_admin']);
    foreach (LED_KINDS as $kind) {
        $value = trim((string)($details[$kind] ?? ''));
        if ($value === '' || mb_strlen($value) > 255) continue;
        $cat = find_category($db, $kind, $value);
        if (!$cat && $isAdmin) $cat = get_or_create_category($db, $kind, $value, (int)$user['id']);
        if ($cat) {
            set_report_categories($db, $reportId, $kind, [$cat['value']], (int)$user['id'], false);
            $saved[$kind] = $cat['value'];
            continue;
        }
        try {
            $dup = $db->prepare('SELECT 1 FROM category_requests WHERE report_id = ? AND kind = ? AND LOWER(value) = LOWER(?) LIMIT 1');
            $dup->execute([$reportId, $kind, $value]);
            if (!$dup->fetch()) {
                $db->prepare('INSERT INTO category_requests (user_id, report_id, kind, value) VALUES (?, ?, ?, ?)')
                   ->execute([(int)$user['id'], $reportId, $kind, $value]);
            }
            $requested[$kind] = $value;
        } catch (\Throwable $e) { /* table missing: the value is simply not recorded */ }
    }
    return ['saved' => (object)$saved, 'requested' => (object)$requested];
}
