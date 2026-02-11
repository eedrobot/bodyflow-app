<?php
/**
 * Usage:
 *   php generate_slugs.php
 *   php generate_slugs.php --dry-run
 *   php generate_slugs.php --limit=200
 *   php generate_slugs.php --start=1000
 *
 * It fills product_description.slug where slug is NULL or ''.
 */

declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

// -------------------- CONFIG --------------------
$db = [
  'host' => '127.0.0.1',
  'port' => 3306,
  'name' => 'nutrition_bd',
  'user' => 'root',
  'pass' => '',
  'charset' => 'utf8mb4',
];

$table = 'product_description'; // change if needed
$slugColumn = 'slug';
$nameColumn = 'product_name';
// ------------------------------------------------

$options = parseArgs($argv);
$dryRun = isset($options['dry-run']) ? (bool)$options['dry-run'] : false;
$limit  = isset($options['limit']) ? max(1, (int)$options['limit']) : 0;
$start  = isset($options['start']) ? max(0, (int)$options['start']) : 0;

$dsn = sprintf(
  'mysql:host=%s;port=%d;dbname=%s;charset=%s',
  $db['host'],
  $db['port'],
  $db['name'],
  $db['charset']
);

$pdo = new PDO($dsn, $db['user'], $db['pass'], [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

echo "Connected. dry-run=" . ($dryRun ? 'YES' : 'NO') . PHP_EOL;

$sqlSelect = "
  SELECT product_id, lang_id, {$nameColumn} AS name
  FROM {$table}
  WHERE ( {$slugColumn} IS NULL OR {$slugColumn} = '' )
    AND product_id >= :start
  ORDER BY product_id ASC, lang_id ASC
" . ($limit > 0 ? " LIMIT {$limit}" : "");

$stmt = $pdo->prepare($sqlSelect);
$stmt->execute(['start' => $start]);
$rows = $stmt->fetchAll();

if (!$rows) {
  echo "No rows to update." . PHP_EOL;
  exit(0);
}

$sqlExists = "
  SELECT 1
  FROM {$table}
  WHERE lang_id = :lang_id AND {$slugColumn} = :slug
  LIMIT 1
";

$sqlUpdate = "
  UPDATE {$table}
  SET {$slugColumn} = :slug
  WHERE product_id = :product_id AND lang_id = :lang_id
";

$existsStmt = $pdo->prepare($sqlExists);
$updateStmt = $pdo->prepare($sqlUpdate);

$updated = 0;
$skipped = 0;

$pdo->beginTransaction();
try {
  foreach ($rows as $r) {
    $productId = (int)$r['product_id'];
    $langId    = (int)$r['lang_id'];
    $name      = trim((string)$r['name']);

    if ($name === '') {
      $skipped++;
      echo "[SKIP] product_id={$productId} lang_id={$langId} empty name" . PHP_EOL;
      continue;
    }

    $baseSlug = makeSlug($name);
    if ($baseSlug === '') {
      $baseSlug = "product-{$productId}";
    }

    $slug = ensureUniqueSlug($existsStmt, $baseSlug, $langId);

    if ($dryRun) {
      echo "[DRY]  product_id={$productId} lang_id={$langId} => {$slug}" . PHP_EOL;
      $updated++;
      continue;
    }

    $updateStmt->execute([
      'slug' => $slug,
      'product_id' => $productId,
      'lang_id' => $langId,
    ]);

    echo "[OK]   product_id={$productId} lang_id={$langId} => {$slug}" . PHP_EOL;
    $updated++;
  }

  if ($dryRun) {
    $pdo->rollBack();
    echo "Dry-run completed. Nothing was written." . PHP_EOL;
  } else {
    $pdo->commit();
    echo "Committed." . PHP_EOL;
  }
} catch (Exception $e) {
  $pdo->rollBack();
  fwrite(STDERR, "ERROR: " . $e->getMessage() . PHP_EOL);
  exit(1);
}

echo "Done. updated={$updated}, skipped={$skipped}" . PHP_EOL;


// -------------------- Helpers --------------------

function parseArgs(array $argv): array {
  $out = [];
  foreach ($argv as $i => $arg) {
    if ($i === 0) continue;

    // PHP 7.x compatible: check prefix '--'
    if (substr($arg, 0, 2) === '--') {
      $arg = substr($arg, 2);

      if ($arg === 'dry-run') {
        $out['dry-run'] = true;
        continue;
      }

      // PHP 7.x compatible: contains '='
      if (strpos($arg, '=') !== false) {
        $parts = explode('=', $arg, 2);
        $k = $parts[0];
        $v = $parts[1];
        $out[$k] = $v;
      } else {
        $out[$arg] = true;
      }
    }
  }
  return $out;
}

function ensureUniqueSlug(PDOStatement $existsStmt, string $baseSlug, int $langId): string {
  $slug = $baseSlug;
  $n = 2;

  // If baseSlug is already taken, add suffix -2, -3, ...
  while (true) {
    $existsStmt->execute(['lang_id' => $langId, 'slug' => $slug]);
    $exists = (bool)$existsStmt->fetchColumn();

    if (!$exists) {
      return $slug;
    }

    $slug = $baseSlug . '-' . $n;
    $n++;

    // safety
    if ($n > 9999) {
      return $baseSlug . '-' . bin2hex(random_bytes(3));
    }
  }
}

function makeSlug(string $name): string {
  $s = mb_strtolower($name, 'UTF-8');

  // Normalize some symbols to words
  $s = str_replace(['&', '@'], [' and ', ' at '], $s);

  // Remove quotes
  $s = preg_replace('~[\'"`]~u', '', $s);

  // Transliterate RU/UK -> latin
  $s = translitCyrToLat($s);

  // Replace any non-alnum with hyphen
  $s = preg_replace('~[^a-z0-9]+~', '-', $s);

  // Trim hyphens
  $s = trim($s, '-');

  // Collapse multiple hyphens
  $s = preg_replace('~-{2,}~', '-', $s);

  // Limit length (safe for indexes)
  if (strlen($s) > 190) {
    $s = substr($s, 0, 190);
    $s = rtrim($s, '-');
  }

  return is_string($s) ? $s : '';
}

function translitCyrToLat(string $s): string {
  static $map = [
    // RU
    'а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'y',
    'к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f',
    'х'=>'h','ц'=>'ts','ч'=>'ch','ш'=>'sh','щ'=>'shch','ъ'=>'','ы'=>'y','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya',
    // UK
    'є'=>'ye','і'=>'i','ї'=>'yi','ґ'=>'g',
  ];

  return strtr($s, $map);
}
