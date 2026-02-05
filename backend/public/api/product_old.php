<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

// product_id обязателен
if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Missing product id']);
    exit;
}

$product_id = intval($_GET['id']);

// lang передаётся в JS как строка ("ru", "uk", "en")
$lang = isset($_GET['lang']) ? $_GET['lang'] : 'ru';

// карта языков
$langMap = [
    'ru' => 2,
    'uk' => 3,
    'en' => 1
];

$lang_id = isset($langMap[$lang]) ? $langMap[$lang] : 2;

// Получаем сам продукт
$stmt = $pdo->prepare("
    SELECT product_id, product_name
    FROM product_description
    WHERE product_id = ? AND lang_id = ?
    LIMIT 1
");
$stmt->execute([$product_id, $lang_id]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    echo json_encode(['error' => 'Product not found']);
    exit;
}

// Подгружаем все нутриенты
$stmtNutrients = $pdo->prepare("
    SELECT nv.nutrient_id, nv.nutrient_value, nd.nutrient_name
    FROM nutrient_value nv
    JOIN nutrient_description nd 
      ON nv.nutrient_id = nd.nutrient_id
    WHERE nv.product_id = ? AND nd.lang_id = ?
    ORDER BY nd.nutrient_id
");
$stmtNutrients->execute([$product_id, $lang_id]);
$nutrients = $stmtNutrients->fetchAll(PDO::FETCH_ASSOC);

// Добавляем нутриенты в продукт
$product['nutrients'] = $nutrients;

// Возвращаем JSON
echo json_encode($product, JSON_UNESCAPED_UNICODE);
