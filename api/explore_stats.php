<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';

cors_headers();
header('Cache-Control: public, max-age=60');

$db = get_db();

function bin_counts(array $vals, array $edges, array $labels): array {
    $n = count($labels);
    $counts = array_fill(0, $n, 0);
    foreach ($vals as $v) {
        if ($v === null) continue;
        for ($i = 0; $i < $n; $i++) {
            if ($v >= $edges[$i] && $v < $edges[$i + 1]) { $counts[$i]++; break; }
        }
    }
    $out = [];
    for ($i = 0; $i < $n; $i++) $out[] = ['label' => $labels[$i], 'count' => $counts[$i]];
    return $out;
}

function top_cat(PDO $db, string $kind, int $limit = 8): array {
    try {
        $s = $db->prepare(
            "SELECT c.value AS v, COUNT(*) AS cnt
               FROM report_categories rc
               JOIN categories c ON c.id = rc.category_id
               JOIN reports r ON r.id = rc.report_id
              WHERE rc.kind = ? AND r.is_public = 1
              GROUP BY c.value
              ORDER BY cnt DESC, c.value ASC
              LIMIT " . (int)$limit
        );
        $s->execute([$kind]);
        return array_map(fn($x) => ['label' => $x['v'], 'count' => (int)$x['cnt']], $s->fetchAll());
    } catch (\Throwable $e) {
        return [];
    }
}

// ── Pull the numeric fields for all public reports ───────────────────────────
$rows = $db->query("SELECT cct, duv, meta FROM reports WHERE is_public = 1")->fetchAll();

$ccts = $duvs = $ras = $r9s = [];
foreach ($rows as $r) {
    if ($r['cct'] !== null) $ccts[] = (float)$r['cct'];
    if ($r['duv'] !== null) $duvs[] = (float)$r['duv'];
    $m = json_decode($r['meta'] ?: '{}', true) ?: [];
    if (isset($m['ra'])) $ras[] = (float)$m['ra'];
    if (isset($m['r9'])) $r9s[] = (float)$m['r9'];
}
$count = count($rows);

$avgRa      = $ras  ? (int)round(array_sum($ras) / count($ras))             : null;
$avgCct     = $ccts ? (int)(round(array_sum($ccts) / count($ccts) / 50) * 50) : null;
$highCriPct = $ras  ? (int)round(count(array_filter($ras, fn($x) => $x >= 90)) / count($ras) * 100) : 0;

// ── Votes total (graceful if table absent) ───────────────────────────────────
$votes = 0;
try {
    $votes = (int)$db->query(
        "SELECT COUNT(*) FROM report_votes v JOIN reports r ON r.id = v.report_id WHERE r.is_public = 1"
    )->fetchColumn();
} catch (\Throwable $e) {}

// ── Reports added per month (last 12 months) ─────────────────────────────────
$labels = $counts = []; $idx = [];
$base = new DateTime('first day of this month');
for ($i = 11; $i >= 0; $i--) {
    $d = (clone $base)->modify("-$i months");
    $idx[$d->format('Y-m')] = count($counts);
    $labels[] = $d->format('M');
    $counts[] = 0;
}
try {
    foreach ($db->query("SELECT DATE_FORMAT(created_at,'%Y-%m') AS ym, COUNT(*) AS c FROM reports WHERE is_public = 1 GROUP BY ym")->fetchAll() as $rt) {
        if (isset($idx[$rt['ym']])) $counts[$idx[$rt['ym']]] = (int)$rt['c'];
    }
} catch (\Throwable $e) {}

json_out([
    'count'       => $count,
    'avgRa'       => $avgRa,
    'avgCct'      => $avgCct,
    'highCriPct'  => $highCriPct,
    'votes'       => $votes,
    'cct' => bin_counts($ccts,
        [0, 3000, 3500, 4000, 4500, 5000, 5700, 6500, PHP_FLOAT_MAX],
        ['<3000', '3000–3499', '3500–3999', '4000–4499', '4500–4999', '5000–5699', '5700–6499', '6500+']),
    'ra' => bin_counts($ras,
        [0, 85, 90, 93, 96, 1000],
        ['<85', '85–89', '90–92', '93–95', '96+']),
    'r9' => bin_counts($r9s,
        [-1000, 50, 70, 85, 95, 1000],
        ['<50', '50–69', '70–84', '85–94', '95+']),
    'duv' => bin_counts($duvs,
        [-1, -0.006, -0.003, 0, 0.003, 1],
        ['≤-6', '-6…-3', '-3…0', '0…+3', '+3+']),
    'ledModels'   => top_cat($db, 'led_model'),
    'lightBrands' => top_cat($db, 'light_brand'),
    'overTime'    => ['labels' => $labels, 'counts' => $counts],
]);