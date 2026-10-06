// "Back to hCRI.io" / logo links: if this page was opened from the app in a new tab, return to that
// original tab and close this one; otherwise (opened directly) just navigate to the app as usual.
(function () {
  function goHome(e) {
    var o = null;
    try { o = window.opener; if (!o || o.closed || o.location.origin !== location.origin || o.location.pathname !== '/') o = null; } catch (x) { o = null; }
    if (!o) return;                       // no usable original tab → normal link navigation
    e.preventDefault();
    try { o.focus(); } catch (x) {}
    window.close();
    // window.close() can be refused; fall back to navigating after a beat
    setTimeout(function () { if (!window.closed) location.href = '/'; }, 300);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.back, header a.brand[href="/"]');
    if (a && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) goHome(e);
  });
})();
