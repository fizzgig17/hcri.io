<?php
// router.php
/**
 * Dev router for: php -S localhost:8000 router.php
 * Mirrors the .htaccess rules without needing Apache.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Decode percent-encoded characters (e.g. %20 for spaces) before any
// filesystem or route matching, so filenames with spaces or other
// special characters resolve correctly instead of falling through to
// the SPA fallback.
$uri = urldecode($uri);
$uri = rtrim($uri, '/') ?: '/';

// Strip any subdirectory prefix (not needed for built-in server, but safe)
$base = dirname($_SERVER['SCRIPT_FILENAME']);

// Block sensitive paths
if (preg_match('#(^|/)data(/|$)#', $uri) ||
    preg_match('#(^|/)vendor(/|$)#', $uri) ||
    preg_match('#(^|/)api/_core(/|$)#', $uri)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Forbidden']);
    exit;
}

// API routes
if (str_starts_with($uri, '/api/')) {
    if (preg_match('#^/api/auth/(login|register|me)$#', $uri, $m)) {
        require $base . '/api/auth/' . $m[1] . '.php'; exit;
    }
    if (preg_match('#^/api/reports/(\d+)/pdf$#', $uri)) {
        require $base . '/api/reports/pdf.php'; exit;
    }
    if (preg_match('#^/api/reports/(\d+)$#', $uri)) {
        require $base . '/api/reports/report.php'; exit;
    }
    if ($uri === '/api/reports') {
        require $base . '/api/reports/index.php'; exit;
    }
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not found']);
    exit;
}

// Static files
if ($uri !== '/' && is_file($base . $uri)) {
    return false; // let built-in server handle it
}

// SPA fallback
require $base . '/index.php';