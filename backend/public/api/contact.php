<?php
require_once __DIR__ . '/cors.php';

require_once __DIR__ . '/libs/PHPMailer/src/Exception.php';
require_once __DIR__ . '/libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'Method not allowed', 'error_code' => 'method_not_allowed']);
}

// ---------- Read JSON ----------
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  respond(400, ['ok' => false, 'error' => 'Invalid JSON', 'error_code' => 'invalid_json']);
}

$name    = trim((string)($data['name'] ?? ''));
$email   = trim((string)($data['email'] ?? ''));
$subject = trim((string)($data['subject'] ?? ''));
$message = trim((string)($data['message'] ?? ''));

// Honeypot (если добавляла поле company на фронте)
$company = trim((string)($data['company'] ?? ''));
if ($company !== '') {
  respond(400, ['ok' => false, 'error' => 'Spam detected', 'error_code' => 'spam']);
}

// Антиспам по времени (если добавляла ts на фронте)
$ts = (int)($data['ts'] ?? 0);
if ($ts > 0) {
  $nowMs = (int)floor(microtime(true) * 1000);
  if (($nowMs - $ts) < 1200) { // слишком быстро отправили
    respond(400, ['ok' => false, 'error' => 'Too fast', 'error_code' => 'too_fast']);
  }
}

// ---------- Validate ----------
if ($name === '' || $email === '' || $message === '') {
  respond(400, ['ok' => false, 'error' => 'Missing fields', 'error_code' => 'missing_fields']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['ok' => false, 'error' => 'Invalid email', 'error_code' => 'invalid_email']);
}

// limits
if (mb_strlen($name) < 2 || mb_strlen($name) > 60) {
  respond(400, ['ok' => false, 'error' => 'Invalid name length', 'error_code' => 'invalid_name']);
}
if (mb_strlen($email) > 120) {
  respond(400, ['ok' => false, 'error' => 'Invalid email length', 'error_code' => 'invalid_email_length']);
}
if (mb_strlen($subject) > 120) {
  respond(400, ['ok' => false, 'error' => 'Invalid subject length', 'error_code' => 'invalid_subject']);
}
if (mb_strlen($message) < 10 || mb_strlen($message) > 2000) {
  respond(400, ['ok' => false, 'error' => 'Invalid message length', 'error_code' => 'invalid_message']);
}

// защита от header injection
$name    = str_replace(["\r", "\n"], ' ', $name);
$email   = str_replace(["\r", "\n"], ' ', $email);
$subject = str_replace(["\r", "\n"], ' ', $subject);

// ---------- SMTP settings (from your cPanel screenshot) ----------
$config = require __DIR__ . '/config.local.php';

$SMTP_HOST = $config['SMTP_HOST'];
$SMTP_USER = $config['SMTP_USER'];
$SMTP_PASS = $config['SMTP_PASS'];
$SMTP_PORT = $config['SMTP_PORT'];
$TO_EMAIL  = $config['TO_EMAIL'];

$TO_EMAIL = 'support@bodyflow.com.ua';

$mail = new PHPMailer(true);

try {
  $mail->isSMTP();
  $mail->Host = $SMTP_HOST;
  $mail->SMTPAuth = true;
  $mail->Username = $SMTP_USER;
  $mail->Password = $SMTP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL for 465
  $mail->Port = $SMTP_PORT;

  // optional, but can help on some hosts:
  // $mail->SMTPKeepAlive = false;
  // $mail->SMTPAutoTLS = true;

  $mail->CharSet = 'UTF-8';

  // From / To
  $mail->setFrom($SMTP_USER, 'BodyFlow Support');
  $mail->addAddress($TO_EMAIL, 'BodyFlow Support');

  // Reply to user
  $mail->addReplyTo($email, $name);

  $mail->Subject = $subject !== ''
    ? "BodyFlow: $subject"
    : "BodyFlow: message from contact form";

  $mail->Body =
    "Name: $name\n" .
    "Email: $email\n" .
    "Subject: " . ($subject ?: '-') . "\n" .
    "------------------------\n" .
    $message;

  $mail->send();

  respond(200, ['ok' => true]);
} catch (Exception $e) {
  respond(500, [
    'ok' => false,
    'error' => 'Mail error',
    'error_code' => 'mail_error'
    // 'debug' => $mail->ErrorInfo // включи временно при отладке
  ]);
}
