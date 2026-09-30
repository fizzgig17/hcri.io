<?php

declare(strict_types=1);

// Real secret is supplied via api/_core/secrets.local.php (gitignored,
// server-only -- see secrets.local.php.example). The hardcoded fallback
// below is ONLY for local dev (MAMP etc.) -- if this is ever used in
// production, every login token becomes forgeable by anyone who's read
// this file, so secrets.local.php must set a real JWT_SECRET on any real
// deployment.
$secretsFile = __DIR__ . '/secrets.local.php';
if (is_file($secretsFile)) require_once $secretsFile;

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'spd-dev-secret-change-in-production');

define('JWT_TTL',    7 * 24 * 3600);



function jwt_sign(array $payload): string {

    $header  = b64u(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));

    $payload['iat'] = time();

    $payload['exp'] = time() + JWT_TTL;

    $body = b64u(json_encode($payload));

    $sig  = b64u(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));

    return "$header.$body.$sig";

}



function jwt_verify(string $token): ?array {

    $parts = explode('.', $token);

    if (count($parts) !== 3) return null;

    [$h, $b, $s] = $parts;

    if (!hash_equals(b64u(hash_hmac('sha256', "$h.$b", JWT_SECRET, true)), $s)) return null;

    $p = json_decode(b64d($b), true);

    if (!$p || ($p['exp'] ?? 0) < time()) return null;

    return $p;

}



function get_auth_header(): string {

    // 1. Standard — works when PHP is run as module or CLI

    if (!empty($_SERVER['HTTP_AUTHORIZATION']))

        return $_SERVER['HTTP_AUTHORIZATION'];



    // 2. After Apache mod_rewrite passthrough

    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION']))

        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];



    // 3. apache_request_headers() — most reliable on Apache/Windows

    if (function_exists('apache_request_headers')) {

        $headers = apache_request_headers();

        foreach ($headers as $k => $v) {

            if (strtolower($k) === 'authorization') return $v;

        }

    }



    // 4. getallheaders() — alias of apache_request_headers() on some builds

    if (function_exists('getallheaders')) {

        $headers = getallheaders();

        foreach ($headers as $k => $v) {

            if (strtolower($k) === 'authorization') return $v;

        }

    }



    // 5. Read raw request headers via HTTP (PHP-FPM path)

    if (function_exists('http_get_request_headers')) {

        $headers = http_get_request_headers();

        foreach ($headers as $k => $v) {

            if (strtolower($k) === 'authorization') return $v;

        }

    }



    // 6. Token passed as query param — fallback for environments that

    //    strip Authorization header entirely (some Apache/Windows setups)

    if (!empty($_GET['_token'])) {

        return 'Bearer ' . $_GET['_token'];

    }



    // 7. Token passed in request body for POST requests

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {

        $body = json_decode(file_get_contents('php://input'), true);

        if (!empty($body['_token'])) return 'Bearer ' . $body['_token'];

    }



    return '';

}



function require_auth(): array {

    $hdr = get_auth_header();



    if (!str_starts_with($hdr, 'Bearer ')) {

        // Return diagnostic info to help debug

        json_error('Unauthorized. Auth header not found. Server keys containing AUTH: ' .

            implode(', ', array_filter(array_keys($_SERVER), fn($k) => str_contains(strtolower($k), 'auth'))),

            401

        );

    }



    $p = jwt_verify(substr($hdr, 7));

    if (!$p) json_error('Token expired or invalid', 401);

    // Ensure id is always int regardless of how it was stored in the token

    if (isset($p['id'])) $p['id'] = (int)$p['id'];

    // Throttled activity stamp (only writes when stale, never fatal).

    if (isset($p['id']) && function_exists('get_db')) {

        try {

            get_db()->prepare('UPDATE users SET last_active_at = NOW() WHERE id = ? AND (last_active_at IS NULL OR last_active_at < (NOW() - INTERVAL 5 MINUTE))')->execute([(int)$p['id']]);

        } catch (\Throwable $e) {}

    }

    return $p;

}



function require_admin(): array {

    $user = require_auth();

    // Check token first, then fall back to DB lookup (handles tokens issued before is_admin column)

    if (!empty($user['is_admin'])) return $user;

    try {

        $db = get_db();

        $s  = $db->prepare('SELECT is_admin FROM users WHERE id = ?');

        $s->execute([$user['id']]);

        $row = $s->fetch();

        if ($row && (int)$row['is_admin'] === 1) {

            $user['is_admin'] = 1;

            return $user;

        }

    } catch (\Throwable $e) {}

    json_error('Forbidden — admin access required', 403);

}



function b64u(string $d): string { return rtrim(strtr(base64_encode($d), '+/', '-_'), '='); }

function b64d(string $d): string { return base64_decode(strtr($d, '-_', '+/')); }