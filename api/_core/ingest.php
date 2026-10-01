<?php
// api/_core/ingest.php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/spd.php';
require_once __DIR__ . '/pdf_extract.php';

// Parse an uploaded SPD file (any UI-supported format) and insert a report for
// the given user. Mirrors the UI upload path. Returns the response array.
// Throws RuntimeException on validation/parse failure (message is user-safe).
//
// $viaApi marks the report as having come in through the token-authenticated
// v1_upload.php endpoint (as opposed to inbound email or the browser UI), so
// it powers the "uploaded via API" count on the admin user list. Only
// v1_upload.php should pass true; the inbound-email callers explicitly pass
// false so a mail-in report is never miscounted as an API upload.
function ingest_spd_upload(PDO $db, int $userId, string $srcPath, string $origName, string $label = '', bool $viaApi = false): array {
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, ['csv', 'tsv', 'txt', 'json', 'sp', 'pdf'], true)) {
        throw new RuntimeException('Unsupported format ".' . $ext . '". Allowed: csv, tsv, txt, json, sp, pdf');
    }
    $label = trim($label) ?: pathinfo($origName, PATHINFO_FILENAME);

    $uploadDir = __DIR__ . '/../../uploads';
    if (!is_dir($uploadDir)) @mkdir($uploadDir, 0755, true);
    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
    $dest = $uploadDir . '/' . $filename;
    if (!@copy($srcPath, $dest)) throw new RuntimeException('Failed to save uploaded file');

    try {
        $wls = $vals = null;
        $metrics = [];
        $instrumentMeta = [];
        $sourceType = $ext === 'pdf' ? 'pdf' : 'csv';

        if ($ext === 'pdf') {
            $parsed = extract_pdf($dest);
            if ($parsed['spd']) {
                $wls = $parsed['spd']['wls'];
                $vals = $parsed['spd']['vals'];
            } elseif (!empty($parsed['metrics']['cct'])) {
                $metrics = $parsed['metrics'];
            } else {
                throw new RuntimeException('Could not extract SPD data from this PDF.');
            }
        } else {
            $csvParsed = parse_csv(file_get_contents($dest));
            $wls = $csvParsed['wls'];
            $vals = $csvParsed['vals'];
            $instrumentMeta = $csvParsed['instrument_meta'] ?? [];
        }

        if ($wls && $vals) [$wls, $vals] = strip_trailing_blocks($wls, $vals); // scrub trailing reset/zero blocks
        $result = ['x'=>null,'y'=>null,'cct'=>null,'duv'=>null,'Rf'=>null,'Rg'=>null,'rfBins'=>null,'ra'=>null,'r9'=>null];
        if ($wls && $vals) {
            $result = analyze_spd($wls, $vals, $instrumentMeta);
        } elseif (!empty($metrics)) {
            $result['cct'] = $metrics['cct'] ?? null;
            $result['duv'] = $metrics['duv'] ?? null;
            $result['Rf']  = $metrics['rf']  ?? null;
            $result['Rg']  = $metrics['rg']  ?? null;
        }

        $spdData = $wls ? json_encode(array_map(null, $wls, $vals)) : null;
        $meta = json_encode([
            'rfBins'         => $result['rfBins'],
            'rcsBins'        => $result['rcsBins'] ?? [],
            'rhsBins'        => $result['rhsBins'] ?? [],
            'ra'             => $result['ra'],
            'r9'             => $result['r9'],
            'ri'             => $result['ri'] ?? null,
            'instrumentMeta' => $instrumentMeta,
        ] + $metrics);

        $now = date('Y-m-d H:i:s');

        $defPriv = 0;
        try { $dp = $db->prepare('SELECT reports_default_private FROM users WHERE id=?'); $dp->execute([$userId]); $defPriv = (int)$dp->fetchColumn(); }
        catch (\Throwable $e) {}
        $pub = $defPriv ? 0 : 1;

        $params = [
            $userId, $label, $sourceType, $filename,
            $result['cct'], $result['duv'], $result['x'] ?? null, $result['y'] ?? null,
            $result['Rf'], $result['Rg'],
            $spdData, $meta, $now, $viaApi ? 1 : 0,
        ];
        try {
            $s = $db->prepare('INSERT INTO reports(user_id,label,source_type,file_name,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,created_at,is_public,via_api) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,' . $pub . ',?)');
            $s->execute($params);
        } catch (\PDOException $e) {
            // SQLSTATE 42S22 = unknown column -- the via_api migration
            // (hcri_api_flag_migration.sql: ALTER TABLE reports ADD COLUMN
            // via_api ...) hasn't been run against this database yet.
            // Every upload (API, browser UI, and inbound email alike) goes
            // through this one function, so letting that missing reporting
            // column take the whole insert down would break uploads
            // entirely rather than just leaving the admin panel's "via API"
            // count at zero -- which is the failure mode admin.php's own
            // user-list query already tolerates. Degrade the same way here:
            // retry without via_api, dropping its trailing param too.
            if ($e->getCode() === '42S22' || str_contains($e->getMessage(), 'via_api')) {
                $s = $db->prepare('INSERT INTO reports(user_id,label,source_type,file_name,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,created_at,is_public) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,' . $pub . ')');
                $s->execute(array_slice($params, 0, 13));
            } else {
                throw $e;
            }
        }
        $newId = (int)$db->lastInsertId();

        return [
            'id'         => $newId,
            'label'      => $label,
            'sourceType' => $sourceType,
            'cct'        => $result['cct'] !== null ? (int)$result['cct']   : null,
            'duv'        => $result['duv'] !== null ? (float)$result['duv'] : null,
            'x'          => $result['x']   !== null ? (float)$result['x']   : null,
            'y'          => $result['y']   !== null ? (float)$result['y']   : null,
            'Rf'         => $result['Rf']  !== null ? (int)$result['Rf']    : null,
            'Rg'         => $result['Rg']  !== null ? (int)$result['Rg']    : null,
            'ra'         => $result['ra']  !== null ? (float)$result['ra']  : null,
            'r9'         => $result['r9']  !== null ? (float)$result['r9']  : null,
            'isPublic'   => $pub ? true : false,
            'createdAt'  => $now,
            'viaApi'     => $viaApi,
        ];
    } catch (\Throwable $e) {
        @unlink($dest);
        throw $e;
    }
}