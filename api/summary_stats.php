<?php
// api/_core/summary_stats.php
// Helpers to compute aggregate statistics + histograms for the Explore rollup
// ("summary") report. Pure functions — no DB, no I/O.
declare(strict_types=1);

/**
 * Descriptive statistics for a list of numbers.
 * Returns nulls (with n=0) when there is no data.
 */
function summary_stats(array $vals): array {
    $vals = array_values(array_filter($vals, fn($v) => $v !== null && is_numeric($v)));
    $vals = array_map('floatval', $vals);
    $n = count($vals);
    if ($n === 0) {
        return ['n' => 0, 'min' => null, 'max' => null, 'mean' => null,
                'median' => null, 'std' => null, 'p25' => null, 'p75' => null];
    }
    sort($vals);
    $sum  = array_sum($vals);
    $mean = $sum / $n;
    $var  = 0.0;
    foreach ($vals as $v) $var += ($v - $mean) ** 2;
    $std  = $n > 1 ? sqrt($var / ($n - 1)) : 0.0;

    $pct = function (float $p) use ($vals, $n) {
        if ($n === 1) return $vals[0];
        $rank = $p * ($n - 1);
        $lo   = (int)floor($rank);
        $hi   = (int)ceil($rank);
        $frac = $rank - $lo;
        return $vals[$lo] + ($vals[$hi] - $vals[$lo]) * $frac;
    };

    return [
        'n'      => $n,
        'min'    => round($vals[0], 4),
        'max'    => round($vals[$n - 1], 4),
        'mean'   => round($mean, 4),
        'median' => round($pct(0.5), 4),
        'std'    => round($std, 4),
        'p25'    => round($pct(0.25), 4),
        'p75'    => round($pct(0.75), 4),
    ];
}

/**
 * Histogram of values into `bins` buckets spanning [lo, hi].
 * If lo/hi are null, they are derived from the data (with a little padding).
 * Returns ['bins' => [{x0,x1,mid,count}], 'lo' => float, 'hi' => float].
 */
function summary_hist(array $vals, ?float $lo = null, ?float $hi = null, int $bins = 20): array {
    $vals = array_values(array_filter($vals, fn($v) => $v !== null && is_numeric($v)));
    $vals = array_map('floatval', $vals);
    if (!$vals) return ['bins' => [], 'lo' => 0, 'hi' => 0];

    if ($lo === null) $lo = min($vals);
    if ($hi === null) $hi = max($vals);
    if ($hi <= $lo) { $hi = $lo + 1; }       // avoid zero-width range
    $bins = max(1, $bins);
    $w = ($hi - $lo) / $bins;

    $counts = array_fill(0, $bins, 0);
    foreach ($vals as $v) {
        if ($v < $lo || $v > $hi) continue;  // clamp to range (values can be filtered)
        $idx = (int)floor(($v - $lo) / $w);
        if ($idx >= $bins) $idx = $bins - 1;
        if ($idx < 0) $idx = 0;
        $counts[$idx]++;
    }
    $out = [];
    for ($i = 0; $i < $bins; $i++) {
        $x0 = $lo + $i * $w;
        $x1 = $x0 + $w;
        $out[] = ['x0' => round($x0, 4), 'x1' => round($x1, 4),
                  'mid' => round(($x0 + $x1) / 2, 4), 'count' => $counts[$i]];
    }
    return ['bins' => $out, 'lo' => round($lo, 4), 'hi' => round($hi, 4)];
}

/**
 * Build the full aggregate payload for the Explore rollup report from raw
 * report rows (each with cct, duv, cie_x, cie_y, rf, rg, meta).
 */
function build_explore_summary(array $rows): array {
    $cct = $duv = $rf = $rg = $ra = $r9 = [];
    $cctDuv = $rfRg = [];
    $tint = ['rosy' => 0, 'neutral' => 0, 'green' => 0];

    foreach ($rows as $r) {
        $c  = isset($r['cct'])   && $r['cct']   !== null ? (float)$r['cct']   : null;
        $dv = isset($r['duv'])   && $r['duv']   !== null ? (float)$r['duv']   : null;
        $f  = isset($r['rf'])    && $r['rf']    !== null ? (float)$r['rf']    : null;
        $g  = isset($r['rg'])    && $r['rg']    !== null ? (float)$r['rg']    : null;
        $x  = isset($r['cie_x']) && $r['cie_x'] !== null ? (float)$r['cie_x'] : null;
        $y  = isset($r['cie_y']) && $r['cie_y'] !== null ? (float)$r['cie_y'] : null;

        $meta = [];
        if (!empty($r['meta'])) { $meta = json_decode((string)$r['meta'], true) ?: []; }
        $raV = isset($meta['ra']) && is_numeric($meta['ra']) ? (float)$meta['ra'] : null;
        $r9V = isset($meta['r9']) && is_numeric($meta['r9']) ? (float)$meta['r9'] : null;

        if ($c  !== null) $cct[] = $c;
        if ($dv !== null) $duv[] = $dv;
        if ($f  !== null) $rf[]  = $f;
        if ($g  !== null) $rg[]  = $g;
        if ($raV !== null) $ra[] = $raV;
        if ($r9V !== null) $r9[] = $r9V;

        if ($c !== null && $dv !== null && count($cctDuv) < 4000) $cctDuv[] = [round($c), round($dv, 5)];
        if ($f !== null && $g !== null && count($rfRg)   < 4000) $rfRg[]   = [round($f, 1), round($g, 1)];

        if ($dv !== null) {
            if ($dv < -0.002)      $tint['rosy']++;
            elseif ($dv > 0.002)   $tint['green']++;
            else                   $tint['neutral']++;
        }
    }

    return [
        'count'       => count($rows),
        'generatedAt' => gmdate('c'),
        'metrics' => [
            'cct' => ['label' => 'CCT (K)',         'stats' => summary_stats($cct), 'hist' => summary_hist($cct, null, null, 24)],
            'ra'  => ['label' => 'CRI (Ra)',        'stats' => summary_stats($ra),  'hist' => summary_hist($ra, 0, 100, 20)],
            'r9'  => ['label' => 'R9',              'stats' => summary_stats($r9),  'hist' => summary_hist($r9, -100, 100, 20)],
            'duv' => ['label' => 'Duv',             'stats' => summary_stats($duv), 'hist' => summary_hist($duv, null, null, 24)],
            'Rf'  => ['label' => 'TM-30 Rf',        'stats' => summary_stats($rf),  'hist' => summary_hist($rf, 0, 100, 20)],
            'Rg'  => ['label' => 'TM-30 Rg',        'stats' => summary_stats($rg),  'hist' => summary_hist($rg, 60, 140, 20)],
        ],
        'tint'    => $tint,
        'scatter' => ['cctDuv' => $cctDuv, 'rfRg' => $rfRg],
    ];
}