<?php
$paths = ['sqlite:api/vocab.sqlite', 'sqlite:./api/vocab.sqlite', 'sqlite:api\\vocab.sqlite', 'sqlite::memory:'];
foreach ($paths as $dsn) {
    try {
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE IF NOT EXISTS __probe (id INTEGER primary key)');
        echo $dsn . ': OK' . PHP_EOL;
    } catch (Throwable $e) {
        echo $dsn . ': ' . $e->getMessage() . PHP_EOL;
    }
}
