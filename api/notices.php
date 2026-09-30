<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';

cors_headers();
header('Cache-Control: public, max-age=30');

$out = [];
try {
    $db = get_db();
    $rows = $db->query(
        "SELECT id, type, location, message, starts_at, ends_at
           FROM notices
          WHERE enabled = 1 AND starts_at <= NOW() AND ends_at >= NOW()
          ORDER BY id DESC"
    )->fetchAll();
    $out = array_map(fn($r) => [
        'id'       => (int)$r['id'],
        'type'     => $r['type'],
        'location' => $r['location'],
        'message'  => $r['message'],
        'startsAt' => $r['starts_at'],
        'endsAt'   => $r['ends_at'],
    ], $rows);
} catch (\Throwable $e) {
    $out = [];
}

json_out($out);