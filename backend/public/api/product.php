<?php
/**
 * product.php
 * Возвращает данные продукта по slug (или по id, если нужно) с переводами, категориями и нутриентами.
 *
 * Query params:
 *   - slug (required, string)  ✅ основной режим (SEO)
 *   - id   (optional, int)     ✅ запасной режим
 *   - lang (optional: 'ru'|'en'|'uk', default 'ru')
 *
 * ВАЖНО:
 * - product_id ищется по slug БЕЗ привязки к языку, чтобы переключение языка не давало 404.
 * - В ответе есть translations + slug_translations для корректного роутинга на фронте.
 */

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ✅ PDO
$pdo = $pdoNutrition ?? null;
if (!$pdo instanceof PDO) {
  http_response_code(500);
  echo json_encode([
    'error' => 'DB connection is not available',
    'db' => 'nutrition_bd'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// -------------------- CONFIG --------------------
$baseImgPath = '/icons/nutrient-categories/';
$langMap = ['en' => 1, 'ru' => 2, 'uk' => 3];
$reverseLangMap = [1 => 'en', 2 => 'ru', 3 => 'uk'];
$allowedLangs = ['ru', 'en', 'uk'];

$lang = isset($_GET['lang']) ? (string)$_GET['lang'] : 'ru';
if (!in_array($lang, $allowedLangs, true)) $lang = 'ru';
$lang_id = $langMap[$lang];

// -------------------- INPUT --------------------
$slug = isset($_GET['slug']) ? trim((string)$_GET['slug']) : '';
$idRaw = isset($_GET['id']) ? (string)$_GET['id'] : '';

$product_id = 0;

// ✅ Основной режим: slug
if ($slug !== '') {
  // Ищем product_id по slug БЕЗ привязки к языку (иначе будут 404 при смене языка)
  $stmt = $pdo->prepare("
    SELECT product_id
    FROM product_description
    WHERE slug = ?
    LIMIT 1
  ");
  $stmt->execute([$slug]);
  $found = $stmt->fetchColumn();

  if (!$found) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found'], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $product_id = (int)$found;
}
// ✅ Запасной режим: id
elseif ($idRaw !== '' && is_numeric($idRaw)) {
  $product_id = (int)$idRaw;
} else {
  http_response_code(400);
  echo json_encode(['error' => 'Missing product slug (or id)'], JSON_UNESCAPED_UNICODE);
  exit;
}

// -------------------- 1) PRODUCT TRANSLATIONS + SLUGS --------------------
$stmt = $pdo->prepare("
  SELECT product_id, lang_id, product_name, slug
  FROM product_description
  WHERE product_id = ?
");
$stmt->execute([$product_id]);
$descriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$descriptions) {
  http_response_code(404);
  echo json_encode(['error' => 'Product not found'], JSON_UNESCAPED_UNICODE);
  exit;
}

$productTranslations = ['en' => '', 'ru' => '', 'uk' => ''];
$productSlugTranslations = ['en' => '', 'ru' => '', 'uk' => ''];

foreach ($descriptions as $desc) {
  $lid = (int)($desc['lang_id'] ?? 0);
  $code = isset($reverseLangMap[$lid]) ? $reverseLangMap[$lid] : 'ru';

  $productTranslations[$code] = (string)($desc['product_name'] ?? '');
  $productSlugTranslations[$code] = (string)($desc['slug'] ?? '');
}

$product = [
  'product_id' => $product_id,

  // удобные поля
  'name' => $productTranslations[$lang] !== '' ? $productTranslations[$lang] : ($productTranslations['ru'] ?? ''),
  'slug' => $productSlugTranslations[$lang] !== '' ? $productSlugTranslations[$lang] : ($productSlugTranslations['ru'] ?? ''),

  // полные переводы
  'translations' => $productTranslations,
  'slug_translations' => $productSlugTranslations,

  'categories' => [],
  'nutrients' => []
];

// -------------------- 2) PRODUCT CATEGORIES (tree) --------------------
$excludeIds = [1, 52, 53, 54, 56, 57, 58, 59];
$excludeIds = array_values(array_filter(array_map('intval', $excludeIds)));

$placeholders = implode(',', array_fill(0, count($excludeIds), '?'));

$stmtProdCat = $pdo->prepare("
  SELECT c.category_id, c.category_parent_id, cd.lang_id, cd.category_name
  FROM product_to_category ptc
  JOIN category c ON ptc.category_id = c.category_id
  JOIN category_description cd ON c.category_id = cd.category_id
  WHERE ptc.product_id = ?
    AND c.category_id NOT IN ($placeholders)
  ORDER BY c.category_parent_id, c.category_id
");

$params = array_merge([$product_id], $excludeIds);
$stmtProdCat->execute($params);
$productCategoriesRaw = $stmtProdCat->fetchAll(PDO::FETCH_ASSOC);

$catTranslationsMap = [];
foreach ($productCategoriesRaw as $cat) {
  $id = (int)($cat['category_id'] ?? 0);
  if ($id <= 0) continue;

  $lid = (int)($cat['lang_id'] ?? 0);
  $code = isset($reverseLangMap[$lid]) ? $reverseLangMap[$lid] : 'ru';

  if (!isset($catTranslationsMap[$id])) {
    $catTranslationsMap[$id] = ['en' => '', 'ru' => '', 'uk' => ''];
  }
  $catTranslationsMap[$id][$code] = (string)($cat['category_name'] ?? '');
}

$catMap = [];
foreach ($productCategoriesRaw as $cat) {
  $id = (int)($cat['category_id'] ?? 0);
  if ($id <= 0) continue;

  $parentId = (int)($cat['category_parent_id'] ?? 0);

  if (!isset($catMap[$id])) {
    $catMap[$id] = [
      'category_id' => $id,
      'parent_id' => $parentId,
      'name' => $catTranslationsMap[$id][$lang] !== '' ? $catTranslationsMap[$id][$lang] : ($catTranslationsMap[$id]['ru'] ?? ''),
      'translations' => $catTranslationsMap[$id],
      'children' => []
    ];
  }
}

// Build tree
foreach ($catMap as $id => &$c) {
  if ($c['parent_id'] !== 0 && isset($catMap[$c['parent_id']])) {
    $catMap[$c['parent_id']]['children'][] = &$c;
  } else {
    $product['categories'][] = &$c;
  }
}
unset($c);

// -------------------- 3) NUTRIENT CATEGORIES (all) --------------------
$stmtCategories = $pdo->prepare("
  SELECT nc.nutrient_category_id, nc.nutrient_category_parent_id,
         nc.nutrient_category_img, ncd.lang_id, ncd.nutrient_category_name
  FROM nutrient_category nc
  LEFT JOIN nutrient_category_description ncd
    ON nc.nutrient_category_id = ncd.nutrient_category_id
  ORDER BY nc.nutrient_category_parent_id, nc.nutrient_category_id
");
$stmtCategories->execute();
$categoriesRaw = $stmtCategories->fetchAll(PDO::FETCH_ASSOC);

$nutrientCatMap = [];
foreach ($categoriesRaw as $cat) {
  $id = (int)($cat['nutrient_category_id'] ?? 0);
  $parentId = (int)($cat['nutrient_category_parent_id'] ?? 0);

  if (!isset($nutrientCatMap[$id])) {
    $nutrientCatMap[$id] = [
      'category_id' => $id,
      'parent_id' => $parentId,
      'name' => '',
      'translations' => ['en' => '', 'ru' => '', 'uk' => ''],
      'img' => !empty($cat['nutrient_category_img']) ? ($baseImgPath . $cat['nutrient_category_img']) : '',
      'nutrients' => [],
      'children' => []
    ];
  }

  $lid = (int)($cat['lang_id'] ?? 0);
  $code = isset($reverseLangMap[$lid]) ? $reverseLangMap[$lid] : 'ru';
  $nutrientCatMap[$id]['translations'][$code] = (string)($cat['nutrient_category_name'] ?? '');
}

// name by current lang
foreach ($nutrientCatMap as $id => &$c) {
  $c['name'] = $c['translations'][$lang] !== '' ? $c['translations'][$lang] : ($c['translations']['ru'] ?? '');
}
unset($c);

// -------------------- 4) PRODUCT NUTRIENTS + TRANSLATIONS --------------------
$stmtNutrients = $pdo->prepare("
  SELECT nv.nutrient_id, nv.nutrient_value, ntc.nutrient_category_id,
         n.nutrient_day_norm, mu.mu_shot_name
  FROM nutrient_value nv
  LEFT JOIN nutrient_to_category ntc
    ON nv.nutrient_id = ntc.nutrient_id
  LEFT JOIN nutrient n
    ON nv.nutrient_id = n.nutrient_id
  LEFT JOIN mu
    ON n.mu_id = mu.mu_id AND mu.lang_id = ?
  WHERE nv.product_id = ?
  ORDER BY COALESCE(ntc.nutrient_category_id,0), nv.nutrient_id
");
$stmtNutrients->execute([$lang_id, $product_id]);
$nutrientsRaw = $stmtNutrients->fetchAll(PDO::FETCH_ASSOC);

// nutrient IDs
$nutrientIds = [];
foreach ($nutrientsRaw as $n) {
  $nutrientIds[] = (int)($n['nutrient_id'] ?? 0);
}
$nutrientIds = array_values(array_unique(array_filter($nutrientIds)));

$nutrientTranslations = [];
if (!empty($nutrientIds)) {
  $ph = implode(',', array_fill(0, count($nutrientIds), '?'));
  $stmtTrans = $pdo->prepare("
    SELECT nutrient_id, lang_id, nutrient_name
    FROM nutrient_description
    WHERE nutrient_id IN ($ph)
  ");
  $stmtTrans->execute($nutrientIds);
  $rows = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

  foreach ($rows as $row) {
    $nid = (int)($row['nutrient_id'] ?? 0);
    $lid = (int)($row['lang_id'] ?? 0);
    $code = isset($reverseLangMap[$lid]) ? $reverseLangMap[$lid] : 'ru';

    if (!isset($nutrientTranslations[$nid])) {
      $nutrientTranslations[$nid] = ['en' => '', 'ru' => '', 'uk' => ''];
    }
    $nutrientTranslations[$nid][$code] = (string)($row['nutrient_name'] ?? '');
  }
}

// attach nutrients to category map
foreach ($nutrientsRaw as $nut) {
  $nid = (int)($nut['nutrient_id'] ?? 0);
  $cat_id = isset($nut['nutrient_category_id']) ? (int)$nut['nutrient_category_id'] : 0;

  $translations = [
    'en' => isset($nutrientTranslations[$nid]['en']) ? $nutrientTranslations[$nid]['en'] : '',
    'ru' => isset($nutrientTranslations[$nid]['ru']) ? $nutrientTranslations[$nid]['ru'] : '',
    'uk' => isset($nutrientTranslations[$nid]['uk']) ? $nutrientTranslations[$nid]['uk'] : '',
  ];

  $nutData = [
    'nutrient_id' => $nid,
    'name' => $translations[$lang] !== '' ? $translations[$lang] : ($translations['ru'] ?? ''),
    'translations' => $translations,
    'value' => ($nut['nutrient_value'] !== null && is_numeric($nut['nutrient_value'])) ? (float)$nut['nutrient_value'] : 0,
    'day_norm' => isset($nut['nutrient_day_norm']) ? $nut['nutrient_day_norm'] : 0,
    'unit' => isset($nut['mu_shot_name']) ? (string)$nut['mu_shot_name'] : ''
  ];

  if (!isset($nutrientCatMap[$cat_id])) {
    // на всякий случай
    $nutrientCatMap[$cat_id] = [
      'category_id' => $cat_id,
      'parent_id' => 0,
      'name' => '',
      'translations' => ['en' => '', 'ru' => '', 'uk' => ''],
      'img' => '',
      'nutrients' => [],
      'children' => []
    ];
  }

  $nutrientCatMap[$cat_id]['nutrients'][] = $nutData;

  // копирование в родителя (как у тебя было)
  $parent_id = isset($nutrientCatMap[$cat_id]['parent_id']) ? (int)$nutrientCatMap[$cat_id]['parent_id'] : 0;
  if ($parent_id && isset($nutrientCatMap[$parent_id])) {
    $nutrientCatMap[$parent_id]['nutrients'][] = $nutData;
  }
}

// -------------------- 5) BUILD TREE (nutrient categories) --------------------
function buildTreeAssoc(array $elements): array {
  $map = [];
  foreach ($elements as $el) {
    $map[$el['category_id']] = $el;
  }

  $tree = [];
  foreach ($map as $id => $el) {
    $parent = $el['parent_id'];
    if ($parent !== 0 && isset($map[$parent])) {
      $map[$parent]['children'][] = &$map[$id];
    } else {
      $tree[] = &$map[$id];
    }
  }
  return $tree;
}

$product['nutrients'] = buildTreeAssoc($nutrientCatMap);

// -------------------- OUTPUT --------------------
echo json_encode($product, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
