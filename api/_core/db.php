<?php
declare(strict_types=1);

// api/_core/db.php
//
// Database config. Real secrets are supplied via api/_core/secrets.local.php
// (gitignored, server-only -- see secrets.local.php.example) rather than
// hardcoded here, so this file is safe to be public.
$secretsFile = __DIR__ . '/secrets.local.php';
if (is_file($secretsFile)) require_once $secretsFile;

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'dcvgnomgak_spd_analyzer');
define('DB_USER', getenv('DB_USER') ?: 'dcvgnomgak_spd_admin');
define('DB_PASS', getenv('DB_PASS') ?: '');

function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}
