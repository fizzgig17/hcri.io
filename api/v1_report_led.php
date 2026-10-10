<?php
// api/v1_report_led.php
declare(strict_types=1);

// POST /api/v1/reports/{id}/led      body: {"brand":"Nichia","model":"519A","cct":"4000"}   (any subset)
//
// Lets the app's API token set the LED brand / model / CCT on a report the token's owner uploaded. Deliberately
// its own narrow endpoint (like v1_share.php) so an upload token can't edit anything else about a report.
// Values that aren't in the curated lists are queued for admin review (category_requests) instead of being
// added to the lists directly; admins' own values are added straight away.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/led_lists.php';
require_once __DIR__ . '/_core/categories.php';

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed -- POST to this endpoint', 405);

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) json_error('Invalid or missing API token. Send "Authorization: Bearer <token>".', 401);

$reportId = (int)($_GET['id'] ?? 0);
if ($reportId <= 0) json_error('Invalid report id', 400);

$own = $db->prepare('SELECT user_id FROM reports WHERE id = ?');
$own->execute([$reportId]);
$row = $own->fetch();
if (!$row) json_error('Report not found', 404);
if ((int)$row['user_id'] !== (int)$user['id']) json_error('Forbidden', 403);

$b = body();
$map = ['brand' => 'led_brand', 'model' => 'led_model', 'cct' => 'led_cct',
        'light_brand' => 'light_brand', 'light_model' => 'light_model', 'optic' => 'optic',
        'lumens' => 'lumens', 'current' => 'current'];
$details = [];
foreach ($map as $field => $kind) if (isset($b[$field])) $details[$kind] = (string)$b[$field];
$result = led_save_report_details($db, $reportId, $user, $details);
if (array_key_exists('notes', $b)) {
    $notes = trim((string)$b['notes']);
    if (mb_strlen($notes) > 10000) json_error('Notes too long (max 10000 characters)', 400);
    $db->prepare('UPDATE reports SET notes = ? WHERE id = ?')->execute([$notes === '' ? null : $notes, $reportId]);
    $result['notes'] = $notes === '' ? null : $notes;
}
json_out($result);
