<?php
declare(strict_types=1);

// api/reports_flicker.php -- GET /api/reports/{id}/flicker
// Every flicker reading attached to a report, WITH waveforms (the report page compares them).
// Visible to the owner, a super admin, anyone for a public report, or with the report's share token (?t=).

ini_set('display_errors', '0');
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/flicker.php';

cors_headers();
header('Cache-Control: no-store');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('GET required', 405);

preg_match('#/api/reports/(\d+)/flicker/?$#', parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), $m);
$rid = isset($m[1]) ? (int)$m[1] : 0;
if (!$rid) json_error('Invalid ID', 400);

$db = get_db();
ensure_flicker_schema($db);
$myId = 0;
try { $hdr = get_auth_header(); if (str_starts_with($hdr, 'Bearer ')) { $tok = jwt_verify(substr($hdr, 7)); if ($tok && isset($tok['id'])) $myId = (int)$tok['id']; } } catch (\Throwable $e) {}

if (!flicker_can_view_report($db, $rid, $myId, (string)($_GET['t'] ?? ''))) json_error('Not found', 404);

$s = $db->prepare(flicker_select_sql(true) . ' WHERE f.report_id=? ORDER BY COALESCE(f.captured_at, f.created_at) ASC, f.id ASC');
$s->execute([$rid]);
json_out(['readings' => array_map(fn($r) => flicker_out($r, true), $s->fetchAll())]);
