<?php
declare(strict_types=1);
session_start();
$db = new PDO('sqlite:' . __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'dazel.sqlite');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT, google_sub TEXT UNIQUE, created_at TEXT NOT NULL)');
$db->exec('CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, user_id TEXT, items_json TEXT NOT NULL, total INTEGER NOT NULL, created_at TEXT NOT NULL)');
$adminEmail = getenv('DAZEL_ADMIN_EMAIL') ?: '';
$user = null;
if (!empty($_SESSION['user_id'])) {
    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
}
if (!$adminEmail || !$user || strtolower($user['email']) !== strtolower($adminEmail)) {
    http_response_code(403);
    exit('Admin access denied. Set DAZEL_ADMIN_EMAIL and log in with that account.');
}
$users = $db->query('SELECT id,name,email,created_at FROM users ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
$orders = $db->query('SELECT id,user_id,total,created_at FROM orders ORDER BY created_at DESC')->fetchAll(PDO::FETCH_ASSOC);
function e(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dazel Admin</title>
<style>body{margin:0;background:#fbf3ea;color:#2b1420;font:15px system-ui,sans-serif}main{max-width:1100px;margin:0 auto;padding:42px 22px}h1,h2{font-family:Georgia,serif;color:#5c1330}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #decfc7;padding-bottom:20px;margin-bottom:30px}.stats{display:flex;gap:14px;flex-wrap:wrap}.stat,section{background:#fff;border:1px solid #e3d5cf;border-radius:8px;padding:20px}.stat{min-width:150px}.stat b{display:block;font:28px Georgia;color:#5c1330}section{margin-top:22px;overflow:auto}table{border-collapse:collapse;width:100%;min-width:560px}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid #eee}th{color:#6b4a56;font-size:12px;text-transform:uppercase;letter-spacing:.08em}</style></head>
<body><main><header><div><h1>Dazel Admin</h1><div>Signed in as <?=e($user['email'])?></div></div><a href="/">View store</a></header>
<div class="stats"><div class="stat"><b><?=count($users)?></b>Customers</div><div class="stat"><b><?=count($orders)?></b>Orders</div><div class="stat"><b>₹<?=number_format(array_sum(array_column($orders, 'total'))) ?></b>Revenue</div></div>
<section><h2>Recent Orders</h2><table><tr><th>Order</th><th>User</th><th>Total</th><th>Created</th></tr><?php foreach ($orders as $order): ?><tr><td><?=e($order['id'])?></td><td><?=e($order['user_id'] ?: 'Guest')?></td><td>₹<?=number_format((int)$order['total'])?></td><td><?=e($order['created_at'])?></td></tr><?php endforeach; ?></table></section>
<section><h2>Customers</h2><table><tr><th>Name</th><th>Email</th><th>Created</th></tr><?php foreach ($users as $customer): ?><tr><td><?=e($customer['name'])?></td><td><?=e($customer['email'])?></td><td><?=e($customer['created_at'])?></td></tr><?php endforeach; ?></table></section>
</main></body></html>
