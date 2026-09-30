<?php
// Configuration file for Database Connection (XAMPP & InfinityFree)

// Database Driver Mode:
// 'auto'  => Try MySQL first. If MySQL is offline (e.g. local XAMPP MySQL not started), fallback to SQLite automatically!
// 'mysql' => Force MySQL connection (recommended for InfinityFree deployment)
// 'sqlite'=> Force SQLite connection
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'auto');

// Default MySQL Configuration for XAMPP (Localhost)
define('DB_HOST', getenv('DB_HOST') ?: 'sql210.infinityfree.com');
define('DB_NAME', getenv('DB_NAME') ?: 'if0_43028600_china_hanzi');
define('DB_USER', getenv('DB_USER') ?: 'if0_43028600');
define('DB_PASS', getenv('DB_PASS') ?: 'JBQuu2tUTM3H0');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

// SQLite File Path (Fallback for Local Development)
// Use a temp directory instead of the project folder because some Windows/OneDrive setups block SQLite file creation in workspace paths.
define('SQLITE_FILE', rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'china_hanzi_vocab.sqlite');

/*
 * ==============================================================================
 * INSTRUCTIONS FOR DEPLOYING TO INFINITYFREE HOSTING:
 * ==============================================================================
 * When you upload this project to InfinityFree:
 * 1. Log in to InfinityFree Control Panel (vPanel) and create a MySQL Database.
 * 2. Note your MySQL Details:
 *    - MySQL Host Name (e.g., sql123.infinityfree.com)
 *    - MySQL Database Name (e.g., if0_38000000_china_hanzi)
 *    - MySQL Username (e.g., if0_38000000)
 *    - MySQL Password (your vPanel account password)
 * 3. Uncomment and set the variables below:
 *
 * define('DB_DRIVER', 'mysql');
 * define('DB_HOST', 'sqlXXX.infinityfree.com');
 * define('DB_NAME', 'if0_XXXXXXXX_china_hanzi');
 * define('DB_USER', 'if0_XXXXXXXX');
 * define('DB_PASS', 'YourPasswordHere');
 * ==============================================================================
 */
