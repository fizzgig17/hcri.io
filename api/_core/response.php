<?php
declare(strict_types=1);

function cors_headers(): void {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
}

function json_out(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $msg, int $status = 400): never {
    json_out(['error' => $msg], $status);
}

function body(): array {
    static $b = null;
    if ($b !== null) return $b;
    $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?? [];
    return $b;
}

function method(string ...$allowed): void {
    if (!in_array($_SERVER['REQUEST_METHOD'], $allowed, true))
        json_error('Method not allowed', 405);
}

/** Logs the full exception server-side (never sent to the client). */
function hcri_log_exception(\Throwable $e): void {
    error_log('hCRI error: ' . get_class($e) . ': ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ':' . $e->getLine());
}

/** Answers an unexpected failure with a generic message; the details go to the server log only. */
function hcri_fail(\Throwable $e, int $status = 500): never {
    hcri_log_exception($e);
    json_error('Server error', $status);
}
