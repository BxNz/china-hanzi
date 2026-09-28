<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

try {
    $pdo = getDbConnection();

    // 1. GET /api/words.php - Fetch vocabulary words
    if ($method === 'GET') {
        $level = $_GET['level'] ?? null;
        $search = $_GET['search'] ?? null;
        $limit = $_GET['limit'] ?? null;

        $sql = "SELECT id, hanzi AS h, pinyin AS p, meaning AS t, level AS l, category AS cat, created_at FROM words WHERE 1=1";
        $params = [];

        if ($level !== null && $level !== '' && $level !== 'all') {
            if ($level === 'custom') {
                $sql .= " AND level IS NULL";
            } else {
                $sql .= " AND level = ?";
                $params[] = (int)$level;
            }
        }

        if (!empty($search)) {
            $sql .= " AND (hanzi LIKE ? OR pinyin LIKE ? OR meaning LIKE ?)";
            $term = '%' . $search . '%';
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY id DESC";

        if (!empty($limit)) {
            $sql .= " LIMIT ?";
            $params[] = (int)$limit;
        }

        $stmt = $pdo->prepare($sql);

        if (!empty($limit)) {
            $paramIndex = 1;
            foreach ($params as $p) {
                if (is_int($p)) {
                    $stmt->bindValue($paramIndex++, $p, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($paramIndex++, $p, PDO::PARAM_STR);
                }
            }
            $stmt->execute();
        } else {
            $stmt->execute($params);
        }

        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['id'] = (int)$row['id'];
            if ($row['l'] !== null) {
                $row['l'] = (int)$row['l'];
            }
        }

        echo json_encode($rows, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 2. POST /api/words.php - Insert or update word
    if ($method === 'POST') {
        $rawInput = file_get_contents('php://input');
        $body = json_decode($rawInput, true);
        if (!$body) {
            $body = $_POST;
        }

        $hanzi = trim($body['hanzi'] ?? '');
        $pinyin = trim($body['pinyin'] ?? '');
        $meaning = trim($body['meaning'] ?? '');
        $level = (isset($body['level']) && $body['level'] !== '' && $body['level'] !== null) ? (int)$body['level'] : null;
        $category = trim($body['category'] ?? 'custom');

        if (empty($meaning)) {
            $meaning = 'คำที่เพิ่มเอง';
        }

        if (empty($hanzi)) {
            http_response_code(400);
            echo json_encode(['error' => 'ตัวอักษรจีน (hanzi) จำเป็นต้องระบุ'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $checkStmt = $pdo->prepare("SELECT id FROM words WHERE hanzi = ?");
        $checkStmt->execute([$hanzi]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $updateStmt = $pdo->prepare("UPDATE words SET pinyin = ?, meaning = ?, level = ?, category = ? WHERE hanzi = ?");
            $updateStmt->execute([$pinyin, $meaning, $level, $category, $hanzi]);
        } else {
            $insertStmt = $pdo->prepare("INSERT INTO words (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)");
            $insertStmt->execute([$hanzi, $pinyin, $meaning, $level, $category]);
        }

        $getStmt = $pdo->prepare("SELECT id, hanzi AS h, pinyin AS p, meaning AS t, level AS l, category AS cat, created_at FROM words WHERE hanzi = ?");
        $getStmt->execute([$hanzi]);
        $updatedRow = $getStmt->fetch();

        if ($updatedRow) {
            $updatedRow['id'] = (int)$updatedRow['id'];
            if ($updatedRow['l'] !== null) {
                $updatedRow['l'] = (int)$updatedRow['l'];
            }
        }

        echo json_encode([
            'message' => 'บันทึกคำศัพท์ลง MySQL DB เรียบร้อยแล้ว',
            'word' => $updatedRow
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // 3. DELETE /api/words.php - Delete word by id or hanzi
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        $hanzi = $_GET['hanzi'] ?? null;

        // Parse PATH_INFO if query string was not used
        $pathInfo = $_SERVER['PATH_INFO'] ?? '';
        if (empty($id) && empty($hanzi) && !empty($pathInfo)) {
            $parts = array_values(array_filter(explode('/', $pathInfo)));
            if (count($parts) >= 2 && $parts[0] === 'by-hanzi') {
                $hanzi = urldecode($parts[1]);
            } elseif (count($parts) >= 1 && is_numeric($parts[0])) {
                $id = (int)$parts[0];
            }
        }

        if (!empty($id)) {
            $stmt = $pdo->prepare("DELETE FROM words WHERE id = ?");
            $stmt->execute([(int)$id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'ลบคำศัพท์เรียบร้อยแล้ว', 'deletedId' => (int)$id], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ไม่พบคำศัพท์ที่ต้องการลบ'], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        if (!empty($hanzi)) {
            $stmt = $pdo->prepare("DELETE FROM words WHERE hanzi = ?");
            $stmt->execute([$hanzi]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'ลบคำศัพท์เรียบร้อยแล้ว', 'hanzi' => $hanzi], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ไม่พบคำศัพท์ที่ต้องการลบ'], JSON_UNESCAPED_UNICODE);
            }
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'กรุณาระบุ id หรือ hanzi ที่ต้องการลบ'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
