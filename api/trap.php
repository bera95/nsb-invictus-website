<?php
/**
 * Bot trap. Linked invisibly from every page and disallowed in robots.txt, so only
 * scrapers that ignore the rules ever arrive here. They are:
 *  1) flagged for 7 days (hashed IP) — their form submissions are silently discarded;
 *  2) served an endless maze of tiny pages that only link deeper into the maze.
 * Cheap for the server: no database, no delays, a few hundred bytes per page.
 */
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('Cache-Control: no-store');
header_remove('X-Powered-By');

$config = [];
$configFile = dirname(__DIR__, 2) . '/private/nsb-config.php';
if (is_file($configFile)) $config = require $configFile;
if (!is_array($config)) $config = [];

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$hash = hash('sha256', $ip . ($config['rate_limit_salt'] ?? 'nsb'));
$file = rtrim($config['rate_limit_dir'] ?? sys_get_temp_dir(), '/') . '/nsb-trap.json';
$list = is_file($file) ? (json_decode((string) @file_get_contents($file), true) ?: []) : [];
$now = time();
$list = array_filter($list, static function ($exp) use ($now) { return (int) $exp > $now; });
if (count($list) < 50000) {
    $list[$hash] = $now + 7 * 86400;
    @file_put_contents($file, json_encode($list), LOCK_EX);
}

// Endless maze: every page links to five more random maze pages.
$links = '';
for ($i = 0; $i < 5; $i++) {
    $p = bin2hex(random_bytes(6));
    $links .= '<li><a href="/api/trap.php?p=' . $p . '">Archive ' . strtoupper(substr($p, 0, 4)) . '</a></li>';
}
$page = htmlspecialchars((string) ($_GET['p'] ?? 'index'), ENT_QUOTES);
echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Archive ' . $page . '</title></head><body><h1>Archive ' . $page . '</h1><ul>' . $links . '</ul></body></html>';
