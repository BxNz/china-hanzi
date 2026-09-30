<?php
require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo = null;
    static $driverUsed = null;

    if ($pdo !== null) {
        return ['pdo' => $pdo, 'driver' => $driverUsed];
    }

    $driverMode = strtolower(DB_DRIVER);

    if ($driverMode === 'mysql' || $driverMode === 'auto') {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $driverUsed = 'MySQL';
        } catch (PDOException $e) {
            // Attempt auto-creating database if it doesn't exist on local MySQL
            if ($e->getCode() == 1049) {
                try {
                    $rootDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
                    $tmpPdo = new PDO($rootDsn, DB_USER, DB_PASS, $options);
                    $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                    $driverUsed = 'MySQL';
                } catch (Exception $ex) {
                    $pdo = null;
                }
            }

            // Fallback to SQLite if MySQL fails in 'auto' mode
            if ($pdo === null && $driverMode === 'auto' && extension_loaded('pdo_sqlite')) {
                try {
                    $sqlitePath = SQLITE_FILE;
                    $pdo = new PDO("sqlite:" . $sqlitePath);
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    $driverUsed = 'SQLite';
                } catch (Exception $sqEx) {
                    throw new Exception("ไม่สามารถเชื่อมต่อฐานข้อมูลได้: " . $e->getMessage());
                }
            } elseif ($pdo === null) {
                throw new Exception("ไม่สามารถเชื่อมต่อ MySQL ได้: " . $e->getMessage() . " (กรุณากด Start ที่โมดูล MySQL ใน XAMPP Control Panel)");
            }
        }
    } elseif ($driverMode === 'sqlite') {
        $sqlitePath = SQLITE_FILE;
        $pdo = new PDO("sqlite:" . $sqlitePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $driverUsed = 'SQLite';
    }

    if (!$pdo) {
        throw new Exception("ไม่สามารถสร้างการเชื่อมต่อฐานข้อมูลได้");
    }

    // Initialize tables & seed data
    initDatabaseTable($pdo, $driverUsed);
    initUsersTable($pdo, $driverUsed);

    return ['pdo' => $pdo, 'driver' => $driverUsed];
}

function initDatabaseTable($pdo, $driverType) {
    if ($driverType === 'SQLite') {
        $tableSql = "
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hanzi TEXT UNIQUE NOT NULL,
                pinyin TEXT,
                meaning TEXT,
                level INTEGER,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ";
    } else {
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
    }
    $pdo->exec($tableSql);

    // Check count & seed if empty
    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM `words`");
    $row = $stmt->fetch();
    if ($row && (int)$row['cnt'] === 0) {
        seedInitialVocab($pdo, $driverType);
    }
}

function initUsersTable($pdo, $driverType) {
    if ($driverType === 'SQLite') {
        $tableSql = "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT DEFAULT 'Admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        ";
    } else {
        $tableSql = "
            CREATE TABLE IF NOT EXISTS `users` (
                `id` INT AUTO_INCREMENT PRIMARY KEY,
                `username` VARCHAR(50) NOT NULL UNIQUE,
                `password` VARCHAR(255) NOT NULL,
                `name` VARCHAR(100) DEFAULT 'Admin',
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
    }
    $pdo->exec($tableSql);

    // Seed default admin account if empty
    $stmt = $pdo->query("SELECT COUNT(*) AS cnt FROM users WHERE username = 'admin'");
    $row = $stmt->fetch();
    if ($row && (int)$row['cnt'] === 0) {
        $defaultHash = '$2y$10$aOjdSwKFlUVZFdZgkKMN.uMf4jOyC4CwGdMcF6wK.D.44J6Na6mI2';
        $insert = $pdo->prepare("INSERT INTO users (username, password, name) VALUES ('admin', ?, 'ผู้ดูแลระบบ')");
        $insert->execute([$defaultHash]);
    }
}

function seedInitialVocab($pdo, $driverType) {
    $jsonPath = dirname(__DIR__) . '/json/vocab.json';
    if (!file_exists($jsonPath)) return;

    $jsonContent = file_get_contents($jsonPath);
    $vocabList = json_decode($jsonContent, true);
    if (!is_array($vocabList)) return;

    try {
        $pdo->beginTransaction();
        if ($driverType === 'SQLite') {
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO `words` (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)");
        } else {
            $stmt = $pdo->prepare("INSERT IGNORE INTO `words` (hanzi, pinyin, meaning, level, category) VALUES (?, ?, ?, ?, ?)");
        }

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
        $pdo->commit();
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
    }
}
