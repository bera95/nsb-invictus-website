<?php
/**
 * Inquiry endpoint configuration — TEMPLATE.
 *
 * Copy to the server as:  ~/private/nsb-config.php   (outside public_html — recommended)
 *                    or:  public_html/api/config.php (blocked by .htaccess)
 * Never commit the real file to Git.
 */
return [
    'site_name'      => 'NSB INVICTUS',
    'allowed_host'   => 'www.example.com',          // PLACEHOLDER: production host name
    'mail_to'        => ['hello@example.com'],      // PLACEHOLDER: who receives inquiries
    'mail_from'      => 'website@example.com',      // PLACEHOLDER: mailbox on your domain
    'mail_from_name' => 'NSB INVICTUS Website',

    // Authenticated SMTP (recommended). Hostinger: smtp.hostinger.com, port 465 (SSL) or 587 (TLS).
    // Leave smtp_host empty to fall back to PHP mail().
    'smtp_host'      => 'smtp.hostinger.com',
    'smtp_port'      => 465,
    'smtp_user'      => 'website@example.com',
    'smtp_pass'      => 'CHANGE_ME',

    // Optional Cloudflare Turnstile secret key (pair with PUBLIC_TURNSTILE_SITE_KEY at build time).
    'turnstile_secret' => '',

    // Local development only: log messages instead of sending email.
    'log_only' => false,

    // Rate limiting
    'rate_limit_per_hour' => 5,
    'rate_limit_salt'     => 'CHANGE_ME_RANDOM_STRING',
    'rate_limit_dir'      => null,                  // null = system temp dir
];
