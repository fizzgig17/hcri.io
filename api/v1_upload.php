<?php
// api/v1_upload.php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/ingest.php';

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed — POST a file to this endpoint', 405);
}

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) {
    json_error('Invalid or missing API token. Send "Authorization: Bearer <token>".', 401);
}

$tmp = null;        // path to clean up if we created a temp file
$srcPath = null;
$origName = '';
$label = trim($_POST['label'] ?? $_GET['label'] ?? ($_SERVER['HTTP_X_LABEL'] ?? ''));

try {
    if (!empty($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
        // multipart/form-data, field "file" (same as the UI)
        if ($_FILES['file']['size'] > 10 * 1024 * 1024) json_error('File too large (max 10 MB)', 413);
        $srcPath  = $_FILES['file']['tmp_name'];
        $origName = $_FILES['file']['name'];
    } else {
        // raw body: curl --data-binary @file.csv  with a filename hint
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            json_error('No file provided. Use multipart field "file", or POST the raw body with an X-Filename header.', 400);
        }
        if (strlen($raw) > 10 * 1024 * 1024) json_error('File too large (max 10 MB)', 413);
        $origName = $_GET['filename'] ?? ($_SERVER['HTTP_X_FILENAME'] ?? '');
        if ($origName === '') {
            json_error('Provide a filename via the X-Filename header or ?filename= so the format can be detected.', 400);
        }
        $tmp = tempnam(sys_get_temp_dir(), 'hcri_');
        file_put_contents($tmp, $raw);
        $srcPath = $tmp;
    }

    $replaceId = (int)($_POST['replaceId'] ?? $_GET['replaceId'] ?? ($_SERVER['HTTP_X_REPLACE_ID'] ?? 0));
    $response = ingest_spd_upload($db, (int)$user['id'], $srcPath, $origName, $label, true, $replaceId);
    if ($tmp) @unlink($tmp);
    json_out($response, !empty($response['replaced']) ? 200 : 201);

} catch (\Throwable $e) {
    if ($tmp) @unlink($tmp);
    $msg = $e->getMessage();
    $code = (str_contains($msg, 'Could not extract') || str_contains($msg, 'Need') || str_contains($msg, 'Unsupported')) ? 422 : 500;
    json_error($msg, $code);
}