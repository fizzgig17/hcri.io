<?php

declare(strict_types=1);

require_once __DIR__ . '/_core/response.php';

require_once __DIR__ . '/_core/db.php';

require_once __DIR__ . '/_core/auth.php';

require_once __DIR__ . '/_core/spd.php';



cors_headers();

$admin = require_admin();

$db    = get_db();



if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);



$body   = json_decode(file_get_contents('php://input'), true) ?? [];

$userId = isset($body['userId']) ? (int)$body['userId'] : null;



// Fetch all reports that have spd_data (optionally filtered by user)

if ($userId) {

    $s = $db->prepare('SELECT id, user_id FROM reports WHERE spd_data IS NOT NULL AND user_id = ? ORDER BY id');

    $s->execute([$userId]);

} else {

    $s = $db->query('SELECT id, user_id FROM reports WHERE spd_data IS NOT NULL ORDER BY id');

}

$rows = $s->fetchAll();



$done = 0; $failed = 0; $errors = [];



foreach ($rows as $row) {

    try {

        $r = $db->prepare('SELECT spd_data, meta FROM reports WHERE id = ?');

        $r->execute([(int)$row['id']]);

        $report = $r->fetch();

        if (!$report || empty($report['spd_data'])) continue;



        $pairs    = json_decode($report['spd_data'], true);

        $wls      = array_column($pairs, 0);

        $vals     = array_column($pairs, 1);

        [$wls, $vals] = strip_trailing_blocks($wls, $vals);

        $cleanSpd = json_encode(array_map(null, $wls, $vals));

        // Restore instrument metadata — prefer stored instrumentMeta,

        // fall back to ra/r9/r1-r15 stored directly in meta for older reports

        $prevMeta = json_decode($report['meta'] ?: '{}', true) ?? [];

        $instMeta = $prevMeta['instrumentMeta'] ?? [];

        if (empty($instMeta)) {

            // Older reports stored ra/r9 directly — reconstruct minimal instrumentMeta

            if (isset($prevMeta['ra']) && is_numeric($prevMeta['ra']))

                $instMeta['ra'] = (float)$prevMeta['ra'];

            if (isset($prevMeta['r9']) && is_numeric($prevMeta['r9']))

                $instMeta['r9'] = (float)$prevMeta['r9'];

            // Also pick up r1-r15 if stored

            for ($i = 1; $i <= 15; $i++) {

                if (isset($prevMeta['r'.$i]) && is_numeric($prevMeta['r'.$i]))

                    $instMeta['r'.$i] = (float)$prevMeta['r'.$i];

            }

        }

        $result   = analyze_spd($wls, $vals, $instMeta);



        $meta = json_decode($report['meta'] ?: '{}', true) ?? [];

        $meta['rfBins']  = $result['rfBins'];

        $meta['rcsBins'] = $result['rcsBins'];

        $meta['rhsBins'] = $result['rhsBins'];

        // Everything else analyze_spd() produces. Previously only rfBins/rcsBins/

        // rhsBins were persisted, so the per-sample fidelities and the CVG

        // coordinates were recomputed on every page view and were missing

        // entirely from PDF exports (which read meta directly).

        $meta['rlsBins']   = $result['rlsBins']   ?? [];

        $meta['rfSamples'] = $result['rfSamples'] ?? [];

        $meta['sampleHues']= $result['sampleHues'] ?? [];

        $meta['binRgb']    = $result['binRgb']    ?? [];

        $meta['binRgbRef'] = $result['binRgbRef'] ?? [];

        $meta['cvgTest']   = $result['cvgTest']   ?? [];

        $meta['cvgRef']    = $result['cvgRef']    ?? [];

        $meta['cvgRefAng'] = $result['cvgRefAng'] ?? [];

        if (!empty($result['ra'])) $meta['ra'] = $result['ra'];

        if (!empty($result['r9'])) $meta['r9'] = $result['r9'];

        if (!empty($result['ri'])) $meta['ri'] = $result['ri'];



        $db->prepare('UPDATE reports SET spd_data=?, meta=?, rf=?, rg=?, cct=?, duv=?, cie_x=?, cie_y=? WHERE id=?')

           ->execute([

               $cleanSpd, json_encode($meta),

               $result['Rf'], $result['Rg'],

               $result['cct'], $result['duv'],

               $result['x'], $result['y'],

               (int)$row['id'],

           ]);

        $done++;

    } catch (\Throwable $e) {

        $failed++;

        $errors[] = "Report #{$row['id']}: " . $e->getMessage();

    }

}



json_out([

    'done'   => $done,

    'failed' => $failed,

    'total'  => count($rows),

    'errors' => array_slice($errors, 0, 10),

]);