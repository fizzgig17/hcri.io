<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';
require_once __DIR__ . '/../_core/spd.php';

cors_headers();
header('Cache-Control: no-store, no-cache, must-revalidate');
$user = require_auth();
$db   = get_db();
$m    = $_SERVER['REQUEST_METHOD'];
$id   = (int)basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (!$id) json_error('Invalid ID', 400);

function get_report(PDO $db, int $id, int $uid): array {
    $s = $db->prepare('SELECT * FROM reports WHERE id=? AND user_id=?');
    $s->execute([$id, $uid]);
    $r = $s->fetch();
    if (!$r) json_error('Report not found', 404);
    return $r;
}

function fmt(array $r, bool $spd): array {
    $meta = json_decode($r['meta'] ?? '{}', true) ?? [];

    // Backfill metrics not persisted by older uploads (same logic as the public endpoint).
    $pairs = !empty($r['spd_data']) ? json_decode($r['spd_data'], true) : null;
    if ($pairs && (empty($meta['ri']) || empty($meta['rfBins']) || empty($meta['rcsBins']) || empty($meta['instrumentMeta']) || $r['cct']===null || $r['rf']===null || $r['rg']===null || $r['duv']===null || $r['cie_x']===null || $r['cie_y']===null)) {
        try {
            if (empty($meta['instrumentMeta']) && !empty($r['file_name'])) {
                $fp = __DIR__ . '/../../uploads/' . $r['file_name'];
                if (is_file($fp) && preg_match('/\.(csv|txt|tsv)$/i', (string)$r['file_name'])) {
                    $cp = parse_csv(file_get_contents($fp));
                    $meta['instrumentMeta'] = $cp['instrument_meta'] ?? [];
                }
            }
            $wls = array_column($pairs, 0); $vals = array_column($pairs, 1);
            if ($wls && $vals) {
                $res = analyze_spd($wls, $vals, $meta['instrumentMeta'] ?? []);
                if (empty($meta['rfBins']))  $meta['rfBins']  = $res['rfBins']  ?? null;
                if (empty($meta['rcsBins'])) $meta['rcsBins'] = $res['rcsBins'] ?? [];
                if (empty($meta['rhsBins'])) $meta['rhsBins'] = $res['rhsBins'] ?? [];
                if (empty($meta['ra']))      $meta['ra']      = $res['ra']      ?? null;
                if (empty($meta['r9']))      $meta['r9']      = $res['r9']      ?? null;
                if (empty($meta['ri']))      $meta['ri']      = $res['ri']      ?? null;
                if ($r['cct']   === null && isset($res['cct'])) $r['cct']   = $res['cct'];
                if ($r['duv']   === null && isset($res['duv'])) $r['duv']   = $res['duv'];
                if ($r['cie_x'] === null && isset($res['x']))   $r['cie_x'] = $res['x'];
                if ($r['cie_y'] === null && isset($res['y']))   $r['cie_y'] = $res['y'];
                if ($r['rf']    === null && isset($res['Rf']))  $r['rf']    = $res['Rf'];
                if ($r['rg']    === null && isset($res['Rg']))  $r['rg']    = $res['Rg'];
            }
        } catch (\Throwable $e) { /* keep whatever meta already has */ }
    }

    // Robust R1-R15: stored value, else (from backfill) computed, else read straight from raw headers.
    $riOut = $meta['ri'] ?? null;
    if (empty($riOut) && !empty($meta['instrumentMeta']['raw_headers'])) {
        $rh = $meta['instrumentMeta']['raw_headers']; $tmp = [];
        for ($i = 1; $i <= 15; $i++) {
            foreach (["R$i", "r$i"] as $kk) {
                if (isset($rh[$kk]) && is_numeric($rh[$kk])) { $tmp["r$i"] = (int)round((float)$rh[$kk]); break; }
            }
        }
        if ($tmp) $riOut = $tmp;
    }

    $out = [
        'id'         => (int)$r['id'],
        'label'      => $r['label'],
        'sourceType' => $r['source_type'],
        'cct'        => $r['cct']   !== null ? (int)$r['cct']     : null,
        'duv'        => $r['duv']   !== null ? (float)$r['duv']   : null,
        'x'          => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,
        'y'          => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,
        'Rf'         => $r['rf']    !== null ? (int)$r['rf']      : null,
        'Rg'         => $r['rg']    !== null ? (int)$r['rg']      : null,
        'rfBins'     => $meta['rfBins']  ?? null,
        'rcsBins'    => $meta['rcsBins'] ?? [],
        'rhsBins'    => $meta['rhsBins'] ?? [],
        'ra'         => isset($meta['ra']) ? (float)$meta['ra'] : null,
        'r9'         => isset($meta['r9']) ? (float)$meta['r9'] : null,
        'ri'         => $riOut,
        '_riDebug'   => [
            'build'         => 'ri-fallback-2026-06-17',
            'metaRiEmpty'   => empty($meta['ri']),
            'hasRawHeaders' => !empty($meta['instrumentMeta']['raw_headers']),
            'rawHasR1'      => isset($meta['instrumentMeta']['raw_headers']['R1']) || isset($meta['instrumentMeta']['raw_headers']['r1']),
            'riOutCount'    => is_array($riOut) ? count($riOut) : 0,
        ],
        'instrumentModel'   => $meta['instrumentMeta']['instrument_model']   ?? null,
        'instrumentVersion' => $meta['instrumentMeta']['instrument_version'] ?? null,
        'rawHeaders'        => $meta['instrumentMeta']['raw_headers']        ?? null,



        'notes'        => $r['notes']        ?? null,
        'shareToken'   => $r['share_token']  ?? null,
        'isPublic'     => !empty($r['is_public']),
        'createdAt'    => $r['created_at'],
    ];
    if ($spd && !empty($r['spd_data'])) {
        $pairs2      = json_decode($r['spd_data'], true);
        $out['wls']  = array_column($pairs2, 0);
        $out['vals'] = array_column($pairs2, 1);
    }
    return $out;
}

if ($m === 'GET')    json_out(fmt(get_report($db,$id,$user['id']), true));

if ($m === 'DELETE') {
    $r = get_report($db, $id, $user['id']);
    $db->prepare('DELETE FROM reports WHERE id=?')->execute([$id]);
    if (!empty($r['file_name'])) @unlink(__DIR__ . '/../../uploads/' . $r['file_name']);
    json_out(['ok' => true]);
}

if ($m === 'PATCH') {
    $label = trim(body()['label'] ?? '');
    if (!$label) json_error("'label' required");
    get_report($db, $id, $user['id']); // ownership check
    $db->prepare('UPDATE reports SET label=? WHERE id=?')->execute([$label, $id]);
    json_out(['ok' => true]);
}

json_error('Method not allowed', 405);
