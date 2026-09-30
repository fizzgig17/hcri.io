/* hCRI.io — playground modal opener.
   Usage: HCRIPlayground.open()  (or .open('assets/cri-3d-playground.html'))
   Opens the colour-rendering playground in a mobile-friendly modal (iframe).
   Standalone use is unaffected: the page also works opened directly. */
(function () {
  if (window.HCRIPlayground) return;
  var DEFAULT_URL = "assets/hcri-playground.html";
  var overlay = null, prevOverflow = "", keyHandler = null, msgHandler = null;

  function injectStyle() {
    if (document.getElementById("hcri-pg-style")) return;
    var st = document.createElement("style");
    st.id = "hcri-pg-style";
    st.textContent =
      "#hcri-pg-ov{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(3,6,12,.66);backdrop-filter:blur(3px);animation:hcriPgIn .16s ease-out}" +
      "@keyframes hcriPgIn{from{opacity:0}to{opacity:1}}" +
      "#hcri-pg-panel{display:flex;flex-direction:column;width:min(1100px,94vw);height:min(820px,92vh);" +
      "background:#0b1020;border:1px solid #1d2740;border-radius:14px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.5)}" +
      "#hcri-pg-bar{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;" +
      "padding:10px 14px;border-bottom:1px solid #1d2740;font:600 14px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e8eefc}" +
      "#hcri-pg-bar .sub{font-weight:400;font-size:12px;color:#8a97b5;margin-left:8px}" +
      "#hcri-pg-x{flex:none;width:32px;height:32px;border-radius:50%;border:1px solid #1d2740;background:rgba(20,28,48,.7);" +
      "color:#e8eefc;font-size:17px;line-height:1;cursor:pointer}" +
      "#hcri-pg-x:hover{border-color:#33415f}" +
      "#hcri-pg-right{display:flex;align-items:center;gap:8px}" +
      "#hcri-pg-copy{flex:none;height:32px;border-radius:8px;border:1px solid #1d2740;background:rgba(20,28,48,.7);" +
      "color:#58a6ff;font:600 12px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:0 12px;cursor:pointer;white-space:nowrap}" +
      "#hcri-pg-copy:hover{border-color:#33415f}" +
      "#hcri-pg-frame{flex:1;width:100%;border:0;display:block}" +
      "@media (max-width:820px){#hcri-pg-ov{padding:0}#hcri-pg-panel{width:100vw;height:100vh;height:100dvh;border:0;border-radius:0}" +
      "#hcri-pg-bar{padding-top:max(10px,env(safe-area-inset-top))}}";
    document.head.appendChild(st);
  }

  function close() {
    if (!overlay) return;
    if (keyHandler) document.removeEventListener("keydown", keyHandler), keyHandler = null;
    if (msgHandler) window.removeEventListener("message", msgHandler), msgHandler = null;
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    overlay = null;
    document.body.style.overflow = prevOverflow;
  }

  function copyLink(btn, text) {
    var done = function () {
      var prev = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = prev; }, 1500);
    };
    var fallback = function () {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta); done();
      } catch (e) {
        btn.textContent = "Copy failed";
        setTimeout(function () { btn.textContent = "Copy link"; }, 1500);
      }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else { fallback(); }
    } catch (e) { fallback(); }
  }

  function open(url) {
    if (overlay) return;
    injectStyle();
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    var src = url || DEFAULT_URL;
    var pageUrl = src;
    try { pageUrl = new URL(src, location.href).href; } catch (e) {}

    overlay = document.createElement("div");
    overlay.id = "hcri-pg-ov";

    var panel = document.createElement("div");
    panel.id = "hcri-pg-panel";

    var bar = document.createElement("div");
    bar.id = "hcri-pg-bar";
    bar.innerHTML = "<span>hCRI.io playground<span class='sub'>drag the sliders &middot; compare the photo</span></span>";

    var right = document.createElement("div");
    right.id = "hcri-pg-right";

    var copy = document.createElement("button");
    copy.id = "hcri-pg-copy";
    copy.textContent = "Copy link";
    copy.onclick = function () { copyLink(copy, pageUrl); };
    right.appendChild(copy);

    var x = document.createElement("button");
    x.id = "hcri-pg-x";
    x.setAttribute("aria-label", "Close");
    x.innerHTML = "&times;";
    x.onclick = close;
    right.appendChild(x);
    bar.appendChild(right);

    var frame = document.createElement("iframe");
    frame.id = "hcri-pg-frame";
    frame.setAttribute("title", "Colour rendering playground");
    frame.setAttribute("loading", "eager");
    frame.src = src;

    panel.appendChild(bar);
    panel.appendChild(frame);
    overlay.appendChild(panel);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);

    keyHandler = function (e) { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", keyHandler);
    msgHandler = function (e) { if (e && e.data && e.data.type === "hcri-pg-close") close(); };
    window.addEventListener("message", msgHandler);
  }

  window.HCRIPlayground = { open: open, close: close };
})();