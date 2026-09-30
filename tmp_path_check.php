<?php
$dir = __DIR__ . '/api';
$path = __DIR__ . '/api/vocab.sqlite';
var_dump($dir, is_dir($dir), is_writable($dir), file_exists($path));
$fh = @fopen($path, 'wb');
if ($fh) {
    fwrite($fh, '');
    fclose($fh);
    echo "WRITE_OK\n";
} else {
    echo "WRITE_FAIL\n";
}
