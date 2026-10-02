# Frontend smoke/regression tests

Playwright tests that render the real built app and check it against a
**mocked** backend (there's no PHP/MySQL server available in CI or most dev
machines) — see `mockApi.js` and `fixtures.js`. They check structure and
rendering, not whether the PHP endpoints themselves are correct.

## Running

```sh
cd frontend
npm install
npm test            # builds (into throwaway test-dist/) then runs the suite
```

Or, if you've already run `npm run test:build` and just want to re-run:

```sh
npx playwright test
npx playwright test --ui     # interactive mode
npx playwright show-report   # after a run, opens the HTML report
```

## Why a separate build config

`vite.config.test.js` builds into `test-dist/` instead of the real
`../assets` that `vite.config.js` (the deploy build) uses. That config has
`emptyOutDir: true`, which would wipe `assets/` of everything Vite doesn't
produce itself — favicons, fonts, `chart.umd.js`, `hcri-photo.js`, OG
images, etc. — on every test run. Never point the test suite at the real
`vite.config.js`.

## What's covered

- `guest-landing.spec.js` — the logged-out landing page boots with no
  console errors, desktop and mobile.
- `dashboard.spec.js` — logging in lands on Explore (auto-opened by
  App.jsx's post-login useEffect), with no console errors. The classic
  Sidebar + "Saved Reports" list UI (still reachable today behind a
  `?report=` deep link, since it's what the post-login redirect check
  exempts) is intentionally NOT covered here -- it's on the list to be
  removed in an upcoming frontend revamp, so it's not worth testing now.
- `explore.spec.js` — the public Explore page boots; regression-tests the
  filter-sidebar layout bug (desktop: fixed 270px sidebar beside the
  results grid; mobile: full width behind a toggle; collapse arrow works)
  that this suite was first written to catch; and covers opening a report
  card into its detail view (and back) with no console errors -- this is
  the real, current way a report gets opened now (Explore.jsx's
  openReport), not the old Sidebar list.
- `admin.spec.js` — the admin panel (non-admins don't see the Admin
  button; an admin can open it and see stats/users with no console
  errors; the Featured Reports tool opens; toggling a user's admin status
  calls the PATCH endpoint with the right payload). Note: two different
  `title="Admin"` buttons exist in the DOM for a logged-in admin
  (Sidebar's and Explore's -- see admin.spec.js's header comment); tests
  must target the one inside Explore's `z-index: 1500` overlay, not just
  "the first" or "the visible" one.
- `back-button.spec.js` — regression tests for "the back button takes me
  off the entire site": the back button closes an open panel (Admin, an
  Explore report's detail view) instead of navigating away; nested panels
  (e.g. Admin -> Featured Reports) close one at a time, innermost first;
  and closing a panel with its own close button doesn't leave a dangling
  history entry that a later back press would land on. See
  `src/lib/panelHistory.js` and `src/hooks/usePanelBackClose.js` for the
  fix and why it was needed -- none of the app's modals pushed a history
  entry when opened, so back skipped past them to whatever was in browser
  history before the site was ever opened.

## Known obsolete UI (not covered on purpose)

The Sidebar + "Saved Reports" list (frontend/src/components/Sidebar.jsx)
is slated for removal in an upcoming frontend revamp -- a plain login no
longer lands there (Explore does, see dashboard.spec.js), and it's now
only reachable via a `?report=` deep link. Don't add new test coverage
for it; when it's actually removed, delete Sidebar.jsx and anything in
App.jsx that renders it.

## Adding a test

Prefer catching real regressions over chasing coverage numbers. If you fix
a bug like the filter-sidebar one, write a test that fails on the old code
and passes on the fix (see the explore.spec.js tests) — that's the real
signal that a test is worth keeping.

If a new page/flow needs API data this suite doesn't mock yet, add it to
`fixtures.js` (copy the shape from the matching PHP handler in `api/`, not
from memory) and route it in `mockApi.js`.
