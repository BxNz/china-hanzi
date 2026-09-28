<?php
// Configuration file for Database Connection (XAMPP & InfinityFree)

// Default Configuration for XAMPP (Localhost)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'china_hanzi');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_CHARSET', 'utf8mb4');

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
 * 3. Uncomment and fill in the values below:
 *
 * define('DB_HOST', 'sqlXXX.infinityfree.com');
 * define('DB_NAME', 'if0_XXXXXXXX_china_hanzi');
 * define('DB_USER', 'if0_XXXXXXXX');
 * define('DB_PASS', 'YourPasswordHere');
 * ==============================================================================
 */
