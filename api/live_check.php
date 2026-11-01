<?php
// api/live_check.php
//
// Looks for live stations that have gone silent and emails their owners. The station pages and the app also run this
// check whenever they are used, but a dead phone sends nothing, so run it from cron every minute or two:
//
//   * * * * * php /path/to/api/live_check.php
//
// Or over HTTP if LIVE_CHECK_KEY is set in the environment: /api/live_check.php?key=SECRET

require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/live_station.php';

if (PHP_SAPI !== 'cli') {
    $key = getenv('LIVE_CHECK_KEY') ?: '';
    if ($key === '' || !hash_equals($key, (string)($_GET['key'] ?? ''))) { http_response_code(403); exit('Forbidden'); }
    header('Content-Type: text/plain');
}
echo 'alerts sent: ' . live_check_all(get_db(), true) . "\n";
