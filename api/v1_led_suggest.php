<?php
// api/v1_led_suggest.php
declare(strict_types=1);

// POST /api/v1/led_suggest      body: {"wls":[...], "vals":[...]}
//
// "Looks like Nichia 519A, 4000 K": compares the spectrum with reports that already have an LED
// brand and model (public AND private ones, so the match uses all the data on the site), and answers with the
// clear winner, or `suggestion: null` when nothing is clearly ahead. Needs a personal API token, the same one
// the app uploads with. Only brand / model / CCT strings and aggregate numbers come back, never a report id,
// label, owner or spectrum; see led_suggest() for the single-owner safeguard.

require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/api_token.php';
require_once __DIR__ . '/_core/led_lists.php';

cors_headers();
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed -- POST JSON to this endpoint', 405);

$db   = get_db();
$user = user_from_api_token($db, api_token_from_request());
if (!$user) json_error('Invalid or missing API token. Send "Authorization: Bearer <token>".', 401);

$b    = body();
$wls  = $b['wls']  ?? null;
$vals = $b['vals'] ?? null;
if (!is_array($wls) || !is_array($vals) || count($wls) < 10 || count($wls) !== count($vals) || count($wls) > 5000) {
    json_error('Send {"wls": [...], "vals": [...]} with matching arrays of at least 10 points.', 400);
}

json_out(led_suggest($db, $wls, $vals, (int)$user['id']));
