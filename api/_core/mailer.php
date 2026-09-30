<?php
// Thin wrapper around PHPMailer
require_once __DIR__ . '/mail_config.php';
require_once __DIR__ . '/../../vendor/phpmailer/Exception.php';
require_once __DIR__ . '/../../vendor/phpmailer/PHPMailer.php';
require_once __DIR__ . '/../../vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Send a plain-text email. Returns true on success, throws on failure.
 */
function send_email(string $to, string $toName, string $subject, string $body): bool {
    $m = new PHPMailer(true);
    $m->isSMTP();
    $m->Host        = MAIL_HOST;
    $m->SMTPAuth    = true;
    $m->Username    = MAIL_USER;
    $m->Password    = MAIL_PASS;
    $m->SMTPSecure  = MAIL_ENCRYPTION === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $m->Port        = MAIL_PORT;
    $m->CharSet = 'UTF-8';
    $m->setFrom(MAIL_FROM, MAIL_FROM_NAME);
    $m->addAddress($to, $toName);
    $m->Subject = $subject;
    $m->Body    = $body;
    $m->send();
    return true;
}