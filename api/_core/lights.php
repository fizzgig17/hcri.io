<?php
// api/_core/lights.php -- "lights": group several of a user's readings (reports) under one light. Many-to-many: a report can be in
// several lights, and is added after the fact. Deleting a light never deletes readings.
declare(strict_types=1);

require_once __DIR__ . '/public_id.php';

const LIGHT_METRICS = ['cct', 'duv', 'ra', 'r9', 'rf', 'rg', 'lux'];

function lights_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $db->exec("CREATE TABLE IF NOT EXISTS lights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(160) NOT NULL,
        brand VARCHAR(120) NOT NULL DEFAULT '',
        model VARCHAR(120) NOT NULL DEFAULT '',
        led_brand VARCHAR(120) NOT NULL DEFAULT '',
        led_model VARCHAR(120) NOT NULL DEFAULT '',
        optic VARCHAR(120) NOT NULL DEFAULT '',
        notes TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lights_user (user_id)
    )");
    $db->exec("CREATE TABLE IF NOT EXISTS light_reports (
        light_id INT NOT NULL,
        report_id INT NOT NULL,
        label VARCHAR(80) NOT NULL DEFAULT '',
        added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (light_id, report_id),
        INDEX idx_lr_report (report_id)
    )");
    foreach (['led_brand', 'led_model', 'optic'] as $col) {   // lights table made before these existed
        if (!$db->query("SHOW COLUMNS FROM lights LIKE '$col'")->fetch()) $db->exec("ALTER TABLE lights ADD COLUMN $col VARCHAR(120) NOT NULL DEFAULT '' AFTER model");
    }
    $done = true;
}

function lights_owned(PDO $db, int $uid, int $id): ?array {
    $s = $db->prepare('SELECT * FROM lights WHERE id=? AND user_id=?');
    $s->execute([$id, $uid]);
    return $s->fetch() ?: null;
}

function lights_clean(array $b, array $old = []): array {
    $pick = function (string $k, int $max) use ($b, $old) {
        $v = array_key_exists($k, $b) ? trim((string)$b[$k]) : (string)($old[$k] ?? '');
        return mb_substr($v, 0, $max);
    };
    return ['name' => $pick('name', 160), 'brand' => $pick('brand', 120), 'model' => $pick('model', 120), 'led_brand' => $pick('led_brand', 120),
            'led_model' => $pick('led_model', 120), 'optic' => $pick('optic', 120), 'notes' => $pick('notes', 4000)];
}

/** One reading's numbers, as the light cards show them. */
function lights_reading(array $r, bool $withSpd): array {
    $meta = json_decode($r['meta'] ?: '{}', true) ?? [];
    $num = fn($v) => $v === null || $v === '' ? null : (float)$v;
    $out = [
        'id'        => hcri_pid(get_db(), (int)$r['id']),
        'label'     => $r['label'],
        'linkLabel' => $r['link_label'] ?? '',
        'isPublic'  => !empty($r['is_public']),
        'createdAt' => $r['created_at'],
        'cct' => $num($r['cct']), 'duv' => $num($r['duv']),
        'ra'  => $num($meta['ra'] ?? null), 'r9' => $num($meta['r9'] ?? null),
        'rf'  => $num($r['rf']), 'rg' => $num($r['rg']),
        'lux' => $num($meta['lux'] ?? null),
    ];
    if ($withSpd && !empty($r['spd_data'])) {
        $pairs = json_decode($r['spd_data'], true) ?: [];
        $step = max(1, (int)ceil(count($pairs) / 120));   // thin the spectrum for the overlay chart
        $mx = 0.0; foreach ($pairs as $p) $mx = max($mx, (float)$p[1]);
        $pts = [];
        for ($i = 0; $i < count($pairs); $i += $step) $pts[] = [round((float)$pairs[$i][0], 1), $mx > 0 ? round((float)$pairs[$i][1] / $mx, 4) : 0];
        $out['spd'] = $pts;
    }
    return $out;
}

/** Per-metric summary: latest value, min/max range, change since first reading, median. */
function lights_stats(array $readings): array {
    $st = [];
    foreach (LIGHT_METRICS as $m) {
        $vals = []; foreach ($readings as $r) if ($r[$m] !== null) $vals[] = $r[$m];
        if (!$vals) { $st[$m] = null; continue; }
        $sorted = $vals; sort($sorted);
        $n = count($sorted);
        $median = $n % 2 ? $sorted[intdiv($n, 2)] : ($sorted[$n / 2 - 1] + $sorted[$n / 2]) / 2;
        $st[$m] = ['latest' => end($vals), 'first' => $vals[0], 'min' => min($vals), 'max' => max($vals), 'median' => $median,
                   'change' => end($vals) - $vals[0], 'n' => $n];
    }
    return $st;
}

function lights_readings(PDO $db, int $lightId, bool $withSpd, bool $publicOnly = false): array {
    $cols = 'r.is_public,r.id,r.label,r.cct,r.duv,r.rf,r.rg,r.meta,r.created_at,lr.label AS link_label' . ($withSpd ? ',r.spd_data' : '');
    $s = $db->prepare("SELECT $cols FROM light_reports lr JOIN reports r ON r.id=lr.report_id WHERE lr.light_id=?" . ($publicOnly ? ' AND r.is_public=1' : '') . ' ORDER BY r.created_at ASC, r.id ASC');
    $s->execute([$lightId]);
    return array_map(fn($r) => lights_reading($r, $withSpd), $s->fetchAll());
}

function lights_summary(PDO $db, array $l, bool $detail, bool $publicOnly = false): array {
    $readings = lights_readings($db, (int)$l['id'], $detail, $publicOnly);
    $out = [
        'id' => (int)$l['id'], 'name' => $l['name'], 'brand' => $l['brand'], 'model' => $l['model'], 'ledBrand' => $l['led_brand'] ?? '', 'ledModel' => $l['led_model'] ?? '', 'optic' => $l['optic'] ?? '',
        'notes' => $l['notes'] ?? '',
        // A light is public only while at least one of its readings is public; the public view shows only those readings.
        'isPublic' => (bool)array_filter($readings, fn($r) => $r['isPublic']),
        'createdAt' => $l['created_at'], 'count' => count($readings),
        'latest' => $readings ? end($readings) : null,
        'stats' => lights_stats($readings),
        'series' => [],
    ];
    foreach (LIGHT_METRICS as $m) $out['series'][$m] = array_map(fn($r) => $r[$m], $readings);
    if ($detail) $out['readings'] = $readings;
    else foreach ($out['latest'] ? [0] : [] as $_) { unset($out['latest']['spd']); }
    return $out;
}

/**
 * Suggest a name (and brand / model) for a light made from these reports: light brand, light model, then LED brand, LED model and
 * CCT, dropping anything else a report title carries after them ("... - Turbo", "after 10 min"). The most common title among the
 * reports wins; reports without categories fall back to the part of the report titles they all share.
 */
function lights_suggest(PDO $db, int $uid, array $ids): array {
    $ids = array_values(array_unique(array_map('intval', $ids)));
    if (!$ids) return ['name' => '', 'brand' => '', 'model' => '', 'ledBrand' => '', 'ledModel' => '', 'optic' => ''];
    require_once __DIR__ . '/categories.php';
    $in = implode(',', array_fill(0, count($ids), '?'));
    $q = $db->prepare("SELECT id,label FROM reports WHERE user_id=? AND id IN ($in)");
    $q->execute([$uid, ...$ids]);
    $rows = $q->fetchAll();
    $titles = []; $parts = []; $labels = [];
    foreach ($rows as $r) {
        $c = report_categories_map($db, (int)$r['id']);
        $v = fn($k) => implode('/', array_map(fn($x) => $x['value'], $c[$k] ?? []));
        $lb = $v('light_brand'); $lm = $v('light_model');
        $led = trim(implode(' ', array_filter([$v('led_brand'), $v('led_model')])));
        $cct = $v('led_cct');
        if ($cct !== '' && !preg_match('/k\s*$/i', $cct)) $cct .= 'K';
        $t = trim(implode(' ', array_filter([$lb, $lm])));
        $l2 = trim(implode(' ', array_filter([$led, $cct])));
        $title = trim($t . ($t !== '' && $l2 !== '' ? ' · ' : '') . $l2);
        if ($title !== '') { $titles[] = $title; $parts[$title] = ['brand' => $lb, 'model' => $lm, 'ledBrand' => $v('led_brand'), 'ledModel' => $v('led_model'), 'optic' => $v('optic')]; }
        $labels[] = (string)$r['label'];
    }
    // The report titles are what the user actually wrote, so they lead: the part every title shares, cut back to a whole word, with
    // the differing tail ("- M1", "- Turbo", "after 10 min") dropped. Category values are only used when they agree with it.
    $pre = $labels ? $labels[0] : '';
    foreach ($labels as $l) { while ($pre !== '' && stripos($l, $pre) !== 0) $pre = mb_substr($pre, 0, -1); }
    $isSep = fn($c) => $c === '' || preg_match('/[\s\-–—_:,.()\/|]/u', $c);
    foreach ($labels as $l) {   // do not stop in the middle of a word
        while ($pre !== '' && mb_strlen($l) > mb_strlen($pre) && !$isSep(mb_substr($l, mb_strlen($pre), 1)) && !$isSep(mb_substr($pre, -1))) $pre = mb_substr($pre, 0, -1);
    }
    $pre = trim($pre, " \t-–—_:,.(|/");
    if (count($labels) === 1 || mb_strlen($pre) < 3) $pre = $labels ? trim(preg_replace('/\s*[-–—(|].*$/u', '', $labels[0]) ?? $labels[0], " \t") : '';

    if ($titles) {
        $cnt = array_count_values($titles); arsort($cnt);
        $best = (string)array_key_first($cnt);
        $b = $parts[$best]['brand']; $m = $parts[$best]['model']; $xtra = ['ledBrand' => $parts[$best]['ledBrand'], 'ledModel' => $parts[$best]['ledModel'], 'optic' => $parts[$best]['optic']];
        $agrees = count($cnt) === 1 && ($b === '' || stripos($pre, $b) !== false);
        if ($pre === '') return ['name' => $best, 'brand' => $b, 'model' => $m] + $xtra;
        if ($agrees) {
            // Same light by title and by category: add the LED details the title does not already carry.
            $extra = trim(preg_replace('/^.*? · /u', '', $best, 1));
            return ['name' => $pre . (strpos($best, ' · ') !== false && stripos($pre, $extra) === false ? ' · ' . $extra : ''), 'brand' => $b, 'model' => $m] + $xtra;
        }
    }
    return ['name' => $pre, 'brand' => '', 'model' => '', 'ledBrand' => '', 'ledModel' => '', 'optic' => ''];
}
