hCRI.io -- website and API
==========================

PHP + MySQL backend (no framework), a React/Vite frontend, and static pages. The built frontend bundle
(assets/app.js) is committed, so the site runs without a build step on the server.

LAYOUT
------
index.php          Router for pages, share/report previews (Open Graph), sitemap.xml and /api/*
api/               JSON endpoints; api/_core/ holds shared code (db, auth, SPD maths, PDF builders, rate limiter)
api/v1_*.php       Personal-token API used by scripts and the hCRI Companion app (see assets/hcri-api-spec.pdf)
frontend/          React source (Vite). `npm run build` regenerates assets/app.js
assets/            Built bundle, icons, manifest, API reference PDF
companion/         hCRI Companion landing page and user manual (HTML + PDF)
sql/               One-off migrations (run once, in the database, when a release says so)
database.sql       Full schema for a fresh install
help_content.json  Text of the in-site Help window
privacy.html, terms.html, licenses.html, about/   Static pages

CONFIGURATION
-------------
Secrets are never committed. Copy api/_core/secrets.local.php.example to api/_core/secrets.local.php on the
server (or set the same names as environment variables) and fill in the database and mail credentials.

BRANCHES AND DEPLOY
-------------------
develop  -> dev.hcri.io  (deployed automatically by .github/workflows/deploy-dev.yml)
master   -> www.hcri.io  (production)
Merge develop into master only for a release.

RELEASE CHECKLIST
-----------------
1. Run any new file in sql/ on the production database (see the release notes / commit message).
2. If the frontend changed: `cd frontend && npm run build`, and commit the regenerated assets/app.js.
3. Regenerate assets/hcri-api-spec.pdf if the API changed, and the Companion manual PDF if the manual changed.
4. Update companion/manual/index.html ("Covers app version", What's new) when the app version changes.

SECURITY NOTES
--------------
* Login, sign-up and password reset are rate-limited per IP (and per account/mailbox) by api/_core/ratelimit.php,
  which keeps small counter files in the system temp directory.
* .htaccess sets the security headers and cache rules. JS/CSS are revalidated on every load (ETag), PHP is never cached.
* The API uses bearer tokens (not cookies), so Access-Control-Allow-Origin: * is intentional.

LICENSE
-------
GNU Affero General Public License v3 or later; see LICENSE and THIRD-PARTY-NOTICES.md.
