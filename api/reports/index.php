<?php
// api/reports/index.php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';
require_once __DIR__ . '/../_core/spd.php';
require_once __DIR__ . '/../_core/pdf_extract.php';

cors_headers();

// ── TEMP: log exactly what we receive ────────────────────────────────────────
$incoming = [
    'method'  => $_SERVER['REQUEST_METHOD'],
    'has_file'=> !empty($_FILES['file']),
    'files'   => array_keys($_FILES),
    'post'    => array_keys($_POST),
];
error_log('REPORTS INDEX: ' . json_encode($incoming));
// ── END TEMP ─────────────────────────────────────────────────────────────────

$user = require_auth();
$db   = get_db();

// ── GET — list ────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = $db->prepare('SELECT id,label,source_type,cct,duv,cie_x,cie_y,rf,rg,meta,created_at FROM reports WHERE user_id=? ORDER BY created_at DESC');
    $s->execute([$user['id']]);
    json_out(array_map(fn($r) => fmt($r, false), $s->fetchAll()));
}

// ── POST — upload & analyze ───────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_FILES['file'])) {
        json_error('No file uploaded — FILES: ' . json_encode($_FILES) . ' METHOD: ' . $_SERVER['REQUEST_METHOD']);
    }

    $file  = $_FILES['file'];
    $ext   = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $label = trim($_POST['label'] ?? '') ?: pathinfo($file['name'], PATHINFO_FILENAME);

    if (!in_array($ext, ['csv','txt','tsv','pdf'], true)) json_error('Only CSV, TSV, TXT or PDF allowed');
    if ($file['size'] > 10 * 1024 * 1024) json_error('File too large (max 10 MB)');

    $uploadDir = __DIR__ . '/../../uploads';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $file['name']);
    $dest     = $uploadDir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $dest)) json_error('Failed to save file', 500);

    try {
        $wls = $vals = null;
        $metrics = [];
        $instrumentMeta = [];
        $sourceType = $ext === 'pdf' ? 'pdf' : 'csv';

        if ($ext === 'pdf') {
            $parsed = extract_pdf($dest);
            if ($parsed['spd']) {
                $wls  = $parsed['spd']['wls'];
                $vals = $parsed['spd']['vals'];
            } elseif (!empty($parsed['metrics']['cct'])) {
                $metrics = $parsed['metrics'];
            } else {
                @unlink($dest);
                json_error('Could not extract SPD data from this PDF.', 422);
            }
        } else {
            $csvParsed      = parse_csv(file_get_contents($dest));
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

        $spdData = $wls ? json_encode(array_map(null, $wls, $vals)) : null;
        $meta    = json_encode([
            'rfBins'         => $result['rfBins'],
            'rcsBins'        => $result['rcsBins'] ?? [],
            'rhsBins'        => $result['rhsBins'] ?? [],
            'ra'             => $result['ra'],
            'r9'             => $result['r9'],
            'ri'             => $result['ri'] ?? null,
            'instrumentMeta' => $instrumentMeta,
        ] + $metrics);

        $now = date('Y-m-d H:i:s');

        // Apply the user's default-privacy preference at creation time so a new
        // report is created private (excluded from Explore) when that setting is
        // on. Guarded: if the column/migration is absent we fall back to public,
        // matching the previous behaviour.
        $defaultPrivate = false;
        try {
            $dpq = $db->prepare('SELECT reports_default_private FROM users WHERE id=?');
            $dpq->execute([$user['id']]);
            $defaultPrivate = (bool)$dpq->fetchColumn();
        } catch (\Throwable $e) { $defaultPrivate = false; }

        $isPublic   = $defaultPrivate ? 0 : 1;
        // The report is created private when the user's default is private, but we do
        // NOT auto-mint a share token here. A token is only created when the user
        // explicitly enables sharing.
        $shareToken = null;

        $s = $db->prepare('INSERT INTO reports(user_id,label,source_type,file_name,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,is_public,share_token,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $s->execute([
            $user['id'], $label, $sourceType, $filename,
            $result['cct'], $result['duv'], $result['x'] ?? null, $result['y'] ?? null,
            $result['Rf'], $result['Rg'],
            $spdData, $meta, $isPublic, $shareToken, $now
        ]);

        $newId = (int)$db->lastInsertId();
        if ($newId === 0) {
            $s2 = $db->prepare('SELECT id FROM reports WHERE user_id=? AND created_at=? ORDER BY id DESC LIMIT 1');
            $s2->execute([$user['id'], $now]);
            $row = $s2->fetch();
            $newId = $row ? (int)$row['id'] : 0;
        }

        $response = [
            'id'         => $newId,
            'label'      => $label,
            'sourceType' => $sourceType,
            'cct'        => $result['cct'] !== null ? (int)$result['cct']   : null,
            'duv'        => $result['duv'] !== null ? (float)$result['duv'] : null,
            'x'          => $result['x']   !== null ? (float)$result['x']   : null,
            'y'          => $result['y']   !== null ? (float)$result['y']   : null,
            'Rf'         => $result['Rf']  !== null ? (int)$result['Rf']    : null,
            'Rg'         => $result['Rg']  !== null ? (int)$result['Rg']    : null,
            'rfBins'     => $result['rfBins'],
            'rcsBins'    => $result['rcsBins'] ?? [],
            'rhsBins'    => $result['rhsBins'] ?? [],
            'ra'         => $result['ra'] !== null ? (float)$result['ra'] : null,
            'r9'         => $result['r9'] !== null ? (float)$result['r9'] : null,
            'ri'         => $result['ri'] ?? null,
            'rawHeaders'        => $instrumentMeta['raw_headers']        ?? null,
            'instrumentModel'   => $instrumentMeta['instrument_model']   ?? null,
            'instrumentVersion' => $instrumentMeta['instrument_version'] ?? null,
            'createdAt'  => $now,
            'isPublic'   => $isPublic === 1,
            'private'    => $isPublic === 0,
            'shareToken' => $shareToken,
            'wls'        => $wls,
            'vals'       => $vals,
        ];

        json_out($response, 201);

    } catch (\Throwable $e) {
        @unlink($dest);
        json_error($e->getMessage(), str_contains($e->getMessage(), 'Need') ? 422 : 500);
    }
}

json_error('Method not allowed: ' . $_SERVER['REQUEST_METHOD'], 405);

function fmt(array $r, bool $spd): array {
    $meta = json_decode($r['meta'] ?? '{}', true) ?? [];
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
        'rfBins'     => $meta['rfBins'] ?? null,
        'createdAt'  => $r['created_at'],
    ];
    if ($spd && !empty($r['spd_data'])) {
        $pairs       = json_decode($r['spd_data'], true);
        $out['wls']  = array_column($pairs, 0);
        $out['vals'] = array_column($pairs, 1);
    }
    return $out;
}