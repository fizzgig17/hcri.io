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
- `dashboard.spec.js` — the logged-in dashboard (Sidebar + report list)
  boots, and opening a report renders its detail view, with no console
  errors.
- `explore.spec.js` — the public Explore page boots, and specifically
  regression-tests the filter-sidebar layout bug (desktop: fixed 270px
  sidebar beside the results grid; mobile: full width behind a toggle;
  collapse arrow works) that this suite was first written to catch.

## Adding a test

Prefer catching real regressions over chasing coverage numbers. If you fix
a bug like the filter-sidebar one, write a test that fails on the old code
and passes on the fix (see the explore.spec.js tests) — that's the real
signal that a test is worth keeping.

If a new page/flow needs API data this suite doesn't mock yet, add it to
`fixtures.js` (copy the shape from the matching PHP handler in `api/`, not
from memory) and route it in `mockApi.js`.
