<?php
// --- Список разрешённых доменов ---
$allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://nutrition-n.test',
    'https://mysite.com'
];

// --- Определяем Origin ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Разрешённые методы
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Разрешённые заголовки
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Для ответов JSON
header("Content-Type: application/json; charset=utf-8");

// Обрабатываем предварительный OPTIONS-запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
