<?php
// Local preview router for `php -S` (mirrors Apache behaviour on Hostinger).
$root = $_SERVER['DOCUMENT_ROOT'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Mirrors public/api/.htaccess: config, metadata and vendor files are not web-accessible.
if (preg_match('#^/api/((config|config\.example)\.php|.*\.(json|lock|md)|vendor/.*)$#', $path)) { http_response_code(403); exit('Forbidden'); }
$file = $root . $path;
if (is_file($file)) return false;
if (is_dir($file) && is_file(rtrim($file, '/') . '/index.html')) {
    if (substr($path, -1) !== '/') { header('Location: ' . $path . '/', true, 301); exit; }
    return false;
}
http_response_code(404);
readfile($root . '/404.html');
