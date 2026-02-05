<?php
// categories.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

// ✅ Гарантируем, что PDO для nutrition_bd существует
if (!isset($pdoNutrition) || !($pdoNutrition instanceof PDO)) {
    http_response_code(500);
    echo json_encode(['error' => 'pdoNutrition is not initialized'], JSON_UNESCAPED_UNICODE);
    exit;
}

// --- Список категорий, которые исключаем ---
$exclude = [59];
$exclude = array_values(array_filter(array_map('intval', $exclude)));

$excludeSql = '';
$params = [];
if (!empty($exclude)) {
    $excludeSql = " AND c.category_id NOT IN (" . sqlPlaceholders($exclude) . ") ";
    $params = $exclude;
}

// 1) Получаем все категории + переводы
$sql = "
    SELECT 
        c.category_id, 
        c.category_parent_id, 
        c.category_img,
        cd.lang_id,
        cd.category_name
    FROM category c
    JOIN category_description cd ON c.category_id = cd.category_id
    WHERE 1=1
    $excludeSql
    ORDER BY c.category_parent_id, c.category_id, cd.lang_id
";

try {
    $stmt = $pdoNutrition->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(); // PDO::FETCH_ASSOC уже стоит в db.php
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Categories query failed',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2) Формируем массив категорий с translations
$categories = [];
$langMap = [1 => 'en', 2 => 'ru', 3 => 'uk'];

foreach ($rows as $row) {
    $catId = (int)($row['category_id'] ?? 0);
    if ($catId <= 0) continue;

    if (!isset($categories[$catId])) {
        $categories[$catId] = [
            'category_id' => $catId,
            'category_parent_id' => (int)($row['category_parent_id'] ?? 0),
            'category_img' => !empty($row['category_img'])
                ? "/icons/product-categories/" . basename($row['category_img'])
                : null,
            'translations' => [],
            'children' => []
        ];
    }

    $lid = (int)($row['lang_id'] ?? 2);
    $langCode = $langMap[$lid] ?? 'ru';

    $name = $row['category_name'] ?? null;
    if ($name !== null && $name !== '') {
        $categories[$catId]['translations'][$langCode] = $name;
    }
}

// 3) Превращаем в дерево
$tree = [];
foreach ($categories as $catId => &$cat) {
    $parentId = (int)($cat['category_parent_id'] ?? 0);

    if ($parentId === 0) {
        $tree[] = &$cat;
    } else {
        if (isset($categories[$parentId])) {
            $categories[$parentId]['children'][] = &$cat;
        } else {
            // если родителя нет (например, исключён), кладём в корень
            $tree[] = &$cat;
        }
    }
}
unset($cat);

// 4) Ответ
echo json_encode($tree, JSON_UNESCAPED_UNICODE);
