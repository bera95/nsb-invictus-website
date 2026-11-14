# Deployment — Hostinger Premium Web Hosting

The production site is **static files + one PHP file**. There is no Node.js process, database or VPS.

## One-time setup

### 1. GitHub repository
1. Push this project to a GitHub repository (branch `main`).
2. Under **Settings → Secrets and variables → Actions → Variables**, add:
   - `PUBLIC_SITE_URL` = `https://www.your-domain.com` (no trailing slash)
   - `PUBLIC_TURNSTILE_SITE_KEY` = *(optional)* Cloudflare Turnstile site key
3. Push to `main`. The **Build & publish production** workflow creates the `production` branch, which contains only the built site.

### 2. Hostinger Git deployment
1. hPanel → **Websites → (your site) → Advanced → GIT**.
2. Connect the repository and choose branch **`production`**, install path **`public_html`** (it must be empty the first time — back up and remove any default files).
3. Enable **Auto deployment** (GitHub App method, or add the shown webhook URL to the repository's webhooks).

**Alternative without Git:** run `npm run build` locally, run `composer install --no-dev` inside `dist/api`, then upload the *contents* of `dist/` to `public_html` with the hPanel File Manager or SFTP.

### 3. Email (inquiry notifications)
1. hPanel → **Emails** → create a mailbox on your domain, e.g. `website@your-domain.com`.
2. Make sure the domain's **SPF, DKIM and DMARC** records are active (hPanel → Emails → DNS settings) so notifications don't land in spam.
3. Create the server-side config **outside** `public_html`:
   - File Manager → home directory (one level above `public_html`) → create folder `private` → file `nsb-config.php`
   - Paste the contents of `public/api/config.example.php` and fill in real values:
     - `allowed_host` — your domain, e.g. `www.your-domain.com`
     - `mail_to` — who receives inquiries
     - `mail_from` / `smtp_user` — the mailbox you created
     - `smtp_host` `smtp.hostinger.com`, `smtp_port` `465`, `smtp_pass` — the mailbox password
     - `rate_limit_salt` — any long random string
   - The endpoint looks for `../../private/nsb-config.php` relative to `public_html/api/`.
4. Submit a test inquiry on `/contact/` and confirm it arrives.

> PHP `mail()` without SMTP is limited on Hostinger (about 100 emails a day) and has poor deliverability. Always configure SMTP.

### 4. Domain & HTTPS
- Enable the free SSL certificate in hPanel.
- In `public/.htaccess`, uncomment the canonical-host rule and set your domain.

### 5. Optional: Cloudflare Turnstile
Create a Turnstile widget for your domain. Put the **site key** in the GitHub variable `PUBLIC_TURNSTILE_SITE_KEY` and the **secret key** in `nsb-config.php` (`turnstile_secret`).

## Everyday workflow

1. Edit content or code on a branch, then run `npm run dev` / `npm run preview` locally.
2. Merge to `main`.
3. GitHub Actions type-checks, builds and publishes to `production`.
4. Hostinger auto-deploys within a minute.

## Rollback

Re-run an earlier successful workflow run (Actions → choose run → **Re-run jobs**), or revert the commit on `main`. Either republishes the previous build to `production`.

## Secrets policy

- No secrets are stored in Git. `private/`, `public/api/config.php`, `.env` and `api/vendor/` are git-ignored.
- The post-build step deletes `api/config.php` from `dist/` if one was accidentally created.
- `public/api/.htaccess` blocks direct access to config, JSON and vendor files.
