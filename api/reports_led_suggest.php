<?php
declare(strict_types=1);

// api/reports_led_suggest.php -- GET /api/reports/{id}/led_suggest
// "Looks like ..." for one of YOUR reports, from its spectrum and its title. Same matcher the app uses
// (api/_core/led_lists.php); returns only brand / model / CCT text. Owner only.

ini_set('display_errors', '0');
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/led_lists.php';

cors_headers();
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);

preg_match('#/api/reports/(\d+)/led_suggest/?$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$rid = isset($m[1]) ? (int)$m[1] : 0;
if (!$rid) json_error('Invalid ID', 400);

$user = require_auth();
$db = get_db();
$s = $db->prepare('SELECT user_id, label, spd_data FROM reports WHERE id = ?');
$s->execute([$rid]);
$r = $s->fetch();
if (!$r || (int)$r['user_id'] !== (int)$user['id']) json_error('Not found', 404);

$pairs = json_decode((string)$r['spd_data'], true);
if (!is_array($pairs) || count($pairs) < 10) json_out(['suggestion' => null, 'alternatives' => []]);

json_out(led_suggest($db, array_column($pairs, 0), array_column($pairs, 1), (int)$user['id'], mb_substr((string)$r['label'], 0, 300)));
