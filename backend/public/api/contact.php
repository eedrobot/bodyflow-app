<?php
header('Content-Type: application/json; charset=utf-8');

/* ---------- CORS ---------- */
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// PHPMailer без composer
require_once __DIR__ . '/../libs/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Missing fields']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid email']);
  exit;
}

// защита от header injection
$name = str_replace(["\r", "\n"], ' ', $name);
$email = str_replace(["\r", "\n"], ' ', $email);
$subject = str_replace(["\r", "\n"], ' ', $subject);

$mail = new PHPMailer(true);

try {
  // ---------- SMTP ----------
  $SMTP_USER = 'body.flow.service@gmail.com';
  $SMTP_PASS = 'APP_PASSWORD_HERE'; // пароль приложения Gmail

  $mail->isSMTP();
  $mail->Host = 'smtp.gmail.com';
  $mail->SMTPAuth = true;
  $mail->Username = $SMTP_USER;
  $mail->Password = $SMTP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = 587;

  $mail->CharSet = 'UTF-8';
  $mail->setFrom($SMTP_USER, 'BodyFlow');
  $mail->addAddress('body.flow.service@gmail.com', 'BodyFlow');
  $mail->addReplyTo($email, $name);

  $mail->Subject = $subject !== ''
    ? "BodyFlow: $subject"
    : "BodyFlow: сообщение с формы";

  $mail->Body =
    "Имя: $name\n" .
    "Email: $email\n" .
    "Тема: " . ($subject ?: '-') . "\n" .
    "------------------------\n" .
    $message;

  $mail->send();

  echo json_encode(['ok' => true]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'ok' => false,
    'error' => 'Mail error',
    // 'debug' => $mail->ErrorInfo // включи при отладке
  ]);
}
