<?php
declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_exception_handler(function($e) {
    if (!headers_sent()) header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'line' => $e->getLine()]);
    exit;
});

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';

cors_headers();

$user = require_auth();
$db   = get_db();

preg_match('#/api/reports/(\d+)/pdf#', $_SERVER['REQUEST_URI'], $idm);
$id = isset($idm[1]) ? (int)$idm[1] : 0;
if (!$id) json_error('Invalid report ID', 400);

$s = $db->prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?');
$s->execute([$id, $user['id']]);
$row = $s->fetch();
if (!$row) json_error('Report not found', 404);

require_once __DIR__ . '/_core/categories.php';
$row['categories'] = report_categories_map($db, $id);

$meta   = json_decode($row['meta'] ?: '{}', true) ?? [];
$rfBins = $meta['rfBins'] ?? array_fill(0, 16, 75.0);
$wls = $vals = null;
if (!empty($row['spd_data'])) {
    $pairs = json_decode($row['spd_data'], true);
    $wls   = array_column($pairs, 0);
    $vals  = array_column($pairs, 1);
}

require_once __DIR__ . '/_core/tm30_pdf_builder.php';

$pdf   = build_tm30_report($row, $rfBins, $wls, $vals);
$fname = preg_replace('/[^a-zA-Z0-9_-]/', '_', $row['label'] ?? 'report') . '_TM30.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $fname . '"');
header('Cache-Control: private, max-age=0');
$pdf->Output('I');