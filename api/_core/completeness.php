<?php
declare(strict_types=1);

// api/_core/completeness.php
//
// Report "completeness" for the Explore / My Reports cards: how much of the lighting details are filled in.
// The LED fields are what the site's comparisons and the app's LED suggestions rely on, so they carry most of
// the weight; flashlight brand/model, current, lumens, optic and notes count for less. Also reports which
// reports have a flicker reading attached. Only scores and field names leave here, never values.

const COMPLETENESS_WEIGHTS = [
    'led_brand'   => 20,
    'led_model'   => 20,
    'led_cct'     => 20,
    'light_brand' => 8,
    'light_model' => 8,
    'current'     => 6,
    'lumens'      => 6,
    'optic'       => 6,
    'notes'       => 6,
];

/** @return array<int, array{score:int, missing:string[], hasFlicker:bool}> keyed by report id */
function completeness_for(PDO $db, array $ids): array {
    $ids = array_values(array_unique(array_map('intval', $ids)));
    $out = [];
    if (!$ids) return $out;
    $ph = implode(',', array_fill(0, count($ids), '?'));

    $have = [];   // id => [kind => true]
    try {
        $s = $db->prepare("SELECT DISTINCT report_id, kind FROM report_categories WHERE report_id IN ($ph)");
        $s->execute($ids);
        foreach ($s->fetchAll() as $r) $have[(int)$r['report_id']][$r['kind']] = true;
    } catch (\Throwable $e) {}
    try {
        $s = $db->prepare("SELECT id FROM reports WHERE id IN ($ph) AND notes IS NOT NULL AND TRIM(notes) <> ''");
        $s->execute($ids);
        foreach ($s->fetchAll() as $r) $have[(int)$r['id']]['notes'] = true;
    } catch (\Throwable $e) {}

    $flick = [];
    try {
        $s = $db->prepare("SELECT DISTINCT report_id FROM flicker_readings WHERE report_id IN ($ph)");
        $s->execute($ids);
        foreach ($s->fetchAll() as $r) $flick[(int)$r['report_id']] = true;
    } catch (\Throwable $e) {}

    foreach ($ids as $id) {
        $score = 0; $missing = [];
        foreach (COMPLETENESS_WEIGHTS as $kind => $w) {
            if (!empty($have[$id][$kind])) $score += $w; else $missing[] = $kind;
        }
        $out[$id] = ['score' => $score, 'missing' => $missing, 'hasFlicker' => !empty($flick[$id])];
    }
    return $out;
}
