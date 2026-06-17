<?php
require_once __DIR__ . '/env.php';
// ------------------------------
// 🔧 DB CONFIG
// ------------------------------
function requiredEnv(string $key): string {
    $value = getenv($key);

    if ($value === false || trim((string)$value) === '') {
        error_log("Required environment variable is missing: {$key}");
        http_response_code(500);
        echo json_encode([
            'error' => 'Server configuration error'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return (string)$value;
}

function envValue(string $key): string {
    $value = getenv($key);
    return $value === false ? '' : (string)$value;
}

$dbHost = requiredEnv('DB_HOST');
$dbName = requiredEnv('DB_NAME');
$dbUser = requiredEnv('DB_USER');
$dbPass = envValue('DB_PASS');
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// ------------------------------
// 🔌 CONNECT: nutrition_bd
// ------------------------------
try {
    $dsnNutrition = "mysql:host=$dbHost;dbname=$dbName;charset=$charset";
    $pdoNutrition = new PDO($dsnNutrition, $dbUser, $dbPass, $options);
    $pdoNutrition->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (PDOException $e) {
    error_log('Nutrition DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Nutrition DB connection failed'
    ]);
    exit;
}

// ------------------------------
// 🧰 HELPERS
// ------------------------------
function sqlPlaceholders(array $arr): string {
    return implode(',', array_fill(0, count($arr), '?'));
}

function getParam(string $key, $default = null) {
    return $_GET[$key] ?? $default;
}
