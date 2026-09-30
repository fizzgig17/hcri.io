<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/mailer.php';

cors_headers();
method('POST');

$b       = body();
$message = trim($b['message'] ?? '');
$email   = trim($b['email']   ?? '');
$name    = trim($b['name']    ?? 'Anonymous');

if (!$message)        json_error('Message required', 400);
if (strlen($message) > 2000) json_error('Message too long', 400);

// Honeypot — bots fill this field, humans never see it
$honeypot = $b['website'] ?? '';
if ($honeypot !== '') {
    // Silently succeed so bots think it worked
    json_out(['ok' => true]);
}

// Optional: rate-limit by IP using a simple file lock (prevents spam)
$ipHash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$lockFile = sys_get_temp_dir() . '/hcri_contact_' . $ipHash;
if (file_exists($lockFile) && (time() - filemtime($lockFile)) < 60) {
    json_error('Please wait a few minutes before sending another message.', 429);
}
touch($lockFile);

$fromLine = $email ? "$name <$email>" : $name;
$subject  = 'hCRI.io Feedback' . ($email ? " from $name" : '');
$body     = "Feedback from hCRI.io\n\n"
          . "From:    $fromLine\n"
          . "IP:      " . ($_SERVER['REMOTE_ADDR'] ?? '—') . "\n"
          . "Time:    " . date('Y-m-d H:i:s T') . "\n"
          . str_repeat('-', 50) . "\n\n"
          . $message;

try {
    send_email(MAIL_FROM, MAIL_FROM_NAME, $subject, $body);
} catch (\Exception $e) {
    error_log('Contact form email failed: ' . $e->getMessage());
    json_error('Failed to send message. Please try emailing directly.', 500);
}

json_out(['ok' => true]);