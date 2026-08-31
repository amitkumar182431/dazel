<?php
// Dazel JSON API. Run with: php -S localhost:8000

declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$db = new PDO('sqlite:' . __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'dazel.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT, google_sub TEXT UNIQUE, created_at TEXT NOT NULL)');
$db->exec('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, items_json TEXT NOT NULL, total INTEGER NOT NULL, created_at TEXT NOT NULL)');

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
function input(): array {
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}
function userResponse(array $user): array {
    return ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']];
}
function currentUser(PDO $db): ?array {
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) return null;
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}
function products(): array {
    $source = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'products.js');
    preg_match('/const DAZEL_PRODUCTS\s*=\s*(\[[\s\S]*?\]);/', $source, $matches);
    if (empty($matches[1])) respond(['error' => 'Product catalog unavailable.'], 500);
    $catalog = json_decode($matches[1], true);
    return is_array($catalog) ? $catalog : [];
}
function googleUser(string $credential): array {
    $clientId = getenv('GOOGLE_CLIENT_ID') ?: '';
    if (!$clientId) respond(['error' => 'Google login is not configured. Set GOOGLE_CLIENT_ID.'], 503);
    $context = stream_context_create(['http' => ['timeout' => 5]]);
    $raw = @file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential), false, $context);
    $claims = json_decode($raw ?: '', true);
    if (!is_array($claims) || ($claims['aud'] ?? '') !== $clientId || empty($claims['sub']) || empty($claims['email']) || ($claims['email_verified'] ?? 'false') !== 'true') {
        respond(['error' => 'Google identity could not be verified.'], 401);
    }
    return ['sub' => $claims['sub'], 'email' => strtolower($claims['email']), 'name' => $claims['name'] ?? $claims['email']];
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET' && $action === 'products') {
    $category = $_GET['category'] ?? '';
    $query = strtolower(trim($_GET['q'] ?? ''));
    $result = array_values(array_filter(products(), static function (array $product) use ($category, $query): bool {
        $matchesCategory = !$category || $product['cat'] === $category;
        $matchesQuery = !$query || str_contains(strtolower($product['name']), $query) || str_contains($product['cat'], $query);
        return $matchesCategory && $matchesQuery;
    }));
    respond(['products' => $result, 'total' => count($result)]);
}

if ($method === 'POST' && in_array($action, ['signup', 'login', 'google'], true)) {
    $body = input();
    if ($action === 'google') {
        $identity = googleUser((string)($body['credential'] ?? ''));
        $stmt = $db->prepare('SELECT * FROM users WHERE google_sub = ? OR email = ?');
        $stmt->execute([$identity['sub'], $identity['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            $user = ['id' => 'usr_' . bin2hex(random_bytes(12)), 'name' => $identity['name'], 'email' => $identity['email'], 'password_hash' => null, 'google_sub' => $identity['sub'], 'created_at' => gmdate('c')];
            $stmt = $db->prepare('INSERT INTO users (id,name,email,password_hash,google_sub,created_at) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$user['id'], $user['name'], $user['email'], null, $user['google_sub'], $user['created_at']]);
        } elseif (!$user['google_sub']) {
            $stmt = $db->prepare('UPDATE users SET google_sub = ? WHERE id = ?');
            $stmt->execute([$identity['sub'], $user['id']]);
        }
    } else {
        $email = strtolower(trim((string)($body['email'] ?? '')));
        $password = (string)($body['password'] ?? '');
        if ($action === 'signup') {
            $name = trim((string)($body['name'] ?? ''));
            if (!$name || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) respond(['error' => 'Name, valid email, and a password of at least 6 characters are required.'], 400);
            $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) respond(['error' => 'An account with that email already exists.'], 409);
            $user = ['id' => 'usr_' . bin2hex(random_bytes(12)), 'name' => $name, 'email' => $email, 'password_hash' => password_hash($password, PASSWORD_DEFAULT), 'google_sub' => null, 'created_at' => gmdate('c')];
            $stmt = $db->prepare('INSERT INTO users (id,name,email,password_hash,google_sub,created_at) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$user['id'], $user['name'], $user['email'], $user['password_hash'], null, $user['created_at']]);
        } else {
            $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$user || !$user['password_hash'] || !password_verify($password, $user['password_hash'])) respond(['error' => 'Invalid email or password.'], 401);
        }
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user['id'];
    respond(['user' => userResponse($user)]);
}

if ($method === 'POST' && $action === 'orders') {
    $user = currentUser($db);
    $body = input();
    $catalog = products();
    $byId = [];
    foreach ($catalog as $product) $byId[$product['id']] = $product;
    $items = $body['items'] ?? [];
    if (!is_array($items) || !$items) respond(['error' => 'Your order must contain at least one item.'], 400);
    $normalized = [];
    $total = 0;
    foreach ($items as $item) {
        $id = (string)($item['id'] ?? '');
        $qty = filter_var($item['qty'] ?? 0, FILTER_VALIDATE_INT);
        if (!isset($byId[$id]) || !$qty || $qty < 1 || $qty > 99) respond(['error' => 'Order contains an invalid product or quantity.'], 400);
        $normalized[] = ['id' => $id, 'name' => $byId[$id]['name'], 'price' => $byId[$id]['price'], 'qty' => $qty];
        $total += $byId[$id]['price'] * $qty;
    }
    $orderId = 'DZL' . random_int(100000, 999999);
    $stmt = $db->prepare('INSERT INTO orders (id,user_id,items_json,total,created_at) VALUES (?,?,?,?,?)');
    $stmt->execute([$orderId, $user['id'] ?? null, json_encode($normalized), $total, gmdate('c')]);
    respond(['order' => ['id' => $orderId, 'total' => $total, 'createdAt' => gmdate('c')]], 201);
}

respond(['error' => 'Route not found.'], 404);
