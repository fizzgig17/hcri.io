<?php
// api/_core/mail_config.php
//
// Real secrets are supplied via api/_core/secrets.local.php (gitignored,
// server-only -- see secrets.local.php.example) rather than hardcoded here,
// so this file is safe to be public.
$secretsFile = __DIR__ . '/secrets.local.php';
if (is_file($secretsFile)) require_once $secretsFile;

define('MAIL_HOST',      getenv('MAIL_HOST') ?: 'mail.spacemail.com');
define('MAIL_PORT',      (int)(getenv('MAIL_PORT') ?: 465));
define('MAIL_USER',      getenv('MAIL_USER') ?: 'fizzgig@hcri.io');
define('MAIL_PASS',      getenv('MAIL_PASS') ?: '');
define('MAIL_FROM',      getenv('MAIL_FROM') ?: 'fizzgig@hcri.io');   // must match authenticated account
define('MAIL_FROM_NAME', getenv('MAIL_FROM_NAME') ?: 'hCRI.io');
define('MAIL_ENCRYPTION',getenv('MAIL_ENCRYPTION') ?: 'ssl');
