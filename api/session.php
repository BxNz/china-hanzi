<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($_SESSION['user_id'])) {
    echo json_encode(['authenticated' => false], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'user' => [
        'username' => $_SESSION['username'],
        'name' => $_SESSION['name'] ?? $_SESSION['username']
    ]
], JSON_UNESCAPED_UNICODE);