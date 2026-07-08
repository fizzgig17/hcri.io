<?php
declare(strict_types=1);

// ── MAMP Default Credentials ──────────────────────────────────────────────────
// These are the default MAMP credentials for local development.
// Rename this file to db.php to use it.
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'spd_analyzer');
define('DB_USER', 'root');
define('DB_PASS', 'root');

function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=latin1';

    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}
