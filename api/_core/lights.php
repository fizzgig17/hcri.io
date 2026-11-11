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
    return ['name' => $pick('name', 160), 'brand' => $pick('brand', 120), 'model' => $pick('model', 120), 'notes' => $pick('notes', 4000)];
}

/** One reading's numbers, as the light cards show them. */
function lights_reading(array $r, bool $withSpd): array {
    $meta = json_decode($r['meta'] ?: '{}', true) ?? [];
    $num = fn($v) => $v === null || $v === '' ? null : (float)$v;
    $out = [
        'id'        => hcri_pid(get_db(), (int)$r['id']),
        'label'     => $r['label'],
        'linkLabel' => $r['link_label'] ?? '',
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

function lights_readings(PDO $db, int $lightId, bool $withSpd): array {
    $cols = 'r.id,r.label,r.cct,r.duv,r.rf,r.rg,r.meta,r.created_at,lr.label AS link_label' . ($withSpd ? ',r.spd_data' : '');
    $s = $db->prepare("SELECT $cols FROM light_reports lr JOIN reports r ON r.id=lr.report_id WHERE lr.light_id=? ORDER BY r.created_at ASC, r.id ASC");
    $s->execute([$lightId]);
    return array_map(fn($r) => lights_reading($r, $withSpd), $s->fetchAll());
}

function lights_summary(PDO $db, array $l, bool $detail): array {
    $readings = lights_readings($db, (int)$l['id'], $detail);
    $out = [
        'id' => (int)$l['id'], 'name' => $l['name'], 'brand' => $l['brand'], 'model' => $l['model'], 'notes' => $l['notes'] ?? '',
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
