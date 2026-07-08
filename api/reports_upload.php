<?php
// api/reports_upload.php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/pdf_extract.php';

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
$user['id'] = (int)$user['id'];
$db   = get_db();

// ── GET — list ────────────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = $db->prepare('SELECT id,label,source_type,cct,duv,cie_x,cie_y,rf,rg,meta,created_at FROM reports WHERE user_id=? ORDER BY created_at DESC');
    $s->execute([$user['id']]);
    json_out(array_map(fn($r) => fmt($r, false), $s->fetchAll()));
}

const REPORT_UPLOAD_EXTS = ['csv', 'txt', 'tsv', 'json', 'sp', 'pdf'];

/**
 * Analyze + persist a single already-on-disk report file (CSV/TSV/TXT/JSON/SP/PDF).
 * Throws on any failure; the caller decides how to surface that (single-file
 * requests turn it into a 4xx/5xx, zip requests collect it into an errors[] list).
 *
 * @param string $srcPath  Path to the file's current contents (temp upload or zip-extracted).
 * @param string $origName Original filename, used for extension + default label.
 */
function process_uploaded_report(PDO $db, array $user, string $srcPath, string $origName, ?string $labelOverride, int $maxBytes): array {
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, REPORT_UPLOAD_EXTS, true)) {
        throw new \RuntimeException("Unsupported file type: .$ext");
    }
    $size = filesize($srcPath);
    if ($size === false || $size > $maxBytes) {
        throw new \RuntimeException("File too large (max " . (int)($maxBytes / 1024 / 1024) . " MB): $origName");
    }

    $label = trim((string)$labelOverride) ?: pathinfo($origName, PATHINFO_FILENAME);

    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $filename = time() . '_' . bin2hex(random_bytes(3)) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $origName);
    $dest     = $uploadDir . '/' . $filename;
    if (!copy($srcPath, $dest)) throw new \RuntimeException("Failed to save file: $origName");

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
                throw new \RuntimeException("Could not extract SPD data from this PDF: $origName");
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

        $hcriDefPriv = 0;
        try {
            $hcriDp = $db->prepare('SELECT reports_default_private FROM users WHERE id=?');
            $hcriDp->execute([$user['id']]);
            $hcriDefPriv = (int)$hcriDp->fetchColumn();
        } catch (\Throwable $e) {}
        $hcriPub = $hcriDefPriv ? 0 : 1;

        $s = $db->prepare('INSERT INTO reports(user_id,label,source_type,file_name,cct,duv,cie_x,cie_y,rf,rg,spd_data,meta,created_at,is_public) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,' . $hcriPub . ')');
        $s->execute([
            $user['id'], $label, $sourceType, $filename,
            $result['cct'], $result['duv'], $result['x'] ?? null, $result['y'] ?? null,
            $result['Rf'], $result['Rg'],
            $spdData, $meta, $now
        ]);

        $newId = (int)$db->lastInsertId();
        if ($newId === 0) {
            $s2 = $db->prepare('SELECT id FROM reports WHERE user_id=? AND created_at=? ORDER BY id DESC LIMIT 1');
            $s2->execute([$user['id'], $now]);
            $row = $s2->fetch();
            $newId = $row ? (int)$row['id'] : 0;
        }

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
            'rfBins'     => $result['rfBins'],
            'rcsBins'    => $result['rcsBins'] ?? [],
            'rhsBins'    => $result['rhsBins'] ?? [],
            'createdAt'  => $now,
            'isPublic'   => !$hcriDefPriv,
            'wls'        => $wls,
            'vals'       => $vals,
        ];
    } catch (\Throwable $e) {
        @unlink($dest);
        throw $e;
    }
}

// ── POST — upload & analyze (single file, multiple files, or a .zip of files) ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (empty($_FILES['file'])) {
        json_error('No file uploaded — FILES: ' . json_encode($_FILES) . ' METHOD: ' . $_SERVER['REQUEST_METHOD']);
    }

    $maxBytes = 10 * 1024 * 1024;
    $file = $_FILES['file'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    // ── ZIP: extract, then process every supported file inside it ──────────────
    if ($ext === 'zip') {
        if (!class_exists('ZipArchive')) {
            json_error('ZIP uploads are not supported on this server (missing PHP zip extension).', 500);
        }
        if ($file['size'] > $maxBytes * 5) json_error('ZIP file too large (max 50 MB)');

        $zip = new ZipArchive();
        if ($zip->open($file['tmp_name']) !== true) json_error('Could not read ZIP file', 422);

        $tmpDir = sys_get_temp_dir() . '/hcri_zip_' . bin2hex(random_bytes(6));
        mkdir($tmpDir, 0755, true);

        $results = [];
        $errors  = [];
        try {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $entryName = $zip->getNameIndex($i);
                if ($entryName === false) continue;
                $base = basename($entryName);
                // Skip directories, hidden/system files, and anything macOS zip metadata.
                if ($base === '' || str_starts_with($base, '.') || str_contains($entryName, '__MACOSX')) continue;
                $entryExt = strtolower(pathinfo($base, PATHINFO_EXTENSION));
                if (!in_array($entryExt, REPORT_UPLOAD_EXTS, true)) continue;

                $extractedPath = $tmpDir . '/' . bin2hex(random_bytes(4)) . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $base);
                $contents = $zip->getFromIndex($i);
                if ($contents === false) { $errors[] = ['file' => $base, 'error' => 'Could not read from ZIP']; continue; }
                file_put_contents($extractedPath, $contents);

                try {
                    $results[] = process_uploaded_report($db, $user, $extractedPath, $base, null, $maxBytes);
                } catch (\Throwable $e) {
                    $errors[] = ['file' => $base, 'error' => $e->getMessage()];
                } finally {
                    @unlink($extractedPath);
                }
            }
        } finally {
            $zip->close();
            @rmdir($tmpDir);
        }

        if (!$results && !$errors) json_error('No supported report files found in that ZIP.', 422);
        json_out(['results' => $results, 'errors' => $errors], 201);
    }

    // ── Single file (the common case) ───────────────────────────────────────────
    $label = trim($_POST['label'] ?? '') ?: null;
    try {
        $response = process_uploaded_report($db, $user, $file['tmp_name'], $file['name'], $label, $maxBytes);
        json_out($response, 201);
    } catch (\Throwable $e) {
        json_error($e->getMessage(), str_contains($e->getMessage(), 'Need') ? 422 : 500);
    }
}

json_error('Method not allowed: ' . $_SERVER['REQUEST_METHOD'], 405);

function fmt(array $r, bool $spd): array {
    $meta = json_decode($r['meta'] ?: '{}', true) ?? [];
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
        'ra'         => isset($meta['ra']) ? (float)$meta['ra'] : null,
        'r9'         => isset($meta['r9']) ? (float)$meta['r9'] : null,
        'notes'      => $r['notes']       ?? null,
        'shareToken' => $r['share_token'] ?? null,
        'createdAt'  => $r['created_at'],
    ];
    if ($spd && !empty($r['spd_data'])) {
        $pairs       = json_decode($r['spd_data'], true);
        $out['wls']  = array_column($pairs, 0);
        $out['vals'] = array_column($pairs, 1);
    }
    return $out;
}