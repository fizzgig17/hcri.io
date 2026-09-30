<?php
// api/shared.php

declare(strict_types=1);

require_once __DIR__ . '/_core/response.php';

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/categories.php';
require_once __DIR__ . '/_core/spd.php';



cors_headers();



if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);



// Extract token from URL: /api/shared/{token}

preg_match('#/api/shared/([a-zA-Z0-9_-]+)$#', $_SERVER['REQUEST_URI'], $m);

$token = $m[1] ?? '';

if (!$token) json_error('Invalid token', 400);



$db = get_db();

$s  = $db->prepare('SELECT * FROM reports WHERE share_token = ?');

$s->execute([$token]);

$r = $s->fetch();

if (!$r) json_error('Report not found or sharing disabled', 404);



$meta   = json_decode($r['meta'] ?: '{}', true) ?? [];
spd_recompute($r, $meta);

// Backfill metrics not persisted by older uploads, so public reports match private.
$pairs = !empty($r['spd_data']) ? json_decode($r['spd_data'], true) : null;
if ($pairs && (empty($meta['ri']) || empty($meta['rfBins']) || empty($meta['rcsBins']) || empty($meta['instrumentMeta']) || $r['cct']===null || $r['rf']===null || $r['rg']===null || $r['duv']===null || $r['cie_x']===null || $r['cie_y']===null)) {
    try {
        if (empty($meta['instrumentMeta']) && !empty($r['file_name'])) {
            $fp = __DIR__ . '/../uploads/' . $r['file_name'];
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

$rfBins = $meta['rfBins'] ?? null;



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

    'id'           => (int)$r['id'],

    'label'        => $r['label'],

    'sourceType'   => $r['source_type'],

    'cct'          => $r['cct']   !== null ? (int)$r['cct']     : null,

    'duv'          => $r['duv']   !== null ? (float)$r['duv']   : null,

    'x'            => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,

    'y'            => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,

    'Rf'           => $r['rf']    !== null ? (int)$r['rf']      : null,

    'Rg'           => $r['rg']    !== null ? (int)$r['rg']      : null,

    'rfBins'       => $rfBins,
    'rcsBins'      => $meta['rcsBins'] ?? [],
    'rhsBins'      => $meta['rhsBins'] ?? [],

    'ra'              => isset($meta['ra']) ? (float)$meta['ra'] : null,

    'r9'              => isset($meta['r9']) ? (float)$meta['r9'] : null,

    'ri'              => $riOut,

    'instrumentModel'  => $meta['instrumentMeta']['instrument_model']   ?? null,

    'instrumentVersion'=> $meta['instrumentMeta']['instrument_version'] ?? null,

    'rawHeaders'       => $meta['instrumentMeta']['raw_headers']        ?? null,







    'notes'        => $r['notes']        ?? null,

    'createdAt'    => $r['created_at'],

    'shareToken'   => $r['share_token'],
    'isPublic'     => !empty($r['is_public']),

];



if (!empty($r['spd_data'])) {

    $pairs     = json_decode($r['spd_data'], true);

    $out['wls']  = is_array($pairs) ? array_column($pairs, 0) : null;

    $out['vals'] = is_array($pairs) ? array_column($pairs, 1) : null;

}



$out['categories'] = report_categories_map($db, (int)$r['id']);

json_out($out);