// tests/helpers.js
//
// Shared helpers for the smoke/regression suite.

/**
 * Attaches console/page-error collectors to a page and returns a function
 * that asserts none fired. Call `expectNoErrors()` at the end of a test
 * rather than checking after every action, so one failure doesn't need
 * every test to remember to wire this up by hand.
 */
export function captureConsoleErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}
