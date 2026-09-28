<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $dbInfo = getDbConnection();
    $pdo = $dbInfo['pdo'];
    $driver = $dbInfo['driver'];

    $stmt = $pdo->query("SELECT COUNT(*) AS count FROM words");
    $row = $stmt->fetch();
    
    echo json_encode([
        'status' => 'online',
        'db' => $driver,
        'totalWords' => $row ? (int)$row['count'] : 0
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'offline',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
