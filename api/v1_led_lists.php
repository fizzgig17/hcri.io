<?php
// api/v1_led_lists.php
declare(strict_types=1);

// GET /api/v1/led_lists
//
// The LED brand / model / CCT dropdown values for the hCRI Companion app, plus which models belong to
// which brand. Public and read-only (these are the same curated values anyone can see on the site), so a
// freshly installed app can fill its pickers before the person has created an API token.
//
// Cheap to poll: the response carries a `version` and an ETag; send the ETag back in If-None-Match and an
// unchanged list answers 304 with no body.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/led_lists.php';

cors_headers();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$payload = led_lists_payload(get_db());
$etag = '"' . $payload['version'] . '"';

header('ETag: ' . $etag);
header('Cache-Control: public, max-age=300');

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    http_response_code(304);
    exit;
}
json_out($payload);
