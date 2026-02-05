<?php
// exercises-extended.php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

/**
 * Aggregates:
 *  - WGER: https://wger.de/api/v2/exerciseinfo/
 *  - Local DB (exercises_db):
 *      exercises (exercise_name by lang_id)
 *      exercises_media (exercise_img / exercise_video filenames)
 *
 * Behavior:
 *  - English name: from WGER (translations)
 *  - Russian/Ukrainian name: from local DB (lang_id 1 = RU, 3 = UK) -> ex.local_name
 *  - Images:
 *      If WGER exerciseinfo has images -> keep them (frontend may also load via /exerciseimage cache)
 *      If WGER has NO images -> provide ex.local_images from local files
 *  - Videos:
 *      Provide ex.local_videos from local files (only when WGER has no images, per your rule)
 *
 * Local files are stored in:
 *  backend/public/img/exercises/
 * and served publicly as:
 *  /img/exercises/<filename>
 */

// ------------------------------
// 🔧 Helpers (fallback if not defined in db.php)
// ------------------------------
if (!function_exists('getParam')) {
    function getParam(string $key, $default = null) {
        return $_GET[$key] ?? $default;
    }
}
if (!function_exists('sqlPlaceholders')) {
    function sqlPlaceholders(array $arr): string {
        return implode(',', array_fill(0, count($arr), '?'));
    }
}

// ------------------------------
// 🔹 INPUT
// ------------------------------
$lang = getParam('lang', 'en'); // en | ru | uk

// Everything else is passed to WGER
$query = $_GET;
unset($query['lang']);
$queryString = http_build_query($query);

// ------------------------------
// 🔹 FETCH FROM WGER
// ------------------------------
$wgerUrl = "https://wger.de/api/v2/exerciseinfo/?" . $queryString;

// Use a small context to avoid occasional server blocks/timeouts
$context = stream_context_create([
    'http' => [
        'timeout' => 12,
        'header'  => "User-Agent: nutrition-n/1.0\r\n",
    ]
]);

$wgerJson = @file_get_contents($wgerUrl, false, $context);

if ($wgerJson === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Failed to fetch data from WGER'], JSON_UNESCAPED_UNICODE);
    exit;
}

$wger = json_decode($wgerJson, true);
if (!is_array($wger)) {
    http_response_code(502);
    echo json_encode(['error' => 'Invalid JSON from WGER'], JSON_UNESCAPED_UNICODE);
    exit;
}

$results = $wger['results'] ?? [];
if (!is_array($results) || count($results) === 0) {
    // Return as-is (e.g., empty page)
    echo json_encode($wger, JSON_UNESCAPED_UNICODE);
    exit;
}

// ------------------------------
// 🔹 COLLECT EXERCISE IDS
// ------------------------------
$exerciseIds = [];
foreach ($results as $ex) {
    if (isset($ex['id'])) {
        $exerciseIds[] = (int)$ex['id'];
    }
}
$exerciseIds = array_values(array_unique($exerciseIds));

if (count($exerciseIds) === 0) {
    echo json_encode($wger, JSON_UNESCAPED_UNICODE);
    exit;
}

$placeholders = sqlPlaceholders($exerciseIds);

// ------------------------------
// 🔹 LOCAL DATA: NAMES (RU/UK) from exercises_db.exercises
// ------------------------------
$nameMap = []; // { exercise_id: ['name_ru' => ..., 'name_uk' => ...] }

try {
    $sqlNames = "
        SELECT
            e.exercise_id,
            MAX(CASE WHEN e.lang_id = 1 THEN e.exercise_name END) AS name_ru,
            MAX(CASE WHEN e.lang_id = 3 THEN e.exercise_name END) AS name_uk
        FROM exercises e
        WHERE e.exercise_id IN ($placeholders)
        GROUP BY e.exercise_id
    ";
    $stmt = $pdoExercises->prepare($sqlNames);
    $stmt->execute($exerciseIds);

    foreach ($stmt->fetchAll() as $row) {
        $eid = (int)$row['exercise_id'];
        $nameMap[$eid] = [
            'name_ru' => $row['name_ru'] ?? null,
            'name_uk' => $row['name_uk'] ?? null,
        ];
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Local DB query failed (names)',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ------------------------------
// 🔹 LOCAL DATA: MEDIA from exercises_db.exercises_media
// ------------------------------
$mediaMap = []; // { exercise_id: { images: [filename], videos: [filename] } }

try {
    $sqlMedia = "
        SELECT
            unique_id,
            exercise_id,
            exercise_img,
            exercise_video
        FROM exercises_media
        WHERE exercise_id IN ($placeholders)
    ";
    $stmt2 = $pdoExercises->prepare($sqlMedia);
    $stmt2->execute($exerciseIds);

    foreach ($stmt2->fetchAll() as $row) {
        $eid = (int)$row['exercise_id'];
        if (!isset($mediaMap[$eid])) {
            $mediaMap[$eid] = ['images' => [], 'videos' => []];
        }

        // store only filenames (no paths)
        if (!empty($row['exercise_img'])) {
            $mediaMap[$eid]['images'][] = basename($row['exercise_img']);
        }
        if (!empty($row['exercise_video'])) {
            $mediaMap[$eid]['videos'][] = basename($row['exercise_video']);
        }
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Local DB query failed (media)',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ------------------------------
// 🔹 PUBLIC PATH FOR LOCAL FILES
// You store files in: backend/public/img/exercises/
// Public URL becomes: /img/exercises/<file>
// ------------------------------
// --- Публичный путь к локальным файлам
$LOCAL_MEDIA_BASE = '/img/exercises/';

foreach ($results as &$ex) {
    $id = isset($ex['id']) ? (int)$ex['id'] : 0;

    // defaults
    $ex['local_name'] = null;
    $ex['local_images'] = [];
    $ex['local_videos'] = [];

    if ($id <= 0) continue;

    // ---- Name override (RU/UK only) ----
    if (isset($nameMap[$id])) {
        if ($lang === 'ru' && !empty($nameMap[$id]['name_ru'])) {
            $ex['local_name'] = $nameMap[$id]['name_ru'];
        } elseif ($lang === 'uk' && !empty($nameMap[$id]['name_uk'])) {
            $ex['local_name'] = $nameMap[$id]['name_uk'];
        }
    }

    // ---- Local media ALWAYS (frontend will decide fallback) ----
    $localMedia = $mediaMap[$id] ?? ['images' => [], 'videos' => []];

    if (!empty($localMedia['images'])) {
        $ex['local_images'] = array_values(array_unique(array_map(
            fn($file) => $LOCAL_MEDIA_BASE . basename($file),
            $localMedia['images']
        )));
    }

    if (!empty($localMedia['videos'])) {
        $ex['local_videos'] = array_values(array_unique(array_map(
            fn($file) => $LOCAL_MEDIA_BASE . basename($file),
            $localMedia['videos']
        )));
    }
}
unset($ex);

$wger['results'] = $results;

// ------------------------------
// ✅ OUTPUT JSON
// ------------------------------
echo json_encode($wger, JSON_UNESCAPED_UNICODE);
