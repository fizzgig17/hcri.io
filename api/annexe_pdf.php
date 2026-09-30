<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/../vendor/fpdf/fpdf.php';

cors_headers();

// Allow both authenticated and guest use
$hdr = get_auth_header();
if ($hdr && str_starts_with($hdr, 'Bearer ')) {
    jwt_verify(substr($hdr, 7)); // verify but don't require
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('POST required', 405);

$body = json_decode(file_get_contents('php://input'), true);
$png  = $body['png']  ?? '';   // base64 PNG of canvas
$name = $body['name'] ?? 'TM30_AnnexE';

if (!$png) json_error('No PNG data', 400);

// Decode base64 (strip data URI prefix if present)
$png = preg_replace('#^data:image/\w+;base64,#', '', $png);
$imgData = base64_decode($png);
if (!$imgData) json_error('Invalid PNG data', 400);

// Write to temp file (FPDF needs a file path for PNG)
$tmp = tempnam(sys_get_temp_dir(), 'hcri_') . '.png';
file_put_contents($tmp, $imgData);

// Get image dimensions
[$imgW, $imgH] = getimagesize($tmp);

// PDF page size: match canvas aspect ratio at letter width (215.9mm)
$pageW = 215.9; // mm — US Letter width
$pageH = $pageW * ($imgH / $imgW);

class AnnexPDF extends FPDF {
    function __construct($w, $h) {
        parent::__construct('P', 'mm', [$w, $h]);
    }
}

$pdf = new AnnexPDF($pageW, $pageH);
$pdf->SetMargins(0, 0, 0);
$pdf->SetAutoPageBreak(false);
$pdf->AddPage();

// Place image to fill page exactly
$pdf->Image($tmp, 0, 0, $pageW, $pageH, 'PNG');

unlink($tmp);

// Output as download
$safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $name);
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $safeName . '_TM30_AnnexE.pdf"');
header('Cache-Control: no-cache');
$pdfData = $pdf->Output('S');
echo $pdfData;
exit;