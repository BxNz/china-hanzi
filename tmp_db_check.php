<?php
require __DIR__ . '/api/db.php';
try {
    $conn = getDbConnection();
    echo $conn['driver'];
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
