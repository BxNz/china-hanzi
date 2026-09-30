<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);
    if (!$body) {
        $body = $_POST;
    }

    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'กรุณากรอก Username และ Password'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $dbInfo = getDbConnection();
    $pdo = $dbInfo['pdo'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['name'] = $user['name'] ?? $user['username'];

        echo json_encode([
            'success' => true,
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'user' => [
                'username' => $user['username'],
                'name' => $user['name'] ?? $user['username']
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Username หรือ Password ไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
