<?php
// api/paste_analyze.php

declare(strict_types=1);

require_once __DIR__ . '/_core/response.php';

require_once __DIR__ . '/_core/db.php';

require_once __DIR__ . '/_core/auth.php';

require_once __DIR__ . '/_core/spd.php';



cors_headers();



if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);



$body  = json_decode(file_get_contents('php://input'), true);

$text  = trim($body['text']  ?? '');

$label = trim($body['label'] ?? 'Pasted SPD');

$save  = !empty($body['save']); // whether to save to DB



if (!$text) json_error('No data provided', 400);



// Parse the raw text through the same CSV parser (handles nm,value pairs)

try {

    $parsed = parse_csv($text);

} catch (\RuntimeException $e) {

    json_error($e->getMessage(), 422);

}



$wls  = $parsed['wls'];

$vals = $parsed['vals'];

$instrumentMeta = $parsed['instrument_meta'] ?? [];

// Manually-entered device details (paste has no instrument header).
$im = trim($body['instrumentModel'] ?? '');
$iv = trim($body['instrumentVersion'] ?? '');
if ($im !== '') $instrumentMeta['instrument_model']   = $im;
if ($iv !== '') $instrumentMeta['instrument_version'] = $iv;



if (count($wls) < 10) json_error('Need at least 10 wavelength/value pairs', 422);



$result = analyze_spd($wls, $vals, $instrumentMeta);



// Optionally save to DB if user is logged in and requested

if ($save) {

    $hdr = get_auth_header();

    if (!$hdr || !str_starts_with($hdr, 'Bearer ')) json_error('Login required to save', 401);

    $p = jwt_verify(substr($hdr, 7));

    if (!$p) json_error('Token expired', 401);

    $userId = (int)$p['id'];



    $db      = get_db();

    $spdData = json_encode(array_map(null, $wls, $vals));

    $meta    = json_encode([

        'rfBins'         => $result['rfBins'],

        'rcsBins'        => $result['rcsBins'] ?? [],

        'rhsBins'        => $result['rhsBins'] ?? [],

        'ra'             => $result['ra'],

        'r9'             => $result['r9'],
        'ri'             => $result['ri'] ?? null,

        'instrumentMeta' => $instrumentMeta,

    ]);



    $db->prepare('INSERT INTO reports(user_id,label,source_type,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,created_at,is_public) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,0)')

       ->execute([

           $userId, $label, 'paste',

           $result['cct'], $result['duv'], $result['x'] ?? null, $result['y'] ?? null,

           $result['Rf'], $result['Rg'],

           $spdData, $meta, date('Y-m-d H:i:s'),

       ]);

    $result['id'] = (int)$db->lastInsertId();

    $result['saved'] = true;

    $result['isPublic'] = false;

}



$result['wls']  = $wls;

$result['vals'] = $vals;

$result['label'] = $label;
$result['rawHeaders'] = $instrumentMeta['raw_headers'] ?? null;
$result['instrumentModel'] = $instrumentMeta['instrument_model'] ?? null;
$result['instrumentVersion'] = $instrumentMeta['instrument_version'] ?? null;

// Shape parity with guest_analyze so guest/preview viewers render correctly.
$result['sourceType'] = 'paste';
$result['createdAt']  = $result['createdAt'] ?? date('Y-m-d H:i:s');
if (empty($result['saved'])) { if (!array_key_exists('id', $result)) $result['id'] = null; $result['guest'] = true; }
json_out($result);