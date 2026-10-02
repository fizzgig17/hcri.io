// tests/mockApi.js
//
// There's no PHP/MySQL backend available to the test suite (CI included),
// so every `index.php/api/*` request is intercepted and answered with a
// canned response instead. Response shapes are copied from the real
// backend handlers (api/auth/me.php, api/reports_list.php, etc.) rather
// than guessed, so a shape mismatch here is a real bug worth fixing on
// either side.
//
// Usage:
//   import { installMockApi } from './mockApi.js';
//   await installMockApi(page, { loggedIn: true, reports: [...] });

import { fixtures } from './fixtures.js';

/**
 * Routes every `index.php/api/*` request made by the page to canned JSON.
 * @param {import('@playwright/test').Page} page
 * @param {object} [opts]
 * @param {boolean} [opts.loggedIn] - if true, /auth/me returns a user and
 *   requests are treated as authenticated; if false (default), /auth/me
 *   404s like the real backend does for a missing/invalid token.
 * @param {object} [opts.user] - overrides the default mock user.
 * @param {Array}  [opts.reports] - overrides the default /reports list.
 * @param {Array}  [opts.notices] - overrides the default /notices list.
 * @param {object} [opts.explore] - overrides the default /explore response.
 * @param {Array}  [opts.adminUsers] - overrides the default /admin/users list.
 */
export async function installMockApi(page, opts = {}) {
  const loggedIn = !!opts.loggedIn;
  const user = opts.user || fixtures.user;
  const reports = opts.reports || fixtures.reports;
  const notices = opts.notices || fixtures.notices;
  const explore = opts.explore || fixtures.explore;
  const adminUsers = opts.adminUsers || fixtures.adminUsers;

  await page.route('**/index.php/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/.*\/index\.php\/api/, '');
    const method = req.method();

    const json = (body, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

    // ── Auth ────────────────────────────────────────────────────────────
    if (path === '/auth/me' && method === 'GET') {
      return loggedIn ? json(user) : json({ error: 'Unauthorized' }, 401);
    }
    if (path === '/auth/login' && method === 'POST') {
      return json({ token: 'mock-token', user });
    }
    if (path === '/auth/logout') {
      return json({ ok: true });
    }

    // ── Reports (the logged-in dashboard's sidebar list) ───────────────
    if (path === '/reports' && method === 'GET') {
      return loggedIn ? json(reports) : json({ error: 'Unauthorized' }, 401);
    }
    if (/^\/reports\/\d+$/.test(path) && method === 'GET') {
      const id = Number(path.split('/').pop());
      const r = reports.find((x) => x.id === id) || reports[0];
      return json({ ...r, wls: fixtures.spd.wls, vals: fixtures.spd.vals, rcsBins: fixtures.rcsBins });
    }

    // ── Notices (top banner / per-report banner) ───────────────────────
    if (path === '/notices' && method === 'GET') {
      return json(notices);
    }

    // ── Explore (public browsing) ───────────────────────────────────────
    if (path === '/explore' && method === 'GET') {
      return json(explore);
    }
    if (path === '/explore_stats' || path === '/explore/stats') {
      return json(fixtures.exploreStats);
    }
    // Opening a single report from Explore's results grid (Explore.jsx's
    // openReport). Keep this ABOVE /admin's own /admin/... routes and
    // below the plain /explore -- order matters since path matching here
    // is sequential, not a router.
    if (/^\/explore\/\d+$/.test(path) && method === 'GET') {
      const id = Number(path.split('/').pop());
      const item = fixtures.exploreItem.id === id ? fixtures.exploreItem : { ...fixtures.exploreItem, id };
      return json(item);
    }

    // ── Categories (filter dropdowns) ───────────────────────────────────
    if (path === '/categories' && method === 'GET') {
      return json(fixtures.categories);
    }

    // ── Admin (AdminPanel.jsx's adminFetch, api/admin.php) ──────────────
    if (path === '/admin' && method === 'GET') {
      return json(fixtures.adminStats);
    }
    if (path === '/admin/users' && method === 'GET') {
      return json(adminUsers);
    }
    if (/^\/admin\/users\/\d+\/reports$/.test(path) && method === 'GET') {
      return json(reports);
    }
    if (/^\/admin\/users\/\d+$/.test(path) && (method === 'PATCH' || method === 'DELETE')) {
      return json({ ok: true });
    }
    if (path === '/admin/recalc' && method === 'POST') {
      return json(fixtures.adminStats);
    }
    if (path === '/admin/featured') {
      return method === 'GET' ? json(fixtures.featured) : json({ ok: true });
    }
    if (path === '/admin/notices' && method === 'GET') {
      return json(fixtures.adminNotices);
    }
    if (/^\/admin\/notices/.test(path)) {
      return json({ ok: true });
    }
    if (path === '/admin/categories' && method === 'GET') {
      return json(fixtures.adminCategories);
    }
    if (path === '/admin/categories/case_prefs' && method === 'GET') {
      return json({ prefs: {} });
    }
    if (/^\/admin\/categories\//.test(path)) {
      return json({ ok: true });
    }

    // Anything else: respond with an empty-but-valid 200 rather than letting
    // the request hang or 404 — keeps unrelated/unmocked calls from cascading
    // into a blank screen when the point of the test is something else.
    return json({});
  });
}
