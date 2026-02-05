<?php
/******************************************************
 * Menu API (v15.0) — MULTI-LANG PRODUCT NAMES (ru/uk/en)
 * + slug_translations (ru/uk/en) + slug (для текущего lang с fallback)
 * + category_ids: [..]  (все категории продукта)
 * + potato_group (ИЗ ТАБЛИЦЫ menu, поле m.potato_group)
 *
 * Ограничения категорий (variant 2):
 * - если у продукта есть хоть одна restricted category:
 *   - запрещаем, если хоть одна из них уже использована >= 2 раз
 *   - иначе инкрементим usage для КАЖДОЙ restricted категории
 *
 * RULES for product_id = 583:
 * - НЕ добавлять 583 в meal, если в meal есть продукт с category_id = 44
 * - НЕ добавлять 583 в meal, если в meal есть продукт с potato_group = 1
 *
 * Завтраки:
 * - sugar=1 (дни 1-2): логика как была, но овощи НЕ добавляем вообще
 * - sugar=2 (дни 3+):
 *   Обычный день: nid1 + nid8 + nid7 + nid3(2 овоща) + nid2 (все breakfast_meal=1)
 *   Cat12 day: 1 продукт cat12 + добор nid1/8 + nid7 + nid3(2 овоща) + nid2
 *
 * Обед/ужин:
 * - овощи брать любые (без учета breakfast_meal), но только other_meal=1
 * - все текущие ограничения по парам (морковь+партнёр и т.п.) оставить
 *
 * NEW RULE:
 * - product_id = 872, 874, 944, 945 НЕ ДОЛЖНЫ попадать в выборку nid=5 и nid=6
 ******************************************************/

require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$DB_HOST = 'localhost';
$DB_NAME = 'nutrition_bd';
$DB_USER = 'root';
$DB_PASS = '';

$days     = isset($_GET['days']) ? max(1, (int)$_GET['days']) : 5;
$langCode = $_GET['lang'] ?? 'uk';

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    // -------------------------------
    // Lang IDs for ru/uk/en
    // -------------------------------
    $langIds = [];
    $stmt = $pdo->query("SELECT lang_code, lang_id FROM language WHERE lang_code IN ('ru','uk','en')");
    foreach ($stmt->fetchAll() as $row) {
        $langIds[$row['lang_code']] = (int)$row['lang_id'];
    }

    // normalize lang
    if (!is_string($langCode) || $langCode === '' || $langCode === 'undefined' || $langCode === 'null') {
        $langCode = 'uk';
    }
    if (!in_array($langCode, ['ru','uk','en'], true)) {
        $langCode = 'uk';
    }

    $fallbackLangId = $langIds[$langCode] ?? ($langIds['uk'] ?? 1);
    $langRu = $langIds['ru'] ?? $fallbackLangId;
    $langUk = $langIds['uk'] ?? $fallbackLangId;
    $langEn = $langIds['en'] ?? $fallbackLangId;

    // -------------------------------
    // Ограничения категорий (≤ 2 раза)
    // -------------------------------
    $restrictedCategories = [3, 5, 8, 90, 91, 73];
    $categoryUsage        = [];

    // RULE CONSTS
    $PID_583 = 583;
    $BLOCK_583_IF_CATEGORY_ID = 44;
    $BLOCK_583_IF_POTATO_GROUP = 1;

    // ✅ NEW RULE CONSTS
    // ❌ не брать эти product_id в группах nid=5 и nid=6
    $NO_NID_56_PIDS = [872, 874, 944, 945];

    // sugar=1 → какой день 482 / какой 704
    $sugar1Days = [1, 2];
    shuffle($sugar1Days);
    $dayWith482 = $sugar1Days[0];
    $dayWith704 = $sugar1Days[1];

    // sugar=2 → какие два дня будут с category_id=12 (только дни > 2)
    $sugar2Days = array_values(array_filter(range(1, $days), fn($d) => $d > 2));
    shuffle($sugar2Days);
    $cat12Days = array_slice($sugar2Days, 0, min(2, count($sugar2Days)));

    // -------------------------------
    // Helpers
    // -------------------------------
    $packProductName = function(array &$row) {
        $row['product_name'] = [
            'ru' => $row['name_ru'] ?? '',
            'uk' => $row['name_uk'] ?? '',
            'en' => $row['name_en'] ?? '',
        ];
        unset($row['name_ru'], $row['name_uk'], $row['name_en']);
    };

    // ✅ slug_translations + slug (под текущий язык)
    $packProductSlug = function(array &$row) use ($langCode) {
        $row['slug_translations'] = [
            'ru' => $row['slug_ru'] ?? '',
            'uk' => $row['slug_uk'] ?? '',
            'en' => $row['slug_en'] ?? '',
        ];

        $row['slug'] =
            $row['slug_translations'][$langCode]
            ?: ($row['slug_translations']['uk'] ?? '')
            ?: ($row['slug_translations']['ru'] ?? '')
            ?: ($row['slug_translations']['en'] ?? '');

        unset($row['slug_ru'], $row['slug_uk'], $row['slug_en']);
    };

    $packCategoryIds = function(array &$row) {
        $raw = $row['category_ids'] ?? '';
        if ($raw === null || $raw === '') {
            $row['category_ids'] = [];
            return;
        }
        if (is_array($raw)) {
            $row['category_ids'] = array_values(array_unique(array_map('intval', $raw)));
            return;
        }
        $arr = array_filter(array_map('trim', explode(',', (string)$raw)), fn($x) => $x !== '');
        $row['category_ids'] = array_values(array_unique(array_map('intval', $arr)));
    };

    $hasCategoryId = function(array $products, int $categoryId): bool {
        foreach ($products as $p) {
            $cats = $p['category_ids'] ?? [];
            if (!is_array($cats)) continue;
            if (in_array($categoryId, $cats, true)) return true;
        }
        return false;
    };

    $hasPotatoGroup = function(array $products, int $potatoGroup): bool {
        foreach ($products as $p) {
            if ((int)($p['potato_group'] ?? 0) === $potatoGroup) return true;
        }
        return false;
    };

    $countByNid = function(array $items, int $nid): int {
        $c = 0;
        foreach ($items as $p) {
            if ((int)($p['menu_nutrient_id'] ?? 0) === $nid) $c++;
        }
        return $c;
    };

    $checkAndApplyRestrictedCategories = function(
        array $categoryIds,
        array $restrictedCategories,
        array &$categoryUsage
    ): bool {
        if (!$categoryIds) return true;

        $hits = array_values(array_intersect($categoryIds, $restrictedCategories));
        if (!$hits) return true;

        foreach ($hits as $catId) {
            if (($categoryUsage[$catId] ?? 0) >= 2) return false;
        }

        foreach ($hits as $catId) {
            $categoryUsage[$catId] = ($categoryUsage[$catId] ?? 0) + 1;
        }

        return true;
    };

    // -------------------------------
    // Универсальная выборка по группе (menu_nutrient_id)
    // -------------------------------
    $pickProducts = function(
        PDO $pdo,
        int $langRu,
        int $langUk,
        int $langEn,
        int $menuNutrientId,
        string $mealType, // 'breakfast' | 'other'
        int $sugarType,
        array $usedIds,
        int $limit,
        array $restrictedCategories,
        array &$categoryUsage,
        array $extraExclude = []
    ) use (
        $packProductName,
        $packProductSlug,
        $packCategoryIds,
        $checkAndApplyRestrictedCategories,
        $NO_NID_56_PIDS
    ) {

        // По умолчанию фильтруем по флагам приёма
        $whereMeal = ($mealType === 'breakfast') ? "m.breakfast_meal = 1" : "m.other_meal = 1";

        // Овощи в обед/ужин: берем любые (не зависит от breakfast_meal), но только other_meal=1
        if ($mealType !== 'breakfast' && (int)$menuNutrientId === 3) {
            $whereMeal = "m.other_meal = 1";
        }

        $allExclude = array_values(array_unique(array_merge($usedIds, $extraExclude)));

        // ✅ NEW RULE: запрет pid 872/874/944/945 в nid=5 и nid=6
        if (in_array($menuNutrientId, [5, 6], true)) {
            $allExclude = array_values(array_unique(array_merge($allExclude, $NO_NID_56_PIDS)));
        }

        $excludeSql = $allExclude
            ? " AND m.product_id NOT IN (" . implode(',', array_fill(0, count($allExclude), '?')) . ")"
            : "";

        $sql = "
            SELECT
                m.product_id,
                m.menu_nutrient_id,
                m.sugar,

                pd_ru.product_name AS name_ru,
                pd_uk.product_name AS name_uk,
                pd_en.product_name AS name_en,

                pd_ru.slug AS slug_ru,
                pd_uk.slug AS slug_uk,
                pd_en.slug AS slug_en,

                GROUP_CONCAT(DISTINCT ptc.category_id ORDER BY ptc.category_id) AS category_ids,
                COALESCE(m.potato_group, 0) AS potato_group
            FROM menu m
            JOIN product_to_category ptc ON ptc.product_id = m.product_id

            LEFT JOIN product_description pd_ru ON pd_ru.product_id = m.product_id AND pd_ru.lang_id = ?
            LEFT JOIN product_description pd_uk ON pd_uk.product_id = m.product_id AND pd_uk.lang_id = ?
            LEFT JOIN product_description pd_en ON pd_en.product_id = m.product_id AND pd_en.lang_id = ?

            WHERE {$whereMeal}
              AND m.menu_nutrient_id = ?
              AND m.sugar = ?
              {$excludeSql}

            GROUP BY
                m.product_id, m.menu_nutrient_id, m.sugar,
                name_ru, name_uk, name_en,
                slug_ru, slug_uk, slug_en,
                potato_group
            ORDER BY RAND()
            LIMIT " . (int)($limit * 8);

        $stmt = $pdo->prepare($sql);

        $params = [$langRu, $langUk, $langEn, $menuNutrientId, $sugarType];
        if ($allExclude) $params = array_merge($params, $allExclude);

        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $picked = [];
        foreach ($rows as $r) {
            $packProductName($r);
            $packProductSlug($r);
            $packCategoryIds($r);
            $r['potato_group'] = (int)($r['potato_group'] ?? 0);

            if (!$checkAndApplyRestrictedCategories($r['category_ids'], $restrictedCategories, $categoryUsage)) {
                continue;
            }

            $picked[(int)$r['product_id']] = $r;
            if (count($picked) >= $limit) break;
        }

        return array_values($picked);
    };

    // -------------------------------
    // Выбор по product_id (одна строка)
    // -------------------------------
    $pickById = function(
        PDO $pdo,
        int $langRu,
        int $langUk,
        int $langEn,
        int $productId
    ) use ($packProductName, $packProductSlug, $packCategoryIds) {

        $stmt = $pdo->prepare("
            SELECT
                m.product_id,
                m.menu_nutrient_id,
                m.sugar,

                pd_ru.product_name AS name_ru,
                pd_uk.product_name AS name_uk,
                pd_en.product_name AS name_en,

                pd_ru.slug AS slug_ru,
                pd_uk.slug AS slug_uk,
                pd_en.slug AS slug_en,

                GROUP_CONCAT(DISTINCT ptc.category_id ORDER BY ptc.category_id) AS category_ids,
                COALESCE(m.potato_group, 0) AS potato_group
            FROM menu m
            JOIN product_to_category ptc ON ptc.product_id = m.product_id

            LEFT JOIN product_description pd_ru ON pd_ru.product_id = m.product_id AND pd_ru.lang_id = ?
            LEFT JOIN product_description pd_uk ON pd_uk.product_id = m.product_id AND pd_uk.lang_id = ?
            LEFT JOIN product_description pd_en ON pd_en.product_id = m.product_id AND pd_en.lang_id = ?

            WHERE m.product_id = ?
            GROUP BY
                m.product_id, m.menu_nutrient_id, m.sugar,
                name_ru, name_uk, name_en,
                slug_ru, slug_uk, slug_en,
                potato_group
            LIMIT 1
        ");

        $stmt->execute([$langRu, $langUk, $langEn, $productId]);
        $row = $stmt->fetch();
        if (!$row) return null;

        $packProductName($row);
        $packProductSlug($row);
        $packCategoryIds($row);
        $row['potato_group'] = (int)($row['potato_group'] ?? 0);

        return $row;
    };

    // -------------------------------
    // Pick random product from category_id=12 for breakfast sugar=2
    // -------------------------------
    $pickBreakfastCat12 = function(
        PDO $pdo,
        int $langRu,
        int $langUk,
        int $langEn
    ) use ($packProductName, $packProductSlug, $packCategoryIds) {

        $stmt = $pdo->prepare("
            SELECT
                m.product_id,
                m.menu_nutrient_id,
                m.sugar,

                pd_ru.product_name AS name_ru,
                pd_uk.product_name AS name_uk,
                pd_en.product_name AS name_en,

                pd_ru.slug AS slug_ru,
                pd_uk.slug AS slug_uk,
                pd_en.slug AS slug_en,

                GROUP_CONCAT(DISTINCT ptc2.category_id ORDER BY ptc2.category_id) AS category_ids,
                COALESCE(m.potato_group, 0) AS potato_group
            FROM menu m
            JOIN product_to_category ptc12 ON ptc12.product_id = m.product_id AND ptc12.category_id = 12
            JOIN product_to_category ptc2  ON ptc2.product_id  = m.product_id

            LEFT JOIN product_description pd_ru ON pd_ru.product_id=m.product_id AND pd_ru.lang_id=?
            LEFT JOIN product_description pd_uk ON pd_uk.product_id=m.product_id AND pd_uk.lang_id=?
            LEFT JOIN product_description pd_en ON pd_en.product_id=m.product_id AND pd_en.lang_id=?

            WHERE m.breakfast_meal = 1
              AND m.sugar = 2

            GROUP BY
                m.product_id, m.menu_nutrient_id, m.sugar,
                name_ru, name_uk, name_en,
                slug_ru, slug_uk, slug_en,
                potato_group
            ORDER BY RAND()
            LIMIT 1
        ");

        $stmt->execute([$langRu, $langUk, $langEn]);
        $row = $stmt->fetch();
        if (!$row) return null;

        $packProductName($row);
        $packProductSlug($row);
        $packCategoryIds($row);
        $row['potato_group'] = (int)($row['potato_group'] ?? 0);

        return $row;
    };

    // -------------------------------
    // КБЖУ
    // -------------------------------
    $addNutrients = function(PDO $pdo, array $products): array {
        if (!$products) return [];

        $ids = array_column($products, 'product_id');
        $ph  = implode(',', array_fill(0, count($ids), '?'));

        $stmt = $pdo->prepare("
            SELECT product_id, nutrient_id, nutrient_value
            FROM nutrient_value
            WHERE product_id IN ($ph)
              AND nutrient_id IN (2, 3, 4, 14)
        ");
        $stmt->execute($ids);

        $map = [];
        foreach ($stmt as $r) {
            $map[(int)$r['product_id']][(int)$r['nutrient_id']] = (float)$r['nutrient_value'];
        }

        foreach ($products as &$p) {
            $pid = (int)$p['product_id'];
            $p['nutrients'] = [
                'protein'  => round($map[$pid][2]  ?? 0, 1),
                'fat'      => round($map[$pid][3]  ?? 0, 1),
                'carb'     => round($map[$pid][4]  ?? 0, 1),
                'calories' => round($map[$pid][14] ?? 0, 1),
            ];
        }
        unset($p);

        return $products;
    };

    // -------------------------------
    // Построение приёма
    // -------------------------------
    $buildMeal = function(
        int $day,
        string $key,
        PDO $pdo,
        int $langRu,
        int $langUk,
        int $langEn,
        array $restrictedCategories,
        array &$categoryUsage,
        array $plan,
        ?int $forceSugar = null
    ) use (
        $pickProducts,
        $pickById,
        $pickBreakfastCat12,
        $addNutrients,
        $checkAndApplyRestrictedCategories,
        $hasCategoryId,
        $hasPotatoGroup,
        $countByNid,
        $BLOCK_583_IF_CATEGORY_ID,
        $BLOCK_583_IF_POTATO_GROUP,
        $PID_583
    ) {

        $mealType   = ($key === 'breakfast') ? 'breakfast' : 'other';
        $sugarGroup = ($mealType === 'breakfast')
            ? ($forceSugar ?? (($day <= 2) ? 1 : 2))
            : 2;

        $used  = [];
        $items = [];

        // can add 583?
        $canAdd583 = function() use (
            &$items,
            $hasCategoryId,
            $hasPotatoGroup,
            $BLOCK_583_IF_CATEGORY_ID,
            $BLOCK_583_IF_POTATO_GROUP
        ): bool {
            if ($hasCategoryId($items, $BLOCK_583_IF_CATEGORY_ID)) return false;
            if ($hasPotatoGroup($items, $BLOCK_583_IF_POTATO_GROUP)) return false;
            return true;
        };

        /**********************
         *   З А В Т Р А К И   *
         **********************/
        if ($mealType === 'breakfast') {

            // ✅ Базовые группы нужны ТОЛЬКО для sugar=1
            if ($sugarGroup === 1) {
                foreach ([2, 4, 5] as $nid) {
                    $picked = $pickProducts(
                        $pdo,
                        $langRu, $langUk, $langEn,
                        $nid,
                        'breakfast',
                        $sugarGroup,
                        $used,
                        1,
                        $restrictedCategories,
                        $categoryUsage,
                        [482, 704, 692]
                    );
                    foreach ($picked as $r) {
                        $items[] = $r;
                        $used[]  = (int)$r['product_id'];
                    }
                }
            }

            // -------------------------------
            // sugar = 1 (логика как была)
            // -------------------------------
            if ($sugarGroup === 1) {

                if ($day === $plan['dayWith482']) {

                    if ($r = $pickById($pdo, $langRu, $langUk, $langEn, 482)) {
                        if ($checkAndApplyRestrictedCategories($r['category_ids'], $restrictedCategories, $categoryUsage)) {
                            $items[] = $r;
                            $used[]  = 482;
                        }
                    }

                    $picked8 = $pickProducts(
                        $pdo, $langRu, $langUk, $langEn,
                        8, 'breakfast', 1,
                        $used, 1,
                        $restrictedCategories, $categoryUsage,
                        [704, 482, 692]
                    );
                    foreach ($picked8 as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                    $extra6 = $pickProducts(
                        $pdo, $langRu, $langUk, $langEn,
                        6, 'breakfast', 1,
                        $used, 1,
                        $restrictedCategories, $categoryUsage,
                        [704, 482, 690, 692]
                    );
                    foreach ($extra6 as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                } elseif ($day === $plan['dayWith704']) {

                    foreach ([704, 690] as $pid) {
                        if ($r = $pickById($pdo, $langRu, $langUk, $langEn, $pid)) {
                            if ($checkAndApplyRestrictedCategories($r['category_ids'], $restrictedCategories, $categoryUsage)) {
                                $items[] = $r;
                                $used[]  = $pid;
                            }
                        }
                    }

                } else {

                    $picked1 = $pickProducts(
                        $pdo, $langRu, $langUk, $langEn,
                        1, 'breakfast', 1,
                        $used, 1,
                        $restrictedCategories, $categoryUsage,
                        [482, 704, 692]
                    );
                    foreach ($picked1 as $r) { $items[] = $r; $used[] = (int)$r['product_id']; }

                    $picked8 = $pickProducts(
                        $pdo, $langRu, $langUk, $langEn,
                        8, 'breakfast', 1,
                        $used, 1,
                        $restrictedCategories, $categoryUsage,
                        [482, 704, 692]
                    );
                    foreach ($picked8 as $r) { $items[] = $r; $used[] = (int)$r['product_id']; }
                }

                $extra4 = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    4, 'breakfast', 1,
                    $used, 1,
                    $restrictedCategories, $categoryUsage,
                    [482, 704, 692]
                );
                foreach ($extra4 as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                // ✅ ВАЖНО: овощи в sugar=1 завтраках НЕ добавляем вообще

            // -------------------------------
            // sugar = 2 (НОВАЯ ЛОГИКА)
            // -------------------------------
            } else {

                $isCat12Day = in_array($day, $plan['cat12Days'], true);

                if ($isCat12Day) {
                    // 1) 1 продукт cat12 (breakfast_meal=1, sugar=2)
                    $cat12 = $pickBreakfastCat12($pdo, $langRu, $langUk, $langEn);
                    if ($cat12 && $checkAndApplyRestrictedCategories($cat12['category_ids'], $restrictedCategories, $categoryUsage)) {
                        $items[] = $cat12;
                        $used[]  = (int)$cat12['product_id'];
                    } else {
                        $cat12 = null;
                    }

                    // 2) Добор белка: nid1 или nid8 (breakfast_meal=1)
                    $proteinNid = (rand(0, 1) === 0) ? 1 : 8;
                    if ($cat12 && (int)($cat12['menu_nutrient_id'] ?? 0) === 1) {
                        $proteinNid = 8;
                    }

                    $pickedProtein = $pickProducts(
                        $pdo, $langRu, $langUk, $langEn,
                        $proteinNid, 'breakfast', 2,
                        $used, 1,
                        $restrictedCategories, $categoryUsage,
                        [482, 704, 692]
                    );
                    foreach ($pickedProtein as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                } else {
                    // Обычный день: nid1 + nid8 (breakfast_meal=1)
                    foreach ([1, 8] as $nid) {
                        $picked = $pickProducts(
                            $pdo, $langRu, $langUk, $langEn,
                            $nid, 'breakfast', 2,
                            $used, 1,
                            $restrictedCategories, $categoryUsage,
                            [482, 704, 692]
                        );
                        foreach ($picked as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }
                    }
                }

                // nid7 (зелень) — 1
                $greens = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    7, 'breakfast', 2,
                    $used, 1,
                    $restrictedCategories, $categoryUsage,
                    [482, 704, 692]
                );
                foreach ($greens as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                // nid3 (овощи) — 2
                $veg = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    3, 'breakfast', 2,
                    $used, 2,
                    $restrictedCategories, $categoryUsage,
                    [482, 704, 692]
                );
                foreach ($veg as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }

                // nid2 — 1 (breakfast_meal=1)
                $bread = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    2, 'breakfast', 2,
                    $used, 1,
                    $restrictedCategories, $categoryUsage,
                    [482, 704, 692]
                );
                foreach ($bread as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }
            }

            // защита: 482 и 704 НЕ могут быть вместе
            $ids = array_map('intval', array_column($items, 'product_id'));
            if (in_array(482, $ids, true) && in_array(704, $ids, true)) {
                if ($day === $plan['dayWith704']) {
                    $items = array_values(array_filter($items, fn($p) => (int)$p['product_id'] !== 482));
                } elseif ($day === $plan['dayWith482']) {
                    $items = array_values(array_filter($items, fn($p) => (int)$p['product_id'] !== 704));
                }
                $used = array_values(array_unique(array_map('intval', array_column($items, 'product_id'))));
            }

            // если в завтраке есть 704 — добавляем 583, но НЕ если cat44 или potato_group=1
            $ids = array_map('intval', array_column($items, 'product_id'));
            if (in_array(704, $ids, true) && !in_array($PID_583, $ids, true) && $canAdd583()) {
                if ($r = $pickById($pdo, $langRu, $langUk, $langEn, $PID_583)) {
                    if ($checkAndApplyRestrictedCategories($r['category_ids'], $restrictedCategories, $categoryUsage)) {
                        $items[] = $r;
                        $used[]  = $PID_583;
                    }
                }
            }

        /**********************
         *   О Б Е Д / У Ж И Н *
         **********************/
        } else {

            // базовые группы в other (как было)
            foreach ([1, 2, 4, 5, 6] as $nid) {
                $picked = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    $nid, 'other', 2,
                    $used, 1,
                    $restrictedCategories, $categoryUsage,
                    [482, 704]
                );
                foreach ($picked as $r) { $items[] = $r; $used[] = (int)$r['product_id']; }
            }

            // пары морковь + партнёр (как было)
            $hasCarrotPair = false;

            if (rand(0, 1) === 1) {
                $carrotRow = $pickById($pdo, $langRu, $langUk, $langEn, 162);
                if ($carrotRow && !in_array(162, $used, true)) {

                    $carrotAllowed = true;
                    $carrotHits = array_values(array_intersect($carrotRow['category_ids'] ?? [], $restrictedCategories));
                    foreach ($carrotHits as $catId) {
                        if (($categoryUsage[$catId] ?? 0) >= 2) { $carrotAllowed = false; break; }
                    }

                    if ($carrotAllowed) {
                        foreach ($carrotHits as $catId) {
                            $categoryUsage[$catId] = ($categoryUsage[$catId] ?? 0) + 1;
                        }

                        $items[] = $carrotRow;
                        $used[]  = 162;

                        $partnerId  = (rand(0, 1) === 0) ? 291 : 292;
                        $partnerRow = $pickById($pdo, $langRu, $langUk, $langEn, $partnerId);

                        if ($partnerRow && !in_array($partnerId, $used, true)) {
                            $partnerAllowed = true;
                            $partnerHits = array_values(array_intersect($partnerRow['category_ids'] ?? [], $restrictedCategories));
                            foreach ($partnerHits as $catId) {
                                if (($categoryUsage[$catId] ?? 0) >= 2) { $partnerAllowed = false; break; }
                            }

                            if ($partnerAllowed) {
                                foreach ($partnerHits as $catId) {
                                    $categoryUsage[$catId] = ($categoryUsage[$catId] ?? 0) + 1;
                                }

                                $items[] = $partnerRow;
                                $used[]  = $partnerId;
                                $hasCarrotPair = true;

                            } else {
                                // rollback carrot
                                $items = array_values(array_filter($items, fn($p) => (int)$p['product_id'] !== 162));
                                $used  = array_values(array_filter($used,  fn($id) => (int)$id !== 162));
                                foreach ($carrotHits as $catId) {
                                    $categoryUsage[$catId] = max(0, ($categoryUsage[$catId] ?? 1) - 1);
                                }
                            }
                        } else {
                            // rollback carrot
                            $items = array_values(array_filter($items, fn($p) => (int)$p['product_id'] !== 162));
                            $used  = array_values(array_filter($used,  fn($id) => (int)$id !== 162));
                            foreach ($carrotHits as $catId) {
                                $categoryUsage[$catId] = max(0, ($categoryUsage[$catId] ?? 1) - 1);
                            }
                        }
                    }
                }
            }

            // овощи other: любые (other_meal=1), 2 шт — если не было пары
            if (!$hasCarrotPair) {
                $veg = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    3, 'other', 2,
                    $used, 2,
                    $restrictedCategories, $categoryUsage,
                    [482, 704, 162, 291, 292]
                );
                foreach ($veg as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }
            }

            // зелень other — если не было пары (как было)
            if (!$hasCarrotPair) {
                $extra7 = $pickProducts(
                    $pdo, $langRu, $langUk, $langEn,
                    7, 'other', 2,
                    $used, 1,
                    $restrictedCategories, $categoryUsage,
                    [482, 704]
                );
                foreach ($extra7 as $row) { $items[] = $row; $used[] = (int)$row['product_id']; }
            }
        }

        // ОБЯЗАТЕЛЬНО добавляем 583 в обед/ужин (но НЕ если cat44 или potato_group=1)
        if ($mealType === 'other' && !in_array($PID_583, $used, true) && $canAdd583()) {
            if ($r = $pickById($pdo, $langRu, $langUk, $langEn, $PID_583)) {
                if ($checkAndApplyRestrictedCategories($r['category_ids'], $restrictedCategories, $categoryUsage)) {
                    $items[] = $r;
                    $used[]  = $PID_583;
                }
            }
        }

        // Уникализация по product_id + КБЖУ
        $uniq = [];
        foreach ($items as $it) {
            $uniq[(int)$it['product_id']] = $it;
        }
        $items = $addNutrients($pdo, array_values($uniq));

        $tot = ['protein' => 0, 'fat' => 0, 'carb' => 0, 'calories' => 0];
        foreach ($items as $p) {
            $tot['protein']  += $p['nutrients']['protein']  ?? 0;
            $tot['fat']      += $p['nutrients']['fat']      ?? 0;
            $tot['carb']     += $p['nutrients']['carb']     ?? 0;
            $tot['calories'] += $p['nutrients']['calories'] ?? 0;
        }
        foreach ($tot as &$v) $v = round($v, 1);
        unset($v);

        return [
            'sugar_group' => $sugarGroup,
            'products'    => $items,
            'totals'      => $tot,
        ];
    };

    // -------------------------------
    // Основной цикл
    // -------------------------------
    $result = ['lang' => $langCode, 'days' => []];
    $plan   = [
        'dayWith482' => $dayWith482,
        'dayWith704' => $dayWith704,
        'cat12Days'  => $cat12Days,
    ];

    for ($day = 1; $day <= $days; $day++) {
        $forceSugar = ($day <= 2) ? 1 : 2;

        $breakfast = $buildMeal(
            $day, 'breakfast',
            $pdo,
            $langRu, $langUk, $langEn,
            $restrictedCategories, $categoryUsage,
            $plan, $forceSugar
        );

        $lunch = $buildMeal(
            $day, 'lunch',
            $pdo,
            $langRu, $langUk, $langEn,
            $restrictedCategories, $categoryUsage,
            $plan, 2
        );

        $dinner = $buildMeal(
            $day, 'dinner',
            $pdo,
            $langRu, $langUk, $langEn,
            $restrictedCategories, $categoryUsage,
            $plan, 2
        );

        $totalDay = ['protein' => 0, 'fat' => 0, 'carb' => 0, 'calories' => 0];
        foreach (['breakfast', 'lunch', 'dinner'] as $m) {
            foreach ($totalDay as $k => &$v) {
                $v += ${$m}['totals'][$k];
            }
            unset($v);
        }
        foreach ($totalDay as &$v) $v = round($v, 1);
        unset($v);

        $result['days'][] = [
            'day'        => $day,
            'meta'       => $plan,
            'meals'      => compact('breakfast', 'lunch', 'dinner'),
            'totals_day' => $totalDay,
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
