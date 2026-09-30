<?php

declare(strict_types=1);

require_once __DIR__ . '/_core/response.php';

require_once __DIR__ . '/_core/spd.php';

require_once __DIR__ . '/_core/pdf_extract.php';



cors_headers();



// No auth required — guest one-off analysis

// File is NOT saved, just analyzed and returned

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

if (empty($_FILES['file'])) json_error('No file uploaded');



$file = $_FILES['file'];

$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

$label = trim($_POST['label'] ?? '') ?: pathinfo($file['name'], PATHINFO_FILENAME);



if (!in_array($ext, ['csv','txt','tsv','json','sp'], true)) json_error('Only CSV, TSV, TXT or PDF allowed');

if ($file['size'] > 10 * 1024 * 1024) json_error('File too large (max 10 MB)');



// Use a temp file — don't persist

$tmp = $file['tmp_name'];



try {

    $wls = $vals = null;

    $instrumentMeta = [];

    $metrics = [];



    if ($ext === 'pdf') {

        $parsed = extract_pdf($tmp);

        if ($parsed['spd']) {

            $wls  = $parsed['spd']['wls'];

            $vals = $parsed['spd']['vals'];

        } elseif (!empty($parsed['metrics']['cct'])) {

            $metrics = $parsed['metrics'];

        } else {

            json_error('Could not extract SPD data from this PDF. Try uploading the raw CSV instead.', 422);

        }

    } else {

        $csvParsed      = parse_csv(file_get_contents($tmp));

        $wls            = $csvParsed['wls'];

        $vals           = $csvParsed['vals'];

        $instrumentMeta = $csvParsed['instrument_meta'] ?? [];

    }



    $result = ['x'=>null,'y'=>null,'cct'=>null,'duv'=>null,'Rf'=>null,'Rg'=>null,'rfBins'=>null,'ra'=>null,'r9'=>null];

    if ($wls && $vals) {

        $result = analyze_spd($wls, $vals, $instrumentMeta);

    } elseif (!empty($metrics)) {

        $result['cct'] = $metrics['cct'] ?? null;

        $result['duv'] = $metrics['duv'] ?? null;

        $result['Rf']  = $metrics['rf']  ?? null;

        $result['Rg']  = $metrics['rg']  ?? null;

    }



    json_out([

        'id'        => null,  // not saved

        'label'     => $label,

        'sourceType'=> $ext === 'pdf' ? 'pdf' : 'csv',

        'cct'       => $result['cct'] !== null ? (int)$result['cct']   : null,

        'duv'       => $result['duv'] !== null ? (float)$result['duv'] : null,

        'x'         => $result['x']   !== null ? (float)$result['x']   : null,

        'y'         => $result['y']   !== null ? (float)$result['y']   : null,

        'Rf'        => $result['Rf']  !== null ? (int)$result['Rf']    : null,

        'Rg'        => $result['Rg']  !== null ? (int)$result['Rg']    : null,

        'rfBins'    => $result['rfBins'],

        'ra'        => $result['ra']  !== null ? (float)$result['ra']  : null,

        'r9'        => $result['r9']  !== null ? (float)$result['r9']  : null,
        'rcsBins'    => $result['rcsBins'] ?? [],
        'rhsBins'    => $result['rhsBins'] ?? [],
        'ri'         => $result['ri'] ?? null,
        'rawHeaders'        => $instrumentMeta['raw_headers']        ?? null,
        'instrumentModel'   => $instrumentMeta['instrument_model']   ?? null,
        'instrumentVersion' => $instrumentMeta['instrument_version'] ?? null,

        'createdAt' => date('Y-m-d H:i:s'),

        'wls'       => $wls,

        'vals'      => $vals,

        'guest'     => true,

    ]);



} catch (\Throwable $e) {

    json_error($e->getMessage(), str_contains($e->getMessage(), 'Need') ? 422 : 500);

}