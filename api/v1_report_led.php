<?php
// api/v1_report_led.php
declare(strict_types=1);

// POST /api/v1/reports/{id}/led      body: {"brand":"Nichia","model":"519A","cct":"4000"}   (any subset)
//
// Lets the app's API token set the LED(s), light details and notes on a report the token's owner uploaded. Deliberately
// its own narrow endpoint (like v1_share.php) so an upload token can't edit anything else about a report.
// Values that aren't in the curated lists are queued for admin review (category_requests) instead of being
// added to the lists directly; admins' own values are added straight away.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/led_lists.php';
require_once __DIR__ . '/_core/categories.php';
require_once __DIR__ . '/_core/report_leds.php';

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

// Other categories (light brand/model, optic, lumens, current): one value each, as before.
$other = ['light_brand' => 'light_brand', 'light_model' => 'light_model', 'optic' => 'optic', 'lumens' => 'lumens', 'current' => 'current'];
$details = [];
foreach ($other as $field => $kind) if (isset($b[$field])) $details[$kind] = (string)$b[$field];
$result = led_save_report_details($db, $reportId, $user, $details);
$saved = (array)$result['saved'];
$requested = (array)$result['requested'];

if (isset($b['leds']) && is_array($b['leds'])) {
    // A list of LEDs: [{"brand":"Nichia","model":"519A","cct":"3000K"}, {...}]. Replaces the report's LEDs.
    $r = report_leds_set($db, $reportId, $user, array_values($b['leds']));
    $result['leds'] = $r['leds'];
    foreach ((array)$r['requested'] as $k => $vals) $requested[$k] = $vals;
    if ($r['leds']) foreach (REPORT_LED_FIELDS as $field => $kind) if ($r['leds'][0][$field] !== null) $saved[$kind] = $r['leds'][0][$field];
} elseif (isset($b['brand']) || isset($b['model']) || isset($b['cct'])) {
    // Single LED (older form): sets brand/model/cct on LED 1 and leaves any other LEDs alone.
    $leds = report_leds_get($db, $reportId);
    if (!$leds) {
        $cm = report_categories_map($db, $reportId);
        $one = fn($k) => count($cm[$k] ?? []) === 1 ? (string)$cm[$k][0]['value'] : null;
        $leds = [['brand' => $one('led_brand'), 'model' => $one('led_model'), 'cct' => $one('led_cct')]];
    }
    $rq = [];
    foreach (REPORT_LED_FIELDS as $field => $kind) {
        $v = trim((string)($b[$field] ?? ''));
        if ($v === '') continue;
        $canon = report_led_resolve($db, $kind, $v, $user, $reportId, $rq);
        if ($canon !== null) { $leds[0][$field] = $canon; $saved[$kind] = $canon; }
    }
    foreach ($rq as $k => $vals) $requested[$k] = $vals[0];
    $r = report_leds_set($db, $reportId, $user, $leds);
    $result['leds'] = $r['leds'];
}
$result['saved'] = (object)$saved;
$result['requested'] = (object)$requested;
if (array_key_exists('notes', $b)) {
    $notes = trim((string)$b['notes']);
    if (mb_strlen($notes) > 10000) json_error('Notes too long (max 10000 characters)', 400);
    $db->prepare('UPDATE reports SET notes = ? WHERE id = ?')->execute([$notes === '' ? null : $notes, $reportId]);
    $result['notes'] = $notes === '' ? null : $notes;
}
json_out($result);
