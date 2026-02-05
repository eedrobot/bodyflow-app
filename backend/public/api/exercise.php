<?php
// backend/public/api/exercise.php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

function jsonFail(int $code, array $payload) {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function fetchJson(string $url, int $timeout = 12): array {
  $context = stream_context_create([
    'http' => [
      'timeout' => $timeout,
      'header'  => "User-Agent: nutrition-n/1.0\r\n",
    ]
  ]);

  $raw = @file_get_contents($url, false, $context);
  if ($raw === false) {
    throw new Exception("Failed to fetch: $url");
  }

  $json = json_decode($raw, true);
  if (!is_array($json)) {
    throw new Exception("Invalid JSON from: $url");
  }

  return $json;
}

function normalizeSecondaryMuscles($value): array {
  // поддержка:
  // - JSON строка: "[1,2,3]"
  // - CSV строка: "1,2,3"
  // - пусто
  if ($value === null) return [];
  if (is_array($value)) return array_values(array_unique(array_map('intval', $value)));

  $s = trim((string)$value);
  if ($s === '') return [];

  // JSON?
  if ($s[0] === '[') {
    $arr = json_decode($s, true);
    if (is_array($arr)) {
      return array_values(array_unique(array_map('intval', $arr)));
    }
  }

  // CSV
  $parts = preg_split('/\s*,\s*/', $s);
  $ids = [];
  foreach ($parts as $p) {
    if ($p === '') continue;
    $n = (int)$p;
    if ($n > 0) $ids[] = $n;
  }
  return array_values(array_unique($ids));
}

$id   = (int)getParam('id', 0);
$lang = (string)getParam('lang', 'en'); // en|ru|uk

if ($id <= 0) {
  jsonFail(400, ['error' => 'Missing or invalid id']);
}

// ------------------------------
// 1) WGER: exerciseinfo by id
// ------------------------------
try {
  $wgerExercise = fetchJson("https://wger.de/api/v2/exerciseinfo/{$id}/");
} catch (Throwable $e) {
  jsonFail(502, ['error' => 'WGER exerciseinfo fetch failed', 'message' => $e->getMessage()]);
}

// ------------------------------
// 2) WGER: videos (separate endpoint)
// ------------------------------
$wgerVideos = [];
try {
  // wger video endpoint supports filtering by exercise
  $videosJson = fetchJson("https://wger.de/api/v2/video/?exercise={$id}&limit=200");
  $wgerVideos = is_array($videosJson['results'] ?? null) ? $videosJson['results'] : [];
} catch (Throwable $e) {
  // не валим весь ответ, просто оставляем пусто
  $wgerVideos = [];
}

// ------------------------------
// 3) Local: exercises (name/description/muscles_secondary)
// Таблица exercises_db.exercises:
// unique_id, exercise_id, exercise_name, exercise_description, muscles_secondary
// (если у тебя всё-таки есть lang_id — тоже поддержим)
// ------------------------------
$local = [
  'exercise_name' => null,
  'exercise_description' => null,
  'muscles_secondary_ids' => []
];

try {
  // Проверим, есть ли колонка lang_id (на всякий)
  $cols = $pdoExercises->query("SHOW COLUMNS FROM exercises")->fetchAll();
  $hasLangId = false;
  foreach ($cols as $c) {
    if (($c['Field'] ?? '') === 'lang_id') { $hasLangId = true; break; }
  }

  if ($hasLangId) {
    // маппинг как у тебя раньше: ru=1, uk=3, en=2 (если вдруг понадобится)
    $langId = ($lang === 'ru') ? 1 : (($lang === 'uk') ? 3 : 2);

    $stmt = $pdoExercises->prepare("
      SELECT exercise_name, exercise_description, muscles_secondary
      FROM exercises
      WHERE exercise_id = ?
      ORDER BY (lang_id = ?) DESC
      LIMIT 1
    ");
    $stmt->execute([$id, $langId]);
  } else {
    $stmt = $pdoExercises->prepare("
      SELECT exercise_name, exercise_description, muscles_secondary
      FROM exercises
      WHERE exercise_id = ?
      LIMIT 1
    ");
    $stmt->execute([$id]);
  }

  $row = $stmt->fetch();
  if ($row) {
    $local['exercise_name'] = $row['exercise_name'] ?? null;
    $local['exercise_description'] = $row['exercise_description'] ?? null;
    $local['muscles_secondary_ids'] = normalizeSecondaryMuscles($row['muscles_secondary'] ?? null);

    $localSecondaryNames = [];

    if (!empty($row['muscles_secondary'])) {
      $decoded = json_decode($row['muscles_secondary'], true);
      if (is_array($decoded)) {
        $localSecondaryNames = array_values($decoded);
      }
    }
  }
} catch (Throwable $e) {
  jsonFail(500, ['error' => 'Local DB query failed (exercises)', 'message' => $e->getMessage()]);
}

// ------------------------------
// 4) Local: images/videos fallback files from exercises_media
// backend/public/img/exercises/<file>
// public: /img/exercises/<file>
// ------------------------------
$LOCAL_MEDIA_BASE = '/img/exercises/';
$localImages = [];
$localVideos = [];

try {
  $stmt = $pdoExercises->prepare("
    SELECT exercise_img, exercise_video
    FROM exercises_media
    WHERE exercise_id = ?
  ");
  $stmt->execute([$id]);

  while ($r = $stmt->fetch()) {
    if (!empty($r['exercise_img'])) {
      $localImages[] = $LOCAL_MEDIA_BASE . basename($r['exercise_img']);
    }
    if (!empty($r['exercise_video'])) {
      $localVideos[] = $LOCAL_MEDIA_BASE . basename($r['exercise_video']);
    }
  }

  $localImages = array_values(array_unique($localImages));
  $localVideos = array_values(array_unique($localVideos));
} catch (Throwable $e) {
  jsonFail(500, ['error' => 'Local DB query failed (exercises_media)', 'message' => $e->getMessage()]);
}

// ------------------------------
// 5) Build response for frontend
// - primary muscles: from wgerExercise.muscles (keep english + images)
// - secondary muscles: from local DB (ids only)
// - category: wger category (id + english name)
// - videos: from /video endpoint; fallback to exerciseinfo.videos; then local videos (optional)
// - exercise images: wger images else local_images
// ------------------------------
$WGER_BASE = 'https://wger.de';

$primaryMuscles = [];
if (is_array($wgerExercise['muscles'] ?? null)) {
  foreach ($wgerExercise['muscles'] as $m) {
    $primaryMuscles[] = [
      'id' => (int)($m['id'] ?? 0),
      'name' => $m['name'] ?? null,        // латинское/оригинальное
      'name_en' => $m['name_en'] ?? null,  // английское
      'is_front' => (bool)($m['is_front'] ?? false),
      'image_url_main' => !empty($m['image_url_main']) ? ($WGER_BASE . $m['image_url_main']) : null,
      'image_url_secondary' => !empty($m['image_url_secondary']) ? ($WGER_BASE . $m['image_url_secondary']) : null,
    ];
  }
}

$secondaryMuscles = [];
if (is_array($wgerExercise['muscles_secondary'] ?? null)) {
  foreach ($wgerExercise['muscles_secondary'] as $i => $m) {
    $localName = $localSecondaryNames[$i] ?? null;

    $secondaryMuscles[] = [
      'id' => (int)($m['id'] ?? 0),

      // ✅ name ВСЕГДА из локальной БД для текущего языка
      // fallback на WGER только если в локалке пусто
      'name' => !empty($localName)
        ? $localName
        : ($m['name'] ?? null),

      'is_front' => (bool)($m['is_front'] ?? false),

      'image_url_main' =>
        !empty($m['image_url_main']) ? ($WGER_BASE . $m['image_url_main']) : null,

      'image_url_secondary' =>
        !empty($m['image_url_secondary']) ? ($WGER_BASE . $m['image_url_secondary']) : null,
    ];
  }
}


$category = $wgerExercise['category'] ?? null;
$categoryId = is_array($category) ? (int)($category['id'] ?? 0) : 0;

$wgerImages = is_array($wgerExercise['images'] ?? null) ? $wgerExercise['images'] : [];
$hasWgerImages = count($wgerImages) > 0;

$exerciseImages = $hasWgerImages ? $wgerImages : array_map(fn($url) => [
  'image' => $url,
  'is_main' => false,
  'source' => 'local'
], $localImages);

// videos from /video endpoint -> fallback to exerciseinfo.videos -> fallback to localVideos
$videos = [];
if (!empty($wgerVideos)) {
  foreach ($wgerVideos as $v) {
    if (!empty($v['video'])) $videos[] = $v['video'];
  }
} elseif (is_array($wgerExercise['videos'] ?? null) && count($wgerExercise['videos']) > 0) {
  foreach ($wgerExercise['videos'] as $v) {
    if (!empty($v['video'])) $videos[] = $v['video'];
  }
} elseif (!empty($localVideos)) {
  $videos = $localVideos;
}

$videos = array_values(array_unique($videos));

$response = [
  'id' => (int)($wgerExercise['id'] ?? $id),
  'uuid' => $wgerExercise['uuid'] ?? null,

  // Категория: для EN можно показать category.name, для RU/UK ты покажешь по id через i18n
  'category' => [
    'id' => $categoryId,
    'name' => is_array($category) ? ($category['name'] ?? null) : null,
  ],

  // Основные мышцы (с картинками) — по WGER
  'muscles_primary' => $primaryMuscles,

  // Второстепенные мышцы (с картинками) — по WGER
'muscles_secondary' => $secondaryMuscles,

  // Название/описание — из локальной БД (как ты просила)
  'name' => $local['exercise_name'],
  'description' => $local['exercise_description'],

  // Картинки упражнения: WGER или local fallback
  'images' => $exerciseImages,

  // Видео: /video endpoint (или fallback)
  'videos' => $videos,

  // На всякий — чтобы фронт мог показать fallback-галерею локальных отдельно
  'local_images' => $localImages,
  'local_videos' => $localVideos,
];

echo json_encode($response, JSON_UNESCAPED_UNICODE);
