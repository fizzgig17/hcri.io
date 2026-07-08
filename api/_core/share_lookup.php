<?php
// api/_core/share_lookup.php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/spd.php';

/**
 * Fetch a public/shared report by its share token and return a normalized
 * array with the headline metrics and the SPD curve. Backfills metrics from
 * the stored SPD when older uploads didn't persist them. Returns null if the
 * token is unknown. Never throws — on any error it returns whatever it has.
 */
function load_shared_report(PDO $db, string $token): ?array
{
    try {
        $s = $db->prepare('SELECT * FROM reports WHERE share_token = ?');
        $s->execute([$token]);
        $r = $s->fetch();
    } catch (\Throwable $e) {
        return null;
    }
    if (!$r) return null;
    return hcri_share_normalize($db, $r);
}

/** Load a PUBLIC report by id — no token needed, since it's already public. */
function load_public_report(PDO $db, int $id): ?array
{
    try {
        $s = $db->prepare('SELECT * FROM reports WHERE id = ? AND is_public = 1');
        $s->execute([$id]);
        $r = $s->fetch();
    } catch (\Throwable $e) {
        return null;
    }
    if (!$r) return null;
    return hcri_share_normalize($db, $r);
}

/** Shared normalizer for both share-token and public-by-id loads. */
function hcri_share_normalize(PDO $db, array $r): ?array
{

    $meta  = json_decode($r['meta'] ?: '{}', true) ?? [];
    spd_recompute($r, $meta);
    $pairs = !empty($r['spd_data']) ? json_decode($r['spd_data'], true) : null;

    $needBackfill = $pairs && (
        empty($meta['ra']) || empty($meta['r9']) ||
        $r['cct'] === null || $r['rf'] === null || $r['rg'] === null ||
        $r['duv'] === null || $r['cie_x'] === null || $r['cie_y'] === null
    );
    if ($needBackfill) {
        try {
            if (empty($meta['instrumentMeta']) && !empty($r['file_name'])) {
                $fp = __DIR__ . '/../../uploads/' . $r['file_name'];
                if (is_file($fp) && preg_match('/\.(csv|txt|tsv|sp)$/i', (string)$r['file_name'])) {
                    $cp = parse_csv(file_get_contents($fp));
                    $meta['instrumentMeta'] = $cp['instrument_meta'] ?? [];
                }
            }
            $wls = array_column($pairs, 0);
            $vals = array_column($pairs, 1);
            if ($wls && $vals) {
                $res = analyze_spd($wls, $vals, $meta['instrumentMeta'] ?? []);
                if (empty($meta['ra'])) $meta['ra'] = $res['ra'] ?? null;
                if (empty($meta['r9'])) $meta['r9'] = $res['r9'] ?? null;
                if ($r['cct']   === null && isset($res['cct'])) $r['cct']   = $res['cct'];
                if ($r['duv']   === null && isset($res['duv'])) $r['duv']   = $res['duv'];
                if ($r['cie_x'] === null && isset($res['x']))   $r['cie_x'] = $res['x'];
                if ($r['cie_y'] === null && isset($res['y']))   $r['cie_y'] = $res['y'];
                if ($r['rf']    === null && isset($res['Rf']))  $r['rf']    = $res['Rf'];
                if ($r['rg']    === null && isset($res['Rg']))  $r['rg']    = $res['Rg'];
            }
        } catch (\Throwable $e) { /* keep whatever we have */ }
    }

    $wls = $vals = [];
    if ($pairs) {
        $wls  = array_map('floatval', array_column($pairs, 0));
        $vals = array_map('floatval', array_column($pairs, 1));
    }

    return [
        'id'           => (int)$r['id'],
        'label'        => $r['label'] ?: 'SPD Report',



        'cct'          => $r['cct']   !== null ? (int)$r['cct']     : null,
        'duv'          => $r['duv']   !== null ? (float)$r['duv']   : null,
        'x'            => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,
        'y'            => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,
        'Rf'           => $r['rf']    !== null ? (int)$r['rf']      : null,
        'Rg'           => $r['rg']    !== null ? (int)$r['rg']      : null,
        'ra'           => isset($meta['ra']) ? (float)$meta['ra'] : null,
        'r9'           => isset($meta['r9']) ? (float)$meta['r9'] : null,
        'rcsBins'      => (!empty($meta['rcsBins']) ? array_values($meta['rcsBins']) : (isset($res['rcsBins']) ? $res['rcsBins'] : [])),
        'rhsBins'      => (!empty($meta['rhsBins']) ? array_values($meta['rhsBins']) : (isset($res['rhsBins']) ? $res['rhsBins'] : [])),
        'rlsBins'      => (!empty($meta['rlsBins']) ? array_values($meta['rlsBins']) : (isset($res['rlsBins']) ? $res['rlsBins'] : [])),
        'binRgb'       => (!empty($meta['binRgb']) ? array_values($meta['binRgb']) : (isset($res['binRgb']) ? $res['binRgb'] : [])),
        'binRgbRef'    => (!empty($meta['binRgbRef']) ? array_values($meta['binRgbRef']) : (isset($res['binRgbRef']) ? $res['binRgbRef'] : [])),
        'isPublic'     => !empty($r['is_public']),
        'shareToken'   => $r['share_token'],
        'wls'          => $wls,
        'vals'         => $vals,
    ];
}

/**
 * One-line metric summary for og:description, e.g.
 * "CCT 4048K · Duv -0.0014 · Ra 94 · R9 82 · Rf 92 · Rg 99".
 */
function share_metric_summary(array $rep): string
{
    $bits = [];
    if ($rep['cct'] !== null) $bits[] = 'CCT ' . $rep['cct'] . 'K';
    if ($rep['duv'] !== null) $bits[] = 'Duv ' . sprintf('%+.4f', $rep['duv']);
    if ($rep['ra']  !== null) $bits[] = 'Ra ' . (int)round($rep['ra']);
    if ($rep['r9']  !== null) $bits[] = 'R9 ' . (int)round($rep['r9']);
    if ($rep['Rf']  !== null) $bits[] = 'Rf ' . $rep['Rf'];
    if ($rep['Rg']  !== null) $bits[] = 'Rg ' . $rep['Rg'];
    return implode(' · ', $bits);
}