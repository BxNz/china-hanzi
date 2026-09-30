<?php
$base = __DIR__ . '/api/vocab.sqlite';
$formats = [
    'plain' => 'sqlite:' . $base,
    'forward' => 'sqlite:' . str_replace('\\', '/', $base),
    'double' => 'sqlite:/'. str_replace('\\', '/', $base),
    'triple' => 'sqlite:////' . str_replace('\\', '/', $base),
];
foreach ($formats as $label => $dsn) {
    try {
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('CREATE TABLE IF NOT EXISTS __probe (id INTEGER primary key)');
        echo $label . ': OK' . PHP_EOL;
    } catch (Throwable $e) {
        echo $label . ': ' . $e->getMessage() . PHP_EOL;
    }
}
