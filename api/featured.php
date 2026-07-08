<?php

declare(strict_types=1);

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/settings.php';

cors_headers();
header('Cache-Control: public, max-age=30');

// Public: returns up to 3 admin-chosen featured reports with key details only.
// Full report data is fetched on click via /api/explore/{id}.
$out = [];
try {
    $db  = get_db();
    $ids = setting_get($db, 'featured_reports', []);
    if (is_array($ids) && $ids) {
        $ids = array_values(array_filter(array_map('intval', $ids), fn($v) => $v > 0));
        $ids = array_slice($ids, 0, 3);
        if ($ids) {
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $st = $db->prepare("SELECT id, label, cct, duv, rf, rg, meta FROM reports WHERE id IN ($ph) AND is_public = 1");
            $st->execute($ids);
            $byId = [];
            foreach ($st->fetchAll() as $r) {
                $m = json_decode($r['meta'] ?: '{}', true) ?: [];
                $byId[(int)$r['id']] = [
                    'id'    => (int)$r['id'],
                    'label' => $r['label'],
                    'cct'   => $r['cct'] !== null ? (int)$r['cct']   : null,
                    'duv'   => $r['duv'] !== null ? (float)$r['duv'] : null,
                    'Rf'    => $r['rf']  !== null ? (int)$r['rf']    : null,
                    'Rg'    => $r['rg']  !== null ? (int)$r['rg']    : null,
                    'ra'    => isset($m['ra']) ? (float)$m['ra'] : null,
                    'r9'    => isset($m['r9']) ? (float)$m['r9'] : null,
                ];
            }
            foreach ($ids as $id) {
                if (isset($byId[$id])) $out[] = $byId[$id]; // preserve admin order
            }
        }
    }
} catch (\Throwable $e) {
    $out = [];
}

json_out($out);