<?php
// ------------------------------
// 🔧 DB CONFIG
// ------------------------------
$dbHost = 'localhost';
$dbUser = 'root';
$dbPass = '';
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
    $dsnNutrition = "mysql:host=$dbHost;dbname=nutrition_bd;charset=$charset";
    $pdoNutrition = new PDO($dsnNutrition, $dbUser, $dbPass, $options);
    $pdoNutrition->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Nutrition DB connection failed',
        'message' => $e->getMessage()
    ]);
    exit;
}

// ------------------------------
// 🔌 CONNECT: exercises_db
// ------------------------------
try {
    $dsnExercises = "mysql:host=$dbHost;dbname=exercises_db;charset=$charset";
    $pdoExercises = new PDO($dsnExercises, $dbUser, $dbPass, $options);
    $pdoExercises->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Exercises DB connection failed',
        'message' => $e->getMessage()
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
