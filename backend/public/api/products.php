<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

/**
 * products.php
 * Returns products for a given category_id with:
 * - translations (en/ru/uk)
 * - slug + slug_translations (en/ru/uk)
 * - categories nesting info
 * - nutrients: proteins/fats/carbs/calories
 *
 * Query params:
 *   category_id (required, int)
 *   lang (optional: 'ru'|'en'|'uk', default 'ru')
 *
 * IMPORTANT: always return JSON (never HTML), even on errors.
 */

header('Content-Type: application/json; charset=utf-8');

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ Use only $pdo_nutrition
$pdo_nutrition = $pdoNutrition ?? null;

// ✅ Hard guard: avoid "Call to a member function prepare() on null"
if (!$pdo_nutrition) {
    http_response_code(500);
    echo json_encode([
        'error' => 'DB connection is not available',
        'db' => 'nutrition_bd'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ✅ Validate category_id
$categoryRaw = $_GET['category_id'] ?? null;
if ($categoryRaw === null || $categoryRaw === '' || !is_numeric($categoryRaw)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid category_id'], JSON_UNESCAPED_UNICODE);
    exit;
}
$category_id = (int)$categoryRaw;

// ✅ Validate lang
$lang = isset($_GET['lang']) ? (string)$_GET['lang'] : 'ru';
if (!in_array($lang, ['ru', 'en', 'uk'], true)) $lang = 'ru';

// Lang mapping (как у тебя в product.php / db)
$langMap = [
    1 => 'en',
    2 => 'ru',
    3 => 'uk'
];

try {
    // 1) product ids in selected category
    $stmt = $pdo_nutrition->prepare("
        SELECT product_id
        FROM product_to_category
        WHERE category_id = :category_id
    ");
    $stmt->execute([':category_id' => $category_id]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$products) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $productIds = array_values(array_unique(array_map('intval', array_column($products, 'product_id'))));
    if (!$productIds) {
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $placeholders = implode(',', array_fill(0, count($productIds), '?'));

    // 2) categories for those products
    $stmtCats = $pdo_nutrition->prepare("
        SELECT 
            pc.product_id,
            c.category_id,
            c.category_parent_id
        FROM product_to_category pc
        JOIN category c ON c.category_id = pc.category_id
        WHERE pc.product_id IN ($placeholders)
    ");
    $stmtCats->execute($productIds);
    $catData = $stmtCats->fetchAll(PDO::FETCH_ASSOC);

    // 2a) nesting map by product
    $catMap = [];
    foreach ($catData as $c) {
        $pid = (int)$c['product_id'];
        $catId = (int)$c['category_id'];
        $parentId = (int)$c['category_parent_id'];

        if (!isset($catMap[$pid])) $catMap[$pid] = [];
        if (!isset($catMap[$pid][$catId])) $catMap[$pid][$catId] = [];

        if ($parentId !== 0 && !in_array($parentId, $catMap[$pid][$catId], true)) {
            $catMap[$pid][$catId][] = $parentId;
        }
    }

    // 3) translations (en/ru/uk) + slug translations
    $stmtTrans = $pdo_nutrition->prepare("
        SELECT product_id, lang_id, product_name, slug
        FROM product_description
        WHERE product_id IN ($placeholders)
    ");
    $stmtTrans->execute($productIds);
    $rowsTrans = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

    $transMap = [];
    $slugTransMap = [];

    foreach ($rowsTrans as $t) {
        $pid = (int)$t['product_id'];
        $langId = (int)$t['lang_id'];
        $langCode = $langMap[$langId] ?? null;
        if (!$langCode) continue;

        if (!isset($transMap[$pid])) $transMap[$pid] = [];
        if (!isset($slugTransMap[$pid])) $slugTransMap[$pid] = [];

        $transMap[$pid][$langCode] = (string)($t['product_name'] ?? '');
        $slugTransMap[$pid][$langCode] = (string)($t['slug'] ?? '');
    }

    // 4) nutrients
    $stmtNutrients = $pdo_nutrition->prepare("
        SELECT nv.product_id, nv.nutrient_id, nv.nutrient_value
        FROM nutrient_value nv
        WHERE nv.product_id IN ($placeholders)
          AND nv.nutrient_id IN (2,3,4,14)
    ");
    $stmtNutrients->execute($productIds);
    $nutrients = $stmtNutrients->fetchAll(PDO::FETCH_ASSOC);

    $nutMap = [];
    foreach ($nutrients as $n) {
        $pid = (int)$n['product_id'];
        $nid = (int)$n['nutrient_id'];
        $val = $n['nutrient_value'];

        if (!isset($nutMap[$pid])) $nutMap[$pid] = [];
        $nutMap[$pid][$nid] = is_numeric($val) ? (float)$val : 0;
    }

    // 5) result
    $result = [];
    foreach ($productIds as $id) {
        $categories = [];

        if (isset($catMap[$id])) {
            foreach ($catMap[$id] as $catId => $children) {
                $categories[] = [
                    'category_id' => (int)$catId,
                    'children' => array_values(array_map('intval', $children))
                ];
            }
        }

        // slug for current lang (fallback to ru)
        $slugForLang = '';
        if (isset($slugTransMap[$id])) {
            $slugForLang = $slugTransMap[$id][$lang] ?? ($slugTransMap[$id]['ru'] ?? '');
        }

        $result[] = [
            'product_id' => (int)$id,

            'slug' => $slugForLang,
            'slug_translations' => $slugTransMap[$id] ?? new stdClass(),

            'translations' => $transMap[$id] ?? new stdClass(),
            'categories' => $categories,

            'proteins' => $nutMap[$id][2] ?? 0,
            'fats' => $nutMap[$id][3] ?? 0,
            'carbs' => $nutMap[$id][4] ?? 0,
            'calories' => $nutMap[$id][14] ?? 0
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Query failed',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
