<?php

// api/reports_item.php

declare(strict_types=1);

ini_set('display_errors', '0');

error_reporting(E_ALL);

set_exception_handler(function($e) {

    if (!headers_sent()) header('Content-Type: application/json');

    http_response_code(500);

    echo json_encode(['error' => $e->getMessage(), 'file' => basename($e->getFile()), 'line' => $e->getLine()]);

    exit;

});

set_error_handler(function($no, $str, $file, $line) {

    throw new \ErrorException($str, 0, $no, $file, $line);

}, E_ALL & ~E_NOTICE & ~E_DEPRECATED);

require_once __DIR__ . '/_core/response.php';

require_once __DIR__ . '/_core/spd.php';

require_once __DIR__ . '/_core/db.php';

require_once __DIR__ . '/_core/auth.php';

require_once __DIR__ . '/_core/categories.php';

cors_headers();

$user = require_auth();

$user['id'] = (int)$user['id'];

$db   = get_db();

$m    = $_SERVER['REQUEST_METHOD'];

$_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

preg_match('#/api/reports/(\d+)(/(\w+))?#', $_uri, $_pm);

$id   = isset($_pm[1]) ? (int)$_pm[1] : 0;

$path = $_pm[2] ?? '';   // e.g. '/recalc'

if (!$id) json_error('Invalid ID', 400);

// ── POST /api/reports/:id/recalc ─────────────────────────────────────────────

if ($m === 'POST' && $path === '/recalc') {

    $s = $db->prepare('SELECT * FROM reports WHERE id=? AND user_id=?');

    $s->execute([$id, $user['id']]);

    $row = $s->fetch();

    if (!$row) json_error('Not found', 404);

    if (empty($row['spd_data'])) json_error('No SPD data stored', 400);

    $pairs    = json_decode($row['spd_data'], true);

    $wls2     = array_column($pairs, 0);

    $vals2    = array_column($pairs, 1);

    [$wls2, $vals2] = strip_trailing_blocks($wls2, $vals2);

    // Restore instrument metadata — prefer stored instrumentMeta,

    // fall back to ra/r9/r1-r15 stored directly in meta for older reports

    $prevMeta = json_decode($row['meta'] ?: '{}', true) ?? [];

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

    $result   = analyze_spd($wls2, $vals2, $instMeta);

    $meta2  = json_decode($row['meta'] ?: '{}', true) ?? [];

    $meta2['rfBins']  = $result['rfBins'];

    $meta2['rcsBins'] = $result['rcsBins'];

    $meta2['rhsBins'] = $result['rhsBins'];

    $meta2['rlsBins'] = $result['rlsBins'] ?? [];

    $meta2['cvgTest']   = $result['cvgTest']   ?? [];

    $meta2['cvgRef']    = $result['cvgRef']    ?? [];

    $meta2['cvgRefAng'] = $result['cvgRefAng'] ?? [];

    $meta2['rfSamples'] = $result['rfSamples'] ?? [];

    $meta2['sampleHues'] = $result['sampleHues'] ?? [];

    $meta2['binRgb'] = $result['binRgb'] ?? [];

    $meta2['binRgbRef'] = $result['binRgbRef'] ?? [];

    if (!empty($result['ra'])) $meta2['ra'] = $result['ra'];

    if (!empty($result['r9'])) $meta2['r9'] = $result['r9'];

    if (!empty($result['ri'])) $meta2['ri'] = $result['ri'];

    $db->prepare('UPDATE reports SET spd_data=?,meta=?,rf=?,rg=?,cct=?,duv=?,cie_x=?,cie_y=? WHERE id=?')

       ->execute([json_encode(array_map(null,$wls2,$vals2)), json_encode($meta2), $result['Rf'], $result['Rg'], $result['cct'], $result['duv'], $result['x'], $result['y'], $id]);

    json_out([

        'Rf'      => $result['Rf'],

        'Rg'      => $result['Rg'],

        'rfBins'  => $result['rfBins'],

        'rcsBins' => $result['rcsBins'],

        'rhsBins' => $result['rhsBins'],

        'rlsBins' => $result['rlsBins'] ?? [],

        'cvgTest' => $result['cvgTest'] ?? [],

        'cvgRef'  => $result['cvgRef'] ?? [],

        'cvgRefAng' => $result['cvgRefAng'] ?? [],

        'rfSamples' => $result['rfSamples'] ?? [],

        'sampleHues' => $result['sampleHues'] ?? [],

        'binRgb'  => $result['binRgb'] ?? [],

        'binRgbRef' => $result['binRgbRef'] ?? [],

        'ra'      => $result['ra'] ?? ($meta2['ra'] ?? null),

        'r9'      => $result['r9'] ?? ($meta2['r9'] ?? null),

        'ri'      => $result['ri'] ?? ($meta2['ri'] ?? null),

    ]);

}

function get_report(PDO $db, int $id, int $uid): array {

    $s = $db->prepare('SELECT * FROM reports WHERE id=? AND user_id=?');

    $s->execute([$id, $uid]);

    $r = $s->fetch();

    if (!$r) json_error('Report not found', 404);

    return $r;

}

function fmt(array $r, bool $spd): array {

    $meta = json_decode($r['meta'] ?: '{}', true) ?? [];

    spd_recompute($r, $meta);

    // Backfill any values the device did not provide by computing them from the SPD.

    $pairs = !empty($r['spd_data']) ? json_decode($r['spd_data'], true) : null;

    if ($pairs && (empty($meta['ri']) || empty($meta['rfBins']) || empty($meta['rcsBins']) || empty($meta['rlsBins']) || empty($meta['binRgb']) || $r['cct']===null || $r['rf']===null || $r['rg']===null || $r['duv']===null || $r['cie_x']===null || $r['cie_y']===null)) {

        try {

            $instMeta = $meta['instrumentMeta'] ?? [];

            if (empty($instMeta) && !empty($r['file_name'])) {

                $fp = __DIR__ . '/../uploads/' . $r['file_name'];

                if (is_file($fp) && preg_match('/\\.(csv|txt|tsv|sp|json)$/i', (string)$r['file_name'])) {

                    $cp = parse_csv(file_get_contents($fp));

                    $instMeta = $cp['instrument_meta'] ?? [];

                }

            }

            $wls = array_column($pairs, 0); $vals = array_column($pairs, 1);

            if ($wls && $vals) {

                $res = analyze_spd($wls, $vals, $instMeta);

                if (empty($meta['rfBins']))  $meta['rfBins']  = $res['rfBins']  ?? null;

                if (empty($meta['rcsBins'])) $meta['rcsBins'] = $res['rcsBins'] ?? [];

                if (empty($meta['rhsBins'])) $meta['rhsBins'] = $res['rhsBins'] ?? [];

                if (empty($meta['rlsBins'])) $meta['rlsBins'] = $res['rlsBins'] ?? [];

                if (empty($meta['cvgTest']))   $meta['cvgTest']   = $res['cvgTest'] ?? [];

                if (empty($meta['cvgRef']))    $meta['cvgRef']    = $res['cvgRef'] ?? [];

                if (empty($meta['cvgRefAng'])) $meta['cvgRefAng'] = $res['cvgRefAng'] ?? [];

                if (empty($meta['rfSamples'])) $meta['rfSamples'] = $res['rfSamples'] ?? [];

                if (empty($meta['sampleHues'])) $meta['sampleHues'] = $res['sampleHues'] ?? [];

                if (empty($meta['binRgb'])) $meta['binRgb'] = $res['binRgb'] ?? [];

                if (empty($meta['binRgbRef'])) $meta['binRgbRef'] = $res['binRgbRef'] ?? [];

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

    // Robust R1-R15: stored value, else read straight from raw headers (parity with explore/shared).

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

    $out  = [

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

        'rlsBins'    => $meta['rlsBins'] ?? [],

        'cvgTest'    => $meta['cvgTest'] ?? [],

        'cvgRef'     => $meta['cvgRef'] ?? [],

        'cvgRefAng'  => $meta['cvgRefAng'] ?? [],

        'rfSamples'  => $meta['rfSamples'] ?? [],

        'sampleHues' => $meta['sampleHues'] ?? [],

        'binRgb'     => $meta['binRgb'] ?? [],

        'binRgbRef'  => $meta['binRgbRef'] ?? [],

        'ra'         => isset($meta['ra']) ? (float)$meta['ra'] : null,

        'r9'         => isset($meta['r9']) ? (float)$meta['r9'] : null,

        'ri'         => $riOut,

        'notes'        => $r['notes']        ?? null,

        'shareToken'   => $r['share_token']    ?? null,

        'isPublic'     => !empty($r['is_public']),

        'instrumentModel' => $meta['instrumentMeta']['instrument_model'] ?? null,

        'instrumentVersion' => $meta['instrumentMeta']['instrument_version'] ?? null,

        'rawHeaders'    => $meta['instrumentMeta']['raw_headers'] ?? null,

        'createdAt'  => $r['created_at'],

    ];

    if ($spd && !empty($r['spd_data'])) {

        $pairs       = json_decode($r['spd_data'], true);

        $out['wls']  = is_array($pairs) ? array_column($pairs, 0) : null;

        $out['vals'] = is_array($pairs) ? array_column($pairs, 1) : null;

    }

    $out['categories'] = report_categories_map(get_db(), (int)$r['id']);

    return $out;

}

if ($m === 'GET')    json_out(fmt(get_report($db,$id,$user['id']), true));

if ($m === 'DELETE') {

    $r = get_report($db, $id, $user['id']);

    try { $db->prepare('UPDATE flicker_readings SET report_id=NULL WHERE report_id=?')->execute([$id]); } catch (\Throwable $e) {} $db->prepare('DELETE FROM reports WHERE id=?')->execute([$id]);

    if (!empty($r['file_name'])) { $fp = __DIR__ . '/../../uploads/' . $r['file_name']; if (file_exists($fp)) unlink($fp); }

    json_out(['ok' => true]);

}

if ($m === 'PATCH') {

    $b = body();

    // Share token actions

    if (array_key_exists('folder_id', $b)) {

        get_report($db, $id, $user['id']); // ownership check

        $fid = $b['folder_id'];

        if ($fid !== null && $fid !== '') {

            $fid = (int)$fid;

            $fchk = $db->prepare('SELECT id FROM folders WHERE id=? AND user_id=?');

            $fchk->execute([$fid, $user['id']]);

            if (!$fchk->fetch()) json_error('Folder not found', 404);

        } else {

            $fid = null;

        }

        $db->prepare('UPDATE reports SET folder_id=? WHERE id=?')->execute([$fid, $id]);

        json_out(['ok' => true, 'folder_id' => $fid]);

    }

    if (isset($b['shareAction'])) {

        get_report($db, $id, $user['id']); // ownership check

        if ($b['shareAction'] === 'enable') {

            // Reuse the existing token if this report is already shared --
            // minting a new one every time would silently invalidate any
            // link already handed out (email, chat, etc.) for no reason.

            $existingStmt = $db->prepare('SELECT share_token FROM reports WHERE id=?');

            $existingStmt->execute([$id]);

            $token = (string)($existingStmt->fetchColumn() ?: '');

            if ($token === '') {

                do {

                    $token = bin2hex(random_bytes(8)); // 16 chars

                    $exists = $db->prepare('SELECT id FROM reports WHERE share_token = ?');

                    $exists->execute([$token]);

                } while ($exists->fetch());

                $db->prepare('UPDATE reports SET share_token=? WHERE id=?')->execute([$token, $id]);

            }

            json_out(['shareToken' => $token]);

        } elseif ($b['shareAction'] === 'disable') {

            $db->prepare('UPDATE reports SET share_token=NULL WHERE id=?')->execute([$id]);

            json_out(['shareToken' => null]);

        }

        json_error('Invalid shareAction', 400);

    }

    $label = trim($b['label'] ?? '');

    if (!$label) json_error("'label' required");

    get_report($db, $id, $user['id']); // ownership check

    $db->prepare('UPDATE reports SET label=?, notes=? WHERE id=?')

       ->execute([$label, $b['notes']??null, $id]);

    json_out(['ok' => true]);

}

json_error('Method not allowed', 405);