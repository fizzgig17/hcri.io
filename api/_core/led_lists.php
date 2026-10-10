<?php
declare(strict_types=1);

// api/_core/led_lists.php
//
// Helpers for the hCRI Companion app's "what LED is this?" feature:
//   - led_lists_payload():  the LED brand / model / CCT dropdown values, plus which models go with
//                           which brand (worked out from reports that already carry both tags)
//   - led_suggest():        nearest-neighbour match of a spectrum against ALL tagged reports (private ones
//                           included, since they make the match better), returning only brand/model/CCT text
//   - led_save_report_details(): sets a report's LED brand/model/CCT, queueing unknown values for
//                           admin review instead of inventing new category values (only admins may)
//
// Everything degrades to "no data" if the optional tables are missing, so it can be deployed before
// the SQL in sql/led_suggest.sql has been run.

require_once __DIR__ . '/categories.php';
require_once __DIR__ . '/report_leds.php';
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
        // Real pairs first: each LED group carries its own brand and model.
        report_leds_ensure($db);
        $rows = $db->query(
            "SELECT brand, model, COUNT(*) AS n FROM report_leds
              WHERE brand IS NOT NULL AND model IS NOT NULL
              GROUP BY brand, model ORDER BY brand, n DESC, model"
        )->fetchAll();
        foreach ($rows as $r) $modelsByBrand[(string)$r['brand']][] = (string)$r['model'];
    } catch (\Throwable $e) { /* table absent */ }
    if (!$modelsByBrand) try {
        // Before the LED groups exist: infer from reports with exactly one brand and one model, so a multi-LED
        // light can't pair one LED's brand with the other's model.
        $rows = $db->query(
            "SELECT bc.value AS brand, mc.value AS model, COUNT(*) AS n
               FROM report_categories rb
               JOIN categories bc ON bc.id = rb.category_id AND bc.kind = 'led_brand'
               JOIN report_categories rm ON rm.report_id = rb.report_id AND rm.kind = 'led_model'
               JOIN categories mc ON mc.id = rm.category_id
              WHERE rb.kind = 'led_brand'
                AND rb.report_id IN (
                      SELECT report_id FROM report_categories WHERE kind IN ('led_brand', 'led_model')
                      GROUP BY report_id HAVING SUM(kind = 'led_brand') = 1 AND SUM(kind = 'led_model') = 1)
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
 * Nominal CCT for a measured spectrum: the nearest value in the site's LED CCT list (within 7%). Checked on the
 * CC-BY "Real Light Source SPDs" data (Esposito & Houser): the measured CCT rounds to the part's nominal bin
 * for 92% of Cree/Seoul emitters, better than matching curves (64%), so this needs no reference spectra.
 */
function led_cct_guess(PDO $db, array $wls, array $vals): ?string {
    try {
        require_once __DIR__ . '/spd.php';
        $n = min(count($wls), count($vals));
        if ($n < 10) return null;
        $w = []; $v = [];
        for ($i = 0; $i < $n; $i++) if (is_numeric($wls[$i]) && is_numeric($vals[$i])) { $w[] = (float)$wls[$i]; $v[] = max(0.0, (float)$vals[$i]); }
        if (count($w) < 10 || array_sum($v) <= 0) return null;
        $cct = calc_cct_duv_hires($w, $v)['cct'];
        $best = null; $bestD = INF;
        foreach (led_lists_payload($db)['lists']['led_cct'] as $val) {
            $num = (float)preg_replace('/[^0-9.]/', '', (string)$val);
            if ($num < 1000) continue;
            $d = abs($num - $cct);
            if ($d < $bestD) { $bestD = $d; $best = ['val' => (string)$val, 'num' => $num]; }
        }
        return ($best && $bestD / $best['num'] <= 0.07) ? $best['val'] : null;
    } catch (\Throwable $e) { return null; }
}

/** led_match() plus `cctGuess` (always available from the spectrum alone), also used to fill a missing CCT. */
function led_suggest(PDO $db, array $wls, array $vals, int $requesterId = 0, string $title = ''): array {
    $out = led_match($db, $wls, $vals, $requesterId, $title);
    $out['cctGuess'] = led_cct_guess($db, $wls, $vals);
    if (!empty($out['suggestion']) && empty($out['suggestion']['cct']) && $out['cctGuess']) $out['suggestion']['cct'] = $out['cctGuess'];
    return $out;
}

/**
 * Best LED match for a spectrum from every report that already has an LED brand AND model, public or private.
 * Returns ['suggestion' => {...}|null, 'alternatives' => [...]]. A suggestion is only returned when
 * it is clearly ahead of the other candidates; a wrong confident guess is worse than none.
 *
 * Privacy: nothing about any report leaves this function, only the winning brand / model / CCT strings
 * (values from the curated, public category lists) and aggregate numbers. A group of matches that rests only
 * on private reports from a SINGLE other person is never returned, so a suggestion can't point at one
 * identifiable owner's light. The requester's own reports always count.
 */
function led_title_has(string $title, string $value): bool {
    $parts = preg_split('/[^A-Za-z0-9]+/', trim($value), -1, PREG_SPLIT_NO_EMPTY);
    if (!$parts || strlen(implode('', $parts)) < 3) return false;   // too short to be a reliable name
    $re = '/(?<![A-Za-z0-9])' . implode('[^A-Za-z0-9]*', array_map(fn($x) => preg_quote($x, '/'), $parts)) . '(?![A-Za-z0-9])/i';
    return (bool)preg_match($re, $title);
}

function led_match(PDO $db, array $wls, array $vals, int $requesterId = 0, string $title = ''): array {
    $none = ['suggestion' => null, 'alternatives' => []];
    $fp = led_fingerprint($wls, $vals);
    if (!$fp) return $none;
    led_ensure_tables($db);

    try {
        $rows = $db->query(
            "SELECT r.id, r.user_id, r.is_public, bc.value AS brand, mc.value AS model, cc.value AS cct, r.spd_data, fp.vec
               FROM reports r
               JOIN report_categories rb ON rb.report_id = r.id AND rb.kind = 'led_brand'
               JOIN categories bc ON bc.id = rb.category_id
               JOIN report_categories rm ON rm.report_id = r.id AND rm.kind = 'led_model'
               JOIN categories mc ON mc.id = rm.category_id
               LEFT JOIN report_categories rc ON rc.report_id = r.id AND rc.kind = 'led_cct'
               LEFT JOIN categories cc ON cc.id = rc.category_id
               LEFT JOIN spd_fingerprints fp ON fp.report_id = r.id
              WHERE r.spd_data IS NOT NULL"
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
        $scored[] = [
            'brand' => (string)$r['brand'], 'model' => (string)$r['model'],
            'cct'   => $r['cct'] !== null ? (string)$r['cct'] : null,
            'score' => led_overlap($fp, $vec),
            'owner' => $r['user_id'] !== null ? (int)$r['user_id'] : 0,
            'pub'   => !empty($r['is_public']),
        ];
    }
    if (!$scored) return $none;

    usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
    $top = array_slice($scored, 0, 12);

    // Group the closest matches by brand+model; weight each member sharply by how close it is.
    $groups = [];
    foreach ($top as $c) {
        $key = mb_strtolower($c['brand'] . '|' . $c['model']);
        $g =& $groups[$key];
        if (!isset($g)) $g = ['brand' => $c['brand'], 'model' => $c['model'], 'best' => 0.0, 'weight' => 0.0, 'close' => 0, 'ccts' => [], 'owners' => [], 'public' => false, 'own' => false];
        $g['best']    = max($g['best'], $c['score']);
        $g['weight'] += exp(60 * ($c['score'] - 1));
        if ($c['score'] >= 0.93) {
            $g['close']++;
            $g['owners'][$c['owner']] = true;
            if ($c['pub']) $g['public'] = true;
            if ($requesterId > 0 && $c['owner'] === $requesterId) $g['own'] = true;
        }
        if ($c['cct'] !== null) $g['ccts'][$c['cct']] = ($g['ccts'][$c['cct']] ?? 0) + 1;
        unset($g);
    }
    // The reading's own title can settle a near-tie: a group whose model (or just brand) is named in it counts more.
    $title = trim($title);
    if ($title !== '') {
        foreach ($groups as &$g) {
            if (led_title_has($title, $g['model']))      $g['weight'] *= 3;
            elseif (led_title_has($title, $g['brand']))  $g['weight'] *= 1.5;
        }
        unset($g);
    }
    $total = array_sum(array_column($groups, 'weight'));
    $out = [];
    foreach ($groups as $g) {
        // Only report a group that doesn't rest solely on one other person's private reports.
        // (Still counted in $total above, so a strong private competitor lowers confidence instead of vanishing.)
        if (!($g['own'] || $g['public'] || count($g['owners']) >= 2)) continue;
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
    $titleFallback = $title !== '' ? led_title_fallback($scored, $title, $requesterId) : null;
    if (!$out) return $titleFallback ? ['suggestion' => $titleFallback, 'alternatives' => []] : $none;
    usort($out, fn($a, $b) => [$b['confidence'], $b['score']] <=> [$a['confidence'], $a['score']]);

    $first = $out[0];
    $confident = $first['score'] >= 0.94 && $first['confidence'] >= 0.55;
    if ($confident) $out[0]['source'] = 'spectrum';
    $first = $out[0];
    // Alternatives are only worth showing if they are genuinely close.
    $alts = array_values(array_filter(array_slice($out, $confident ? 1 : 0, 3), fn($g) => $g['score'] >= 0.85));
    return [
        'suggestion'   => $confident ? $first : $titleFallback,
        'alternatives' => $alts,
    ];
}

/**
 * Lower-confidence suggestion from the reading's title: the title names an LED model that already exists in
 * tagged reports, and the spectrum is at least in the same neighbourhood as them (so a wrong title can't
 * override a clearly different curve). Same single-owner safeguard as the spectrum match.
 */
function led_title_fallback(array $scored, string $title, int $requesterId): ?array {
    $groups = [];
    foreach ($scored as $c) {
        if ($c['score'] < 0.85 || !led_title_has($title, $c['model'])) continue;
        $key = mb_strtolower($c['brand'] . '|' . $c['model']);
        $g =& $groups[$key];
        if (!isset($g)) $g = ['brand' => $c['brand'], 'model' => $c['model'], 'best' => 0.0, 'ccts' => [], 'owners' => [], 'public' => false, 'own' => false];
        $g['best'] = max($g['best'], $c['score']);
        $g['owners'][$c['owner']] = true;
        if ($c['pub']) $g['public'] = true;
        if ($requesterId > 0 && $c['owner'] === $requesterId) $g['own'] = true;
        if ($c['cct'] !== null) $g['ccts'][$c['cct']] = ($g['ccts'][$c['cct']] ?? 0) + 1;
        unset($g);
    }
    $groups = array_filter($groups, fn($g) => $g['own'] || $g['public'] || count($g['owners']) >= 2);
    if (!$groups) return null;
    usort($groups, fn($a, $b) => $b['best'] <=> $a['best']);
    $g = $groups[0];
    arsort($g['ccts']);
    return [
        'brand' => $g['brand'], 'model' => $g['model'],
        'cct' => $g['ccts'] ? (string)array_key_first($g['ccts']) : null,
        'score' => round($g['best'], 4), 'confidence' => 0.0, 'support' => 0, 'source' => 'title',
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
    // LED kinds always; plus any other report category kind the caller passes (light_brand, light_model, optic, lumens, current).
    $kinds = array_values(array_unique(array_merge(LED_KINDS, array_filter(array_keys($details), 'is_category_kind'))));
    foreach ($kinds as $kind) {
        $value = trim((string)($details[$kind] ?? ''));
        if ($value === '' || mb_strlen($value) > 255) continue;
        $cat = find_category($db, $kind, $value);
        // Free-form numeric kinds (lumens, current) are created on the fly for everyone, as in /api/categories/assign.
        $free = in_array($kind, ['lumens', 'current'], true);
        if (!$cat && ($isAdmin || $free)) $cat = get_or_create_category($db, $kind, $value, (int)$user['id']);
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
