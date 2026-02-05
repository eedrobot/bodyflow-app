<?php
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://bodyflow-app.vercel.app'
];

// если запрос пришёл из браузера
if (isset($_SERVER['HTTP_ORIGIN'])) {
  $origin = $_SERVER['HTTP_ORIGIN'];

  if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
  } else {
    // если хочешь максимально просто — можно разрешить всем
    header('Access-Control-Allow-Origin: *');
  }
} else {
  // запрос не из браузера (например, сервер-сервер)
  header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
