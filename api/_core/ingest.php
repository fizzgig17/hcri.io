<?php
// api/_core/ingest.php
declare(strict_types=1);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/spd.php';
require_once __DIR__ . '/pdf_extract.php';

// Parse an uploaded SPD file (any UI-supported format) and insert a report for
// the given user. Mirrors the UI upload path. Returns the response array.
// Throws RuntimeException on validation/parse failure (message is user-safe).
function ingest_spd_upload(PDO $db, int $userId, string $srcPath, string $origName, string $label = ''): array {
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

        $s = $db->prepare('INSERT INTO reports(user_id,label,source_type,file_name,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,created_at,is_public) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,' . $pub . ')');
        $s->execute([
            $userId, $label, $sourceType, $filename,
            $result['cct'], $result['duv'], $result['x'] ?? null, $result['y'] ?? null,
            $result['Rf'], $result['Rg'],
            $spdData, $meta, $now,
        ]);
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
        ];
    } catch (\Throwable $e) {
        @unlink($dest);
        throw $e;
    }
}