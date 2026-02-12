<?php
require_once __DIR__ . '/cors.php';

require_once __DIR__ . '/libs/src/Exception.php';
require_once __DIR__ . '/libs/src/PHPMailer.php';
require_once __DIR__ . '/libs/src/SMTP.php';

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

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  respond(400, ['ok' => false, 'error' => 'Invalid JSON', 'error_code' => 'invalid_json']);
}

// ----------------------------
// INPUT
// ----------------------------
$name    = trim((string)($data['name'] ?? ''));
$email   = trim((string)($data['email'] ?? ''));
$subject = trim((string)($data['subject'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$company = trim((string)($data['company'] ?? '')); // honeypot
$ts      = (int)($data['ts'] ?? 0);                // timing

// ----------------------------
// ANTI-SPAM: honeypot + timing
// ----------------------------
if ($company !== '') {
  respond(400, ['ok' => false, 'error' => 'Spam detected', 'error_code' => 'spam']);
}

if ($ts <= 0) {
  respond(400, ['ok' => false, 'error' => 'Spam detected', 'error_code' => 'spam']);
}

$nowMs = (int)(microtime(true) * 1000);

// слишком быстро (< 3 сек)
if (($nowMs - $ts) < 3000) {
  respond(400, ['ok' => false, 'error' => 'Spam detected', 'error_code' => 'spam']);
}

// слишком старый ts (например, форма висела сутками / бот подставил мусор)
if (($nowMs - $ts) > 3600000) { // 1 час
  respond(400, ['ok' => false, 'error' => 'Invalid form', 'error_code' => 'spam']);
}

// ----------------------------
// RATE LIMIT: 3 / 10 minutes per IP
// ----------------------------
$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
  ?? $_SERVER['HTTP_X_FORWARDED_FOR']
  ?? $_SERVER['REMOTE_ADDR']
  ?? 'unknown';

if (strpos($ip, ',') !== false) {
  $ip = trim(explode(',', $ip)[0]);
}

$windowSec = 10 * 60; // 10 минут
$maxReq = 3;

$rateDir = __DIR__ . '/rate_limit';
if (!is_dir($rateDir)) {
  @mkdir($rateDir, 0755, true);
}

$key  = hash('sha256', $ip . '|contact');
$file = $rateDir . '/' . $key . '.json';

$now = time();
$hits = [];

if (is_file($file)) {
  $json = @file_get_contents($file);
  $hits = json_decode($json, true);
  if (!is_array($hits)) $hits = [];
}

$hits = array_values(array_filter($hits, fn($t) => is_int($t) && ($now - $t) < $windowSec));

if (count($hits) >= $maxReq) {
  respond(429, [
    'ok' => false,
    'error' => 'Too many requests',
    'error_code' => 'too_many_requests'
  ]);
}

$hits[] = $now;
@file_put_contents($file, json_encode($hits), LOCK_EX);

// ----------------------------
// VALIDATION
// ----------------------------
if ($name === '' || $email === '' || $message === '') {
  respond(400, ['ok' => false, 'error' => 'Missing fields', 'error_code' => 'missing_fields']);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(400, ['ok' => false, 'error' => 'Invalid email', 'error_code' => 'invalid_email']);
}

// защита от header injection
$name    = str_replace(["\r", "\n"], ' ', $name);
$email   = str_replace(["\r", "\n"], ' ', $email);
$subject = str_replace(["\r", "\n"], ' ', $subject);

// ----------------------------
// MAIL
// ----------------------------
$config = require __DIR__ . '/config.local.php';

$mail = new PHPMailer(true);

try {
  // Debug в лог (на проде лучше выключить: 0)
  $mail->SMTPDebug = 0; // было 2 — включай только для диагностики
  $mail->Debugoutput = function($str, $level) {
    error_log("SMTP[$level]: $str");
  };

  $mail->isSMTP();
  $mail->Host       = $config['SMTP_HOST'];
  $mail->SMTPAuth   = true;
  $mail->Username   = $config['SMTP_USER'];
  $mail->Password   = $config['SMTP_PASS'];

  $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
  $mail->Port       = (int)($config['SMTP_PORT'] ?? 465);
  $mail->Timeout    = 15;

  $mail->SMTPOptions = [
    'ssl' => [
      'verify_peer' => false,
      'verify_peer_name' => false,
      'allow_self_signed' => true,
    ],
  ];

  $mail->CharSet = 'UTF-8';

  $mail->setFrom($config['SMTP_USER'], 'BodyFlow Support');
  $mail->addAddress($config['TO_EMAIL'], 'BodyFlow Support');
  $mail->addReplyTo($email, $name);

  $mail->Subject = $subject !== '' ? "BodyFlow: $subject" : "BodyFlow: message from contact form";
  $mail->Body =
    "Name: $name\n" .
    "Email: $email\n" .
    "Subject: " . ($subject ?: '-') . "\n" .
    "------------------------\n" .
    $message;

  $mail->send();
  respond(200, ['ok' => true]);

} catch (Exception $e) {
  error_log('MAIL ERROR: ' . $mail->ErrorInfo);
  respond(500, [
    'ok' => false,
    'error' => 'Mail error',
    'error_code' => 'mail_error'
  ]);
}
