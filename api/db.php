<?php
require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        // If database does not exist on local XAMPP (Error code 1049), attempt auto-creation
        if ($e->getCode() == 1049) {
            try {
                $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
                $tmpPdo = new PDO($rootDsn, DB_USER, DB_PASS, $options);
                $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            } catch (Exception $ex) {
                throw new Exception("ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . $e->getMessage());
            }
        } else {
            throw new Exception("ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . $e->getMessage());
        }
    }

    // Auto-create table & seed initial vocabulary if table doesn't exist or is empty
    initDatabaseTable($pdo);

    return $pdo;
}

function initDatabaseTable($pdo) {
    $tableSql = "
        CREATE TABLE IF NOT EXISTS `words` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `hanzi` VARCHAR(255) NOT NULL UNIQUE,
            `pinyin` VARCHAR(255) DEFAULT NULL,
            `meaning` TEXT DEFAULT NULL,
            `level` INT DEFAULT NULL,
            `category` VARCHAR(100) DEFAULT 'general',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $pdo->exec($tableSql);

    // Seed data if empty
    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `words`");
    $row = $stmt->fetch();
    if ($row && (int)$row['cnt'] === 0) {
        seedInitialVocab($pdo);
    }
}

function seedInitialVocab($pdo) {
    $jsonPath = dirname(__DIR__) . '/json/vocab.json';
    if (!file_exists($jsonPath)) return;

    $jsonContent = file_get_contents($jsonPath);
    $vocabList = json_decode($jsonContent, true);
    if (!is_array($vocabList)) return;

    $stmt = $pdo->prepare("INSERT IGNORE INTO `words` (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)");
    foreach ($vocabList as $item) {
        if (!empty($item['h'])) {
            $stmt->execute([
                $item['h'],
                $item['p'] ?? '',
                $item['t'] ?? '',
                isset($item['l']) && $item['l'] !== null ? (int)$item['l'] : null,
                $item['cat'] ?? 'general'
            ]);
        }
    }
}
