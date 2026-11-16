<?php
// api/reports_export.php -- GET /api/reports/export : the signed-in user's readings as one CSV, one row per reading, with the
// light(s) a reading belongs to, its categories and every calculated value that is stored (recomputed from the SPD when missing).
declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_exception_handler(function ($e) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code(500);
    if (function_exists('hcri_log_exception')) hcri_log_exception($e); else error_log((string)$e);
    echo json_encode(['error' => 'Server error']);
    exit;
});
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/public_id.php';
require_once __DIR__ . '/_core/categories.php';
require_once __DIR__ . '/_core/report_leds.php';
require_once __DIR__ . '/_core/lights.php';
cors_headers();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);
$user = require_auth();
$uid  = (int)$user['id'];
$db   = get_db();
@set_time_limit(120);

// Lights each reading is in.
$lightsBy = [];
try {
    lights_ensure($db);
    $s = $db->prepare('SELECT lr.report_id, lr.label AS rlabel, l.name, l.brand, l.model, l.led_brand, l.led_model, l.optic
                         FROM light_reports lr JOIN lights l ON l.id = lr.light_id
                        WHERE l.user_id = ? ORDER BY l.name, lr.pos, lr.added_at');
    $s->execute([$uid]);
    foreach ($s->fetchAll() as $r) $lightsBy[(int)$r['report_id']][] = $r;
} catch (\Throwable $e) {}

$folders = [];
try { $s = $db->prepare('SELECT id, name FROM folders WHERE user_id=?'); $s->execute([$uid]); foreach ($s->fetchAll() as $f) $folders[(int)$f['id']] = $f['name']; } catch (\Throwable $e) {}

$kinds = category_kinds();
$head = ['Reading ID', 'Reading name', 'Date added (UTC)', 'Source', 'Public', 'Folder', 'Instrument',
         'Light', 'Light reading label', 'Light brand', 'Light model', 'Light LED brand', 'Light LED model', 'Light optic',
         'Brand (reading)', 'Model (reading)', 'LED details'];
foreach ($kinds as $k) $head[] = 'Category: ' . str_replace('_', ' ', $k);
$head[] = 'LEDs (brand / LED / CCT)'; $head[] = 'Notes';
array_push($head, 'CCT (K)', 'Duv', 'CIE x', 'CIE y', 'Ra (CRI)', 'R9', 'TM-30 Rf', 'TM-30 Rg', 'LER (lm/W)', 'LER partial');
for ($i = 1; $i <= 15; $i++) $head[] = "R$i";
for ($i = 1; $i <= 16; $i++) $head[] = "Rf hue bin $i";
for ($i = 1; $i <= 16; $i++) $head[] = "Rcs hue bin $i";
for ($i = 1; $i <= 16; $i++) $head[] = "Rhs hue bin $i";

function csvcell($v): string {
    if ($v === null) return '';
    if (is_bool($v)) return $v ? 'yes' : 'no';
    if (is_float($v)) $v = rtrim(rtrim(number_format($v, 4, '.', ''), '0'), '.');
    $v = (string)$v;
    if ($v !== '' && strpbrk($v[0], "=+-@\t\r") !== false && !is_numeric($v)) $v = "'" . $v;   // no spreadsheet formulas
    return '"' . str_replace('"', '""', $v) . '"';
}
function bins($a, int $n): array { $a = is_array($a) ? array_values($a) : []; $o = []; for ($i = 0; $i < $n; $i++) $o[] = isset($a[$i]) && is_numeric($a[$i]) ? (float)$a[$i] : null; return $o; }

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="hcri-my-readings.csv"');
echo "\xEF\xBB\xBF" . implode(',', array_map('csvcell', $head)) . "\r\n";

$st = $db->prepare('SELECT * FROM reports WHERE user_id=? ORDER BY created_at DESC');
$st->execute([$uid]);
while ($r = $st->fetch()) {
    $id   = (int)$r['id'];
    $meta = json_decode($r['meta'] ?: '{}', true) ?? [];
    $pairs = !empty($r['spd_data']) ? json_decode($r['spd_data'], true) : null;
    $cct = $r['cct']; $duv = $r['duv']; $x = $r['cie_x']; $y = $r['cie_y']; $rf = $r['rf']; $rg = $r['rg'];
    $ra = $meta['ra'] ?? null; $r9 = $meta['r9'] ?? null; $ri = $meta['ri'] ?? null;
    $rfB = $meta['rfBins'] ?? null; $rcs = $meta['rcsBins'] ?? null; $rhs = $meta['rhsBins'] ?? null;
    if (empty($ri) && !empty($meta['instrumentMeta']['raw_headers'])) {
        $tmp = []; foreach ($meta['instrumentMeta']['raw_headers'] as $kk => $vv) if (preg_match('/^[Rr](\d{1,2})$/', (string)$kk, $mm) && is_numeric($vv)) $tmp['r' . (int)$mm[1]] = (float)$vv;
        if ($tmp) $ri = $tmp;
    }
    if ($pairs && is_array($pairs) && ($cct === null || $rf === null || $rg === null || $ra === null || empty($ri) || empty($rfB) || empty($rcs) || empty($rhs))) {
        try {
            $res = analyze_spd(array_column($pairs, 0), array_column($pairs, 1), $meta['instrumentMeta'] ?? []);
            $cct = $cct ?? ($res['cct'] ?? null); $duv = $duv ?? ($res['duv'] ?? null); $x = $x ?? ($res['x'] ?? null); $y = $y ?? ($res['y'] ?? null);
            $rf = $rf ?? ($res['Rf'] ?? null); $rg = $rg ?? ($res['Rg'] ?? null); $ra = $ra ?? ($res['ra'] ?? null); $r9 = $r9 ?? ($res['r9'] ?? null);
            if (empty($ri)) $ri = $res['ri'] ?? null; if (empty($rfB)) $rfB = $res['rfBins'] ?? null; if (empty($rcs)) $rcs = $res['rcsBins'] ?? null; if (empty($rhs)) $rhs = $res['rhsBins'] ?? null;
        } catch (\Throwable $e) {}
    }
    $ler = $pairs ? spd_ler_fields($pairs) : [];
    $cats = report_categories_map($db, $id);
    $leds = array_map(fn($l) => trim(implode(' / ', array_filter([$l['brand'] ?? '', $l['led'] ?? '', $l['cct'] ?? ''], fn($s) => $s !== '' && $s !== null))), report_leds_get($db, $id));
    $L = $lightsBy[$id] ?? [];
    $j = fn(string $k) => implode(' | ', array_map(fn($l) => (string)$l[$k], $L));
    $row = [
        hcri_pid($db, $id), $r['label'], $r['created_at'], $r['source_type'], !empty($r['is_public']),
        !empty($r['folder_id']) ? ($folders[(int)$r['folder_id']] ?? '') : '', $meta['instrumentMeta']['instrument_model'] ?? '',
        $j('name'), $j('rlabel'), $j('brand'), $j('model'), $j('led_brand'), $j('led_model'), $j('optic'),
        $r['manufacturer'] ?? '', $r['model'] ?? '', $r['led_details'] ?? '',
    ];
    foreach ($kinds as $k) $row[] = implode('; ', array_map(fn($c) => $c['value'], $cats[$k] ?? []));
    $row[] = implode('; ', array_filter($leds)); $row[] = $r['notes'] ?? '';
    foreach ([$cct, $duv, $x, $y, $ra, $r9, $rf, $rg] as $v) $row[] = $v === null ? null : (float)$v;
    $row[] = $ler['ler'] ?? null; $row[] = isset($ler['lerPartial']) ? (bool)$ler['lerPartial'] : null;
    for ($i = 1; $i <= 15; $i++) { $v = is_array($ri) ? ($ri["r$i"] ?? $ri[$i - 1] ?? null) : null; $row[] = is_numeric($v) ? (float)$v : null; }
    foreach ([bins($rfB, 16), bins($rcs, 16), bins($rhs, 16)] as $b) foreach ($b as $v) $row[] = $v;
    echo implode(',', array_map('csvcell', $row)) . "\r\n";
}
