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

cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) json_error('Invalid JSON body', 400);

$row = [
    'label'      => $data['label']      ?? 'Guest Report',
    'source_type'=> $data['sourceType'] ?? 'csv',
    'cct'        => $data['cct']        ?? null,
    'duv'        => $data['duv']        ?? null,
    'cie_x'      => $data['x']          ?? null,
    'cie_y'      => $data['y']          ?? null,
    'rf'         => $data['Rf']         ?? null,
    'rg'         => $data['Rg']         ?? null,
    'meta'       => json_encode([
        'rfBins' => $data['rfBins'] ?? [],
        'ra'     => $data['ra']     ?? null,
        'r9'     => $data['r9']     ?? null,
    ]),
    'created_at'   => $data['createdAt']   ?? date('Y-m-d H:i:s'),
    'categories'   => $data['categories']  ?? [],



    'notes'        => $data['notes']        ?? null,
];

$wls    = $data['wls']  ?? null;
$vals   = $data['vals'] ?? null;
$meta   = json_decode($row['meta'], true) ?? [];
$rfBins = $meta['rfBins'] ?? array_fill(0, 16, 75.0);

require_once __DIR__ . '/_core/tm30_pdf_builder.php';

$pdf   = build_tm30_report($row, $rfBins, $wls, $vals);
$fname = preg_replace('/[^a-zA-Z0-9_-]/', '_', $row['label']) . '_TM30.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $fname . '"');
header('Cache-Control: private, max-age=0');
$pdf->Output('I');