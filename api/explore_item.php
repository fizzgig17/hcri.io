<?php
// api/explore_item.php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/categories.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/auth.php';
cors_headers();
header('Cache-Control: no-store, no-cache, must-revalidate');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);
preg_match('#/api/explore/(\d+)$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$id = isset($m[1]) ? (int)$m[1] : 0;
if (!$id) json_error('Invalid ID', 400);
$db = get_db();
$myId = 0;
try { $hdr = get_auth_header(); if (str_starts_with($hdr, 'Bearer ')) { $tok = jwt_verify(substr($hdr, 7)); if ($tok && isset($tok['id'])) $myId = (int)$tok['id']; } } catch (\Throwable $e) {}
$shareTok = (string)($_GET['t'] ?? '');
$isSuper = false; if ($myId > 0) { try { $ssq = $db->prepare('SELECT is_super_admin FROM users WHERE id=?'); $ssq->execute([$myId]); $isSuper = ((int)$ssq->fetchColumn()) === 1; } catch (\Throwable $e) {} } $s  = $isSuper ? $db->prepare('SELECT * FROM reports WHERE id=?') : $db->prepare('SELECT * FROM reports WHERE id=? AND (is_public=1 OR user_id=? OR (share_token IS NOT NULL AND share_token=?))');
$s->execute($isSuper ? [$id] : [$id, $myId, $shareTok]);
$r  = $s->fetch();
if (!$r) json_error('Not found', 404);
$meta = json_decode($r['meta'] ?: '{}', true) ?? [];
spd_recompute($r, $meta);
// Backfill metrics not persisted by older uploads, so the explore report matches the shared report exactly.
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
$ownerName = null;
try { $uq = $db->prepare('SELECT name, name_masked FROM users WHERE id=?'); $uq->execute([(int)$r['user_id']]);
  if ($urow = $uq->fetch()) { $ownerName = ((int)($urow['name_masked'] ?? 0) === 1) ? 'hidden' : $urow['name']; } } catch (\Throwable $e) {}
$out = [
    'id'                => (int)$r['id'],
    'label'             => $r['label'],
    'sourceType'        => $r['source_type'] ?? null,
    'notes'             => $r['notes'],
    'cct'               => $r['cct']   !== null ? (int)$r['cct']     : null,
    'duv'               => $r['duv']   !== null ? (float)$r['duv']   : null,
    'x'                 => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,
    'y'                 => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,
    'Rf'                => $r['rf']    !== null ? (int)$r['rf']      : null,
    'Rg'                => $r['rg']    !== null ? (int)$r['rg']      : null,
    'rfBins'            => $meta['rfBins']  ?? null,
    'rcsBins'           => $meta['rcsBins'] ?? [],
    'rhsBins'           => $meta['rhsBins'] ?? [],
    'ra'                => isset($meta['ra']) ? (float)$meta['ra'] : null,
    'r9'                => isset($meta['r9']) ? (float)$meta['r9'] : null,
    'ri'                => $riOut,
    'instrumentModel'   => $meta['instrumentMeta']['instrument_model']   ?? null,
    'instrumentVersion' => $meta['instrumentMeta']['instrument_version'] ?? null,
    'rawHeaders'        => $meta['instrumentMeta']['raw_headers']        ?? null,
    'shareToken'        => $r['share_token'] ?? null,
    'isPublic'          => ((int)($r['is_public'] ?? 1)) === 1,
    'private'           => ((int)($r['is_public'] ?? 1)) === 0,
    'userId'            => (int)$r['user_id'],
    'folderId'          => $r['folder_id'] !== null ? (int)$r['folder_id'] : null,
    'userName'          => $ownerName,
    'createdAt'         => $r['created_at'],
];
if (!empty($r['spd_data'])) {
    $pairs2      = json_decode($r['spd_data'], true);
    $out['wls']  = array_column($pairs2, 0);
    $out['vals'] = array_column($pairs2, 1);
}
$out['categories'] = report_categories_map($db, (int)$r['id']);
json_out($out);
require_once __DIR__ . '/_core/categories.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/auth.php';
cors_headers();
header('Cache-Control: no-store, no-cache, must-revalidate');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);
preg_match('#/api/explore/(\d+)$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$id = isset($m[1]) ? (int)$m[1] : 0;
if (!$id) json_error('Invalid ID', 400);
$db = get_db();
$myId = 0;
try { $hdr = get_auth_header(); if (str_starts_with($hdr, 'Bearer ')) { $tok = jwt_verify(substr($hdr, 7)); if ($tok && isset($tok['id'])) $myId = (int)$tok['id']; } } catch (\Throwable $e) {}
$shareTok = (string)($_GET['t'] ?? '');
$isSuper = false; if ($myId > 0) { try { $ssq = $db->prepare('SELECT is_super_admin FROM users WHERE id=?'); $ssq->execute([$myId]); $isSuper = ((int)$ssq->fetchColumn()) === 1; } catch (\Throwable $e) {} } $s  = $isSuper ? $db->prepare('SELECT * FROM reports WHERE id=?') : $db->prepare('SELECT * FROM reports WHERE id=? AND (is_public=1 OR user_id=? OR (share_token IS NOT NULL AND share_token=?))');
$s->execute($isSuper ? [$id] : [$id, $myId, $shareTok]);
$r  = $s->fetch();
if (!$r) json_error('Not found', 404);
$meta = json_decode($r['meta'] ?: '{}', true) ?? [];
spd_recompute($r, $meta);
// Backfill metrics not persisted by older uploads, so the explore report matches the shared report exactly.
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
    'id'                => (int)$r['id'],
    'label'             => $r['label'],
    'sourceType'        => $r['source_type'] ?? null,
    'notes'             => $r['notes'],
    'cct'               => $r['cct']   !== null ? (int)$r['cct']     : null,
    'duv'               => $r['duv']   !== null ? (float)$r['duv']   : null,
    'x'                 => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,
    'y'                 => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,
    'Rf'                => $r['rf']    !== null ? (int)$r['rf']      : null,
    'Rg'                => $r['rg']    !== null ? (int)$r['rg']      : null,
    'rfBins'            => $meta['rfBins']  ?? null,
    'rcsBins'           => $meta['rcsBins'] ?? [],
    'rhsBins'           => $meta['rhsBins'] ?? [],
    'ra'                => isset($meta['ra']) ? (float)$meta['ra'] : null,
    'r9'                => isset($meta['r9']) ? (float)$meta['r9'] : null,
    'ri'                => $riOut,
    'instrumentModel'   => $meta['instrumentMeta']['instrument_model']   ?? null,
    'instrumentVersion' => $meta['instrumentMeta']['instrument_version'] ?? null,
    'rawHeaders'        => $meta['instrumentMeta']['raw_headers']        ?? null,
    'shareToken'        => $r['share_token'] ?? null,
    'isPublic'          => ((int)($r['is_public'] ?? 1)) === 1,
    'private'           => ((int)($r['is_public'] ?? 1)) === 0,
    'userId'            => (int)$r['user_id'],
    'folderId'          => $r['folder_id'] !== null ? (int)$r['folder_id'] : null,
    'createdAt'         => $r['created_at'],
];
if (!empty($r['spd_data'])) {
    $pairs2      = json_decode($r['spd_data'], true);
    $out['wls']  = array_column($pairs2, 0);
    $out['vals'] = array_column($pairs2, 1);
}
$out['categories'] = report_categories_map($db, (int)$r['id']);
json_out($out);