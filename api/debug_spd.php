<?php
// Temporary debug endpoint - DELETE after fixing
// Visit: http://localhost/spd/index.php/api/debug_spd
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/spd.php';
require_once __DIR__ . '/_core/response.php';

header('Content-Type: application/json');

$db = get_db();

// Get most recent report with SPD data
$s = $db->prepare('SELECT * FROM reports ORDER BY id DESC LIMIT 1');
$s->execute([]);
$row = $s->fetch();

if (!$row || !$row['spd_data']) {
    echo json_encode(['error' => 'No report with SPD data found']);
    exit;
}

$pairs = json_decode($row['spd_data'], true);
$wls   = array_column($pairs, 0);
$vals  = array_column($pairs, 1);

$debug = [
    'label'      => $row['label'],
    'stored_rf'  => $row['rf'],
    'stored_rg'  => $row['rg'],
    'stored_cct' => $row['cct'],
    'spd_points' => count($wls),
    'wl_range'   => [min($wls), max($wls)],
    'val_range'  => [min($vals), max($vals)],
    'val_max_before_norm' => max($vals),
];

// Normalize
$maxVal = max($vals);
$valsNorm = array_map(fn($v) => $v / $maxVal, $vals);
$debug['val_max_after_norm'] = max($valsNorm);

// Compute
$spd = interpolate_spd($wls, $valsNorm);
$xyz = spd_to_xyz($spd);
$xy  = xyz_to_xy($xyz);
$cct = round(calc_cct($xy['x'], $xy['y']));
$debug['computed_cct'] = $cct;
$debug['computed_x']   = round($xy['x'], 5);
$debug['computed_y']   = round($xy['y'], 5);

['Rf'=>$Rf,'Rg'=>$Rg,'rfBins'=>$bins] = calc_rf_rg($spd, (float)$cct);
$debug['computed_rf']   = $Rf;
$debug['computed_rg']   = $Rg;
$debug['rfBins_sample'] = array_slice($bins, 0, 4);
$debug['rfBins_avg']    = round(array_sum($bins)/count($bins), 1);

echo json_encode($debug, JSON_PRETTY_PRINT);
