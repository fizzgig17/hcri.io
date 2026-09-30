(function () {
  "use strict";
  if (window.HCRIAnalysis) return;

  var HUE = ["reds", "red-oranges", "oranges", "ambers", "yellows", "limes", "yellow-greens", "greens",
             "emeralds", "teals", "cyans", "azures", "blues", "violets", "purples", "magentas"];

  function num(v) { return (v === null || v === undefined || v === "" || isNaN(+v)) ? null : +v; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function clip(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "\u2026" : s; }
  function colorFor(l) { return l === "good" ? "#3fb978" : l === "warn" ? "#d29922" : l === "bad" ? "#f85149" : "#8a96a3"; }
  function dot(l) { return '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + colorFor(l) + ';margin-right:8px;vertical-align:1px;flex:none"></span>'; }

  function cctDesc(c) {
    if (c == null) return "white of unknown colour temperature";
    var w = c < 2200 ? "very warm, amber" : c < 2700 ? "very warm" : c < 3200 ? "warm" : c < 4000 ? "warm-neutral"
      : c < 5000 ? "neutral" : c < 5700 ? "neutral-cool" : c < 6500 ? "cool, daylight-like" : "very cool, blue-white";
    return w + " " + Math.round(c) + " K";
  }
  function duvDesc(d) {
    if (d == null) return { t: "tint unknown", l: "neutral" };
    var a = Math.abs(d), side = d < 0 ? "rosy / magenta" : "green / yellow";
    if (a < 0.0010) return { t: "essentially neutral white (on the blackbody locus)", l: "good" };
    if (a < 0.0030) return { t: "slightly " + side, l: "good" };
    if (a < 0.0060) return { t: "noticeably " + side, l: "warn" };
    return { t: "strongly " + side + " (outside the usual ANSI white range)", l: "bad" };
  }
  function fidDesc(v) {
    if (v == null) return { t: "unavailable", l: "neutral" };
    if (v >= 95) return { t: "exceptional", l: "good" };
    if (v >= 90) return { t: "excellent", l: "good" };
    if (v >= 80) return { t: "good", l: "good" };
    if (v >= 70) return { t: "moderate", l: "warn" };
    return { t: "poor", l: "bad" };
  }
  function r9Desc(v) {
    if (v == null) return { t: "unavailable", l: "neutral" };
    if (v >= 90) return { t: "outstanding deep reds", l: "good" };
    if (v >= 70) return { t: "strong deep reds", l: "good" };
    if (v >= 50) return { t: "adequate deep reds", l: "warn" };
    if (v >= 0) return { t: "weak deep reds \u2014 reds look muted", l: "warn" };
    return { t: "poor \u2014 deep reds look washed out / brownish", l: "bad" };
  }
  function rgDesc(v) {
    if (v == null) return { t: "unavailable", l: "neutral" };
    if (v >= 99 && v <= 101) return { t: "neutral saturation \u2014 colours look natural", l: "good" };
    if (v > 101 && v <= 105) return { t: "slightly enhanced saturation", l: "good" };
    if (v > 105 && v <= 115) return { t: "enhanced saturation \u2014 colours look vivid", l: "warn" };
    if (v > 115) return { t: "strongly oversaturated \u2014 vivid but exaggerated", l: "bad" };
    if (v >= 95 && v < 99) return { t: "slightly muted saturation", l: "good" };
    if (v >= 85 && v < 95) return { t: "muted saturation", l: "warn" };
    return { t: "washed-out, undersaturated colours", l: "bad" };
  }
  function perHue(rcs, rhs) {
    if (!rcs || rcs.length < 16) return null;
    var minI = 0, maxI = 0, i;
    for (i = 0; i < 16; i++) { if (rcs[i] < rcs[minI]) minI = i; if (rcs[i] > rcs[maxI]) maxI = i; }
    var hueI = -1, hm = 0;
    if (rhs && rhs.length >= 16) for (i = 0; i < 16; i++) { if (Math.abs(rhs[i]) > hm) { hm = Math.abs(rhs[i]); hueI = i; } }
    var parts = [];
    if (rcs[minI] < -0.05) parts.push("most muted in " + HUE[minI] + " (" + Math.round(rcs[minI] * 100) + "%)");
    if (rcs[maxI] > 0.05) parts.push((parts.length ? "boosted in " : "most boosted in ") + HUE[maxI] + " (+" + Math.round(rcs[maxI] * 100) + "%)");
    if (hm > 3 && hueI >= 0) parts.push("largest hue twist in " + HUE[hueI] + " (~" + Math.round(hm) + "\u00b0)");
    if (!parts.length) return { t: "per-hue shifts are small across the colour wheel", l: "good" };
    return { t: parts.join("; "), l: rcs[minI] < -0.15 ? "warn" : "neutral" };
  }

  function bestFor(m) {
    var rf = m.Rf != null ? m.Rf : m.ra, uses = [];
    if (rf != null && rf >= 90 && (m.r9 == null || m.r9 >= 40)) uses.push("colour-critical work \u2014 retail, skin tones, food, art and photography");
    if (m.Rg != null && m.Rg > 108) uses.push("display and merchandising where vivid colour should pop (slightly exaggerated)");
    if (rf != null && rf < 75) uses.push("general or utility lighting where exact colour is secondary");
    if (m.cct != null && m.cct < 3200) uses.push("warm, relaxed residential and hospitality settings");
    else if (m.cct != null && m.cct >= 5000) uses.push("crisp task, retail or daylight-matching environments");
    if (!uses.length) uses.push("everyday general-purpose lighting");
    return uses.slice(0, 2).join("; ") + ".";
  }

  function row(label, lvl, text) {
    return '<div style="display:flex;align-items:flex-start;margin:5px 0">' + dot(lvl) +
      '<div><b style="font-weight:600">' + esc(label) + ':</b> ' + esc(text) + '</div></div>';
  }

  function analyzeReport(r, theme) {
    r = r || {};
    var cct = num(r.cct), duv = num(r.duv), ra = num(r.ra), rf = num(r.Rf != null ? r.Rf : r.rf),
        rg = num(r.Rg != null ? r.Rg : r.rg), r9 = num(r.R9 != null ? r.R9 : r.r9);
    var dim = theme === "light" ? "#5b6b86" : "#8a97b5";
    var t = duvDesc(duv), fa = fidDesc(ra != null ? ra : rf), rgD = rgDesc(rg), r9D = r9Desc(r9), ph = perHue(r.rcsBins, r.rhsBins);

    var lead = "A " + cctDesc(cct).replace(/ \d+ K$/, function (s) { return s; }) + " source";
    var metricBits = [];
    if (ra != null) metricBits.push("Ra " + Math.round(ra));
    if (rf != null) metricBits.push("Rf " + Math.round(rf));
    lead += " with " + fa.t + " colour rendering" + (metricBits.length ? " (" + metricBits.join(", ") + ")" : "") + ".";
    if (r9 != null) lead += r9 < 20 ? " Its deep reds are a weak spot." : (r9 >= 70 ? " It also renders deep reds well." : "");
    if (rg != null && rg > 108) lead += " Colours appear more saturated than reference.";
    else if (rg != null && rg < 92) lead += " Colours appear somewhat muted.";

    var h = '<div style="font-size:13px;line-height:1.6;color:inherit">';
    h += '<p style="margin:0 0 10px">' + esc(lead) + '</p>';
    h += row("Whiteness", "neutral", cctDesc(cct));
    h += row("Tint", t.l, t.t);
    if (ra != null || rf != null) h += row("Fidelity", fa.l, fa.t + (metricBits.length ? " (" + metricBits.join(", ") + ")" : ""));
    if (rg != null) h += row("Saturation", rgD.l, rgD.t + " (Rg " + Math.round(rg) + ")");
    if (r9 != null) h += row("Deep reds", r9D.l, r9D.t + " (R9 " + Math.round(r9) + ")");
    if (ph) h += row("Per-hue", ph.l, ph.t);
    h += '<p style="margin:10px 0 0;color:' + dim + '"><b style="font-weight:600;color:inherit">Best for:</b> ' + esc(bestFor({ Rf: rf, ra: ra, Rg: rg, r9: r9, cct: cct })) + '</p>';
    h += '<p style="margin:8px 0 0;font-size:11px;color:' + dim + '">Generated from this report\u2019s measured metrics.</p>';
    h += '</div>';
    return h;
  }

  function pick(reps, keyFn, dir) {
    var best = null, bv = null;
    reps.forEach(function (r) { var v = keyFn(r); if (v == null) return; if (bv == null || (dir > 0 ? v > bv : v < bv)) { bv = v; best = r; } });
    return best ? { r: best, v: bv } : null;
  }
  function analyzeCompare(reps, theme) {
    reps = (reps || []).filter(function (r) { return r; });
    var dim = theme === "light" ? "#5b6b86" : "#8a97b5";
    if (reps.length < 2) return '<div style="font-size:13px;color:' + dim + '">Select at least two lights to compare.</div>';
    var L = function (r) { return clip(r.label || ("#" + r.id), 28); };
    var rfOf = function (r) { return num(r.Rf != null ? r.Rf : r.rf); };
    var acc = pick(reps, rfOf, 1), viv = pick(reps, function (r) { return num(r.Rg != null ? r.Rg : r.rg); }, 1);
    var red = pick(reps, function (r) { return num(r.R9 != null ? r.R9 : r.r9); }, 1);
    var warm = pick(reps, function (r) { return num(r.cct); }, -1), cool = pick(reps, function (r) { return num(r.cct); }, 1);

    var h = '<div style="font-size:13px;line-height:1.6;color:inherit">';
    h += '<p style="margin:0 0 10px">Comparing ' + reps.length + ' lights.</p>';
    if (acc) h += row("Most accurate", "good", L(acc.r) + " (Rf " + Math.round(acc.v) + ")");
    if (viv) h += row("Most vivid", "neutral", L(viv.r) + " (Rg " + Math.round(viv.v) + ")");
    if (red) h += row("Best deep reds", red.v >= 50 ? "good" : "warn", L(red.r) + " (R9 " + Math.round(red.v) + ")");
    if (warm && cool && warm.r !== cool.r) h += row("Colour temperature", "neutral", "warmest " + L(warm.r) + " (" + Math.round(warm.v) + " K), coolest " + L(cool.r) + " (" + Math.round(cool.v) + " K)");
    if (acc && viv && acc.r !== viv.r) h += '<p style="margin:10px 0 0;color:' + dim + '">Trade-off: ' + esc(L(acc.r)) + ' renders colour most faithfully, while ' + esc(L(viv.r)) + ' makes colours look most vivid.</p>';
    h += '<p style="margin:8px 0 0;font-size:11px;color:' + dim + '">Generated from each report\u2019s measured metrics.</p>';
    h += '</div>';
    return h;
  }

  function keyOf(d) {
    var arr = d.mode === "compare" ? (d.reports || []) : [d.report || {}];
    return d.mode + "|" + d.theme + "|" + arr.map(function (r) { return [r && r.id, r && r.cct, r && r.duv, r && r.ra, r && r.r9, r && (r.Rf != null ? r.Rf : r.rf), r && (r.Rg != null ? r.Rg : r.rg), r && r.rcsBins && r.rcsBins.length].join(","); }).join("|");
  }
  window.HCRIAnalysis = {
    report: analyzeReport,
    compare: analyzeCompare,
    attach: function (el, getData) {
      if (!el) return;
      var d; try { d = getData(); } catch (e) { return; }
      var k = keyOf(d);
      if (el.__anaKey === k) return;
      el.__anaKey = k;
      try { el.innerHTML = d.mode === "compare" ? analyzeCompare(d.reports, d.theme) : analyzeReport(d.report, d.theme); }
      catch (e) { el.innerHTML = ""; }
    }
  };
})();