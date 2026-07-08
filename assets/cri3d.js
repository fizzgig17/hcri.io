(function () {
  "use strict";
  if (window.HCRICRI3D) return;

  var THREE_URL = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  var _q = [], _loading = false;
  function ensureThree(cb) {
    if (window.THREE) { cb(); return; }
    _q.push(cb);
    if (_loading) return;
    _loading = true;
    var s = document.createElement("script");
    s.src = THREE_URL; s.async = true;
    s.onload = function () { var q = _q; _q = []; q.forEach(function (f) { try { f(); } catch (e) {} }); };
    s.onerror = function () { _loading = false; };
    document.head.appendChild(s);
  }

  var HUE = ["red", "red-orange", "orange", "amber", "yellow", "lime", "yellow-green", "green",
             "emerald", "teal", "cyan", "azure", "blue", "violet", "purple", "magenta"];
  var REL = ["skin, tomatoes, red produce", "skin, brick, terracotta", "oranges, wood, bread", "skin highlights, honey",
             "bananas, lemons, cheese", "young leaves, limes", "foliage, vegetables", "grass, plants",
             "deep foliage, jade", "water, glass", "pool water, turquoise", "sky, signage",
             "denim, sky", "flowers, grapes", "eggplant, plums", "pink flowers, packaging"];
  var LABELS8 = [[0, "red"], [45, "orange"], [90, "yellow"], [135, "green"], [180, "cyan"], [225, "blue"], [270, "violet"], [315, "magenta"]];

  function createEngine(canvas, opts) {
    var THREE = window.THREE;
    var N = 16, C0 = 40, L0 = 72, DEG = Math.PI / 180, LSCALE = 1.2;
    var theme = opts.theme || "dark";
    var mode = opts.mode || "single";

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function angDiff(a, b) { return (((a - b) % 360) + 540) % 360 - 180; }
    function lab2rgb(L, a, b) {
      var y = (L + 16) / 116, x = a / 500 + y, z = y - b / 200;
      function f(t) { var c = t * t * t; return c > 0.008856 ? c : (t - 16 / 116) / 7.787; }
      var X = 0.95047 * f(x), Y = 1.0 * f(y), Z = 1.08883 * f(z);
      var r = X * 3.2406 - Y * 1.5372 - Z * 0.4986, g = -X * 0.9689 + Y * 1.8758 + Z * 0.0415, bl = X * 0.0557 - Y * 0.204 + Z * 1.057;
      function gm(c) { c = clamp(c, 0, 1); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
      return [gm(r), gm(g), gm(bl)];
    }
    function colOf(L, a, b) { var c = lab2rgb(L, a, b); return new THREE.Color(c[0], c[1], c[2]); }
    function P(L, a, b) { return new THREE.Vector3(a, L - 50, b); }

    var PAL = {
      dark: { bg: 0x0a0e18, g1: 0x2b3550, g2: 0x131a2b, ref: 0xcfd8ee, refO: 0.30, axis: 0x2b3550, vec: 0xffb347, amber: 0xffd24a, emi: 0.7, refEmi: 0.35, label: "#aeb9d6", ink: "#e8eefc", dim: "#8a97b5" },
      light: { bg: 0xeef1f8, g1: 0xc7d0e4, g2: 0xdde3f0, ref: 0x55617a, refO: 0.55, axis: 0xb9c2d8, vec: 0xb5651d, amber: 0xc88a16, emi: 0.25, refEmi: 0.12, label: "#5b6b86", ink: "#1a2233", dim: "#5b6b86" }
    };
    function pal() { return PAL[theme] || PAL.dark; }
    function darken(hex, k) { var c = new THREE.Color(hex); if (theme === "light") { c.r *= k; c.g *= k; c.b *= k; } return c; }

    function deriveBins(r) {
      var rcs = r.rcsBins, rhs = r.rhsBins, rls = r.rlsBins, brgb = r.binRgb, brgbR = r.binRgbRef;
      if (rcs && rcs.length === N && rhs && rhs.length === N) {
        var out = [];
        for (var q = 0; q < N; q++) {
          var th = q / N * 360 * DEG;
          var a = C0 * Math.cos(th), b = C0 * Math.sin(th);
          var rr = C0 * Math.max(0.15, 1 + (+rcs[q] || 0));
          var th2 = th + (+rhs[q] || 0) * DEG;
          var dl = rls && rls.length === N ? (+rls[q] || 0) : 0;
          out.push({ L: L0, a: a, b: b, tL: L0 + LSCALE * dl, ta: rr * Math.cos(th2), tb: rr * Math.sin(th2),
                     rcs: +rcs[q] || 0, rhs: +rhs[q] || 0, rls: dl,
                     rgb: (brgb && brgb.length === N) ? brgb[q] : null, rgbRef: (brgbR && brgbR.length === N) ? brgbR[q] : null });
        }
        return out;
      }
      var Rf = (r.Rf != null ? r.Rf : (r.rf != null ? r.rf : 90));
      var Rg = (r.Rg != null ? r.Rg : (r.rg != null ? r.rg : 100)), R9 = (r.R9 != null ? r.R9 : (r.r9 != null ? r.r9 : 50));
      var cBase = clamp(Rg / 100, 0.78, 1.06), fAmp = clamp((100 - Rf) / 100, 0, 0.5), redLoss = clamp((100 - R9) / 140, 0, 0.62);
      var bins = [];
      for (var i = 0; i < N; i++) {
        var h = i / N * 360;
        var rw = Math.exp(-Math.pow(angDiff(h, 20) / 34, 2)), cw = Math.exp(-Math.pow(angDiff(h, 200) / 45, 2));
        var cScale = cBase - redLoss * rw + 0.06 * cw * fAmp + 0.10 * fAmp * Math.sin(h * DEG * 3);
        var dHue = (8 * fAmp + 5 * redLoss) * Math.sin((h + 40) * DEG);
        var dL = -(3 * redLoss * rw) - 2 * cw * fAmp + 3 * fAmp * Math.sin(h * DEG * 2);
        var aa = C0 * Math.cos(h * DEG), bb = C0 * Math.sin(h * DEG), C = C0 * cScale, h2 = h + dHue;
        bins.push({ L: L0, a: aa, b: bb, tL: L0 + dL, ta: C * Math.cos(h2 * DEG), tb: C * Math.sin(h2 * DEG),
                    rcs: cScale - 1, rhs: dHue, rls: dL });
      }
      return bins;
    }
    function binsFor(r) { return (r.bins && r.bins.length === N) ? r.bins : deriveBins(r); }

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(48, 1, 1, 3000);
    var root = new THREE.Group(); scene.add(root);
    scene.add(new THREE.AmbientLight(0x39435e, 1.0));
    var pl1 = new THREE.PointLight(0x9fc0ff, 0.7, 0); pl1.position.set(120, 170, 140); scene.add(pl1);
    var pl2 = new THREE.PointLight(0xff9fc0, 0.5, 0); pl2.position.set(-150, 90, -110); scene.add(pl2);
    var raycaster = new THREE.Raycaster();

    var grid = null, axis = null, labels = [];
    function buildStatic() {
      if (grid) { scene.remove(grid); grid.geometry.dispose(); grid.material.dispose(); }
      if (axis) { scene.remove(axis); axis.geometry.dispose(); axis.material.dispose(); }
      grid = new THREE.GridHelper(240, 24, pal().g1, pal().g2); grid.position.y = -50; scene.add(grid);
      axis = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -50, 0), new THREE.Vector3(0, 60, 0)]), new THREE.LineBasicMaterial({ color: pal().axis, transparent: true, opacity: 0.6 }));
      scene.add(axis);
      scene.fog = new THREE.FogExp2(pal().bg, 0.0016);
      renderer.setClearColor(pal().bg, 1);
    }
    function textSprite(txt, colorHex) {
      var pr = Math.min(window.devicePixelRatio || 1, 2), pad = 8, fs = 30;
      var c = document.createElement("canvas"), g = c.getContext("2d");
      g.font = "600 " + fs + "px -apple-system,Segoe UI,Roboto,sans-serif";
      var w = g.measureText(txt).width;
      c.width = (w + pad * 2) * pr; c.height = (fs + pad * 2) * pr; g.scale(pr, pr);
      g.font = "600 " + fs + "px -apple-system,Segoe UI,Roboto,sans-serif"; g.textBaseline = "top"; g.fillStyle = colorHex;
      g.fillText(txt, pad, pad);
      var tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, opacity: 0.9 }));
      sp.scale.set((w + pad * 2) / (fs + pad * 2) * 13, 13, 1);
      return sp;
    }
    function buildLabels() {
      labels.forEach(function (s) { root.remove(s); if (s.material.map) s.material.map.dispose(); s.material.dispose(); });
      labels = [];
      LABELS8.forEach(function (d) {
        var th = d[0] * DEG, r = C0 * 1.42;
        var sp = textSprite(d[1], pal().label);
        sp.position.set(r * Math.cos(th), L0 - 50, r * Math.sin(th));
        root.add(sp); labels.push(sp);
      });
    }

    function glowTex() {
      var s = 128, c = document.createElement("canvas"); c.width = c.height = s;
      var g = c.getContext("2d"), rg = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(0.25, "rgba(255,255,255,.55)"); rg.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = rg; g.fillRect(0, 0, s, s); return new THREE.CanvasTexture(c);
    }
    var GLOW = glowTex(), sphereGeo = new THREE.SphereGeometry(4.4, 24, 24), dotGeo = new THREE.SphereGeometry(2.6, 14, 14);

    var refPts = [], refSpheres = [];
    for (var ri = 0; ri < N; ri++) { var rh = ri / N * 360; refPts.push(P(L0, C0 * Math.cos(rh * DEG), C0 * Math.sin(rh * DEG))); }
    for (var si = 0; si < N; si++) {
      var sh = si / N * 360, rc = colOf(L0, C0 * Math.cos(sh * DEG), C0 * Math.sin(sh * DEG));
      var m = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: rc, emissive: rc, emissiveIntensity: pal().refEmi, roughness: 0.5, metalness: 0, transparent: true, opacity: 0.55 }));
      m.position.copy(refPts[si]); m.scale.setScalar(0.78); root.add(m); refSpheres.push(m);
    }
    var refRing = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(refPts), new THREE.LineBasicMaterial({ color: pal().ref, transparent: true, opacity: pal().refO }));
    root.add(refRing);

    var items = [], pickList = [], worstText = "";
    function disposeItems() {
      items.forEach(function (it) {
        [it.ring, it.vec].forEach(function (o) { if (o) { root.remove(o); o.geometry.dispose(); o.material.dispose(); } });
        (it.dots || []).concat(it.test || [], it.glow || []).forEach(function (o) { if (o) { root.remove(o); if (o.material) o.material.dispose(); } });
      });
      items = []; pickList = [];
    }
    function lerpC(a, b, t) { return new THREE.Color(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t); }

    function setReports(reports) {
      disposeItems();
      var single = (mode === "single") || reports.length <= 1;
      reports.forEach(function (r) {
        var bins = binsFor(r);
        var ringColor = single ? pal().amber : darken(r.color || pal().amber, 0.62).getHex();
        var cur = [], tgt = [], curCol = [], tgtCol = [];
        for (var i = 0; i < N; i++) {
          cur.push(refPts[i].clone()); tgt.push(P(bins[i].tL, bins[i].ta, bins[i].tb));
          curCol.push(bins[i].rgbRef ? new THREE.Color(bins[i].rgbRef) : colOf(bins[i].L, bins[i].a, bins[i].b)); tgtCol.push(bins[i].rgb ? new THREE.Color(bins[i].rgb) : colOf(bins[i].tL, bins[i].ta, bins[i].tb));
        }
        var ringBuf = new THREE.BufferGeometry();
        ringBuf.setAttribute("position", new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3));
        var ring = new THREE.LineLoop(ringBuf, new THREE.LineBasicMaterial({ color: new THREE.Color(ringColor), transparent: true, opacity: single ? 0.9 : 0.85 }));
        ring.geometry.setDrawRange(0, N); root.add(ring);
        var it = { cur: cur, tgt: tgt, curCol: curCol, tgtCol: tgtCol, ring: ring, ringBuf: ringBuf, dots: [], test: [], glow: [], vec: null, vecBuf: null, bins: bins };
        if (single) {
          var vb = new THREE.BufferGeometry(); vb.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
          it.vec = new THREE.LineSegments(vb, new THREE.LineBasicMaterial({ color: pal().vec, transparent: true, opacity: 0.5 })); it.vecBuf = vb; root.add(it.vec);
          for (var j = 0; j < N; j++) {
            var tm = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({ color: curCol[j], emissive: curCol[j], emissiveIntensity: pal().emi, roughness: 0.35, metalness: 0 }));
            tm.position.copy(cur[j]); tm.userData = { q: j, b: bins[j] }; root.add(tm); it.test.push(tm); pickList.push(tm);
            var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: curCol[j], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: theme === "light" ? 0.5 : 0.9 }));
            sp.scale.setScalar(20); sp.position.copy(cur[j]); root.add(sp); it.glow.push(sp);
          }
          var idx = bins.map(function (b, q) { return { q: q, d: Math.hypot((b.ta - b.a), (b.tb - b.b), (b.tL - b.L)) }; }).sort(function (a, b) { return b.d - a.d; });
          worstText = HUE[idx[0].q] + " & " + HUE[idx[1].q];
        } else {
          for (var k = 0; k < N; k++) {
            var dm = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color: new THREE.Color(ringColor), emissive: new THREE.Color(ringColor), emissiveIntensity: 0.5, roughness: 0.4, metalness: 0 }));
            dm.position.copy(cur[k]); root.add(dm); it.dots.push(dm);
          }
        }
        items.push(it);
      });
      showHint();
    }
    function setTheme(t) {
      theme = t; buildStatic(); buildLabels();
      refRing.material.color.set(pal().ref); refRing.material.opacity = pal().refO;
      refSpheres.forEach(function (m) { m.material.emissiveIntensity = pal().refEmi; });
      if (detail) { detail.style.color = pal().dim; detail.style.background = theme === "light" ? "rgba(255,255,255,.72)" : "rgba(10,15,28,.6)"; }
      showHint();
    }
    function setMode(mm) { mode = mm; }

    var host = canvas.parentNode, detail = null;
    if (host) {
      try {
        if (getComputedStyle(host).position === "static") host.style.position = "relative";
        detail = document.createElement("div");
        detail.style.cssText = "position:absolute;left:10px;bottom:10px;max-width:78%;font:12px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;" +
          "padding:7px 10px;border-radius:9px;pointer-events:none;color:" + pal().dim + ";background:" + (theme === "light" ? "rgba(255,255,255,.72)" : "rgba(10,15,28,.6)") + ";backdrop-filter:blur(4px)";
        host.appendChild(detail);
      } catch (e) { detail = null; }
    }
    function showHint() {
      if (!detail) return;
      detail.innerHTML = (mode === "single" && worstText ? "Biggest shifts: <b style='color:" + pal().ink + "'>" + worstText + "</b> \u00b7 " : "") + "tap a point for detail";
    }
    function showDetail(b, q) {
      if (!detail) return;
      var c = Math.round(b.rcs * 100), hsh = Math.round(b.rhs), l = Math.round(b.rls * 10) / 10;
      var seg = [];
      seg.push((c >= 0 ? "+" : "") + c + "% chroma");
      seg.push((hsh >= 0 ? "+" : "") + hsh + "\u00b0 hue");
      if (Math.abs(l) >= 0.1) seg.push((l >= 0 ? "+" : "") + l + " lightness");
      detail.innerHTML = "<b style='color:" + pal().ink + "'>" + HUE[q] + "</b> \u2014 " + seg.join(" \u00b7 ") +
        "<br><span style='opacity:.85'>" + REL[q] + "</span>";
    }

    canvas.style.touchAction = "none";
    var radius = 210, thetaA = 0.7, phi = 1.06, autoRot = true, dragging = false, lx = 0, ly = 0, resumeT = 0;
    var pointers = {}, pinchDist = 0, downX = 0, downY = 0, moved = false;
    function ptrIds() { return Object.keys(pointers); }
    function ptrDist() { var k = ptrIds(); if (k.length < 2) return 0; var a = pointers[k[0]], b = pointers[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    function onDown(e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY }; autoRot = false;
      if (canvas.setPointerCapture) try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
      var k = ptrIds();
      if (k.length === 1) { dragging = true; lx = e.clientX; ly = e.clientY; downX = e.clientX; downY = e.clientY; moved = false; }
      else if (k.length === 2) { dragging = false; pinchDist = ptrDist(); }
    }
    function onMove(e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId].x = e.clientX; pointers[e.pointerId].y = e.clientY;
      var k = ptrIds();
      if (k.length >= 2) { var d = ptrDist(); if (pinchDist > 0 && d > 0) radius = clamp(radius * (pinchDist / d), 110, 540); pinchDist = d; }
      else if (dragging) {
        if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6) moved = true;
        thetaA -= (e.clientX - lx) * 0.006; phi = clamp(phi - (e.clientY - ly) * 0.006, 0.2, Math.PI - 0.2); lx = e.clientX; ly = e.clientY;
      }
    }
    function tap(cx, cy) {
      if (mode !== "single" || !pickList.length) return;
      try {
        var rect = canvas.getBoundingClientRect();
        var nd = { x: ((cx - rect.left) / rect.width) * 2 - 1, y: -((cy - rect.top) / rect.height) * 2 + 1 };
        raycaster.setFromCamera(nd, camera);
        var hit = raycaster.intersectObjects(pickList, false);
        if (hit.length && hit[0].object.userData) { var u = hit[0].object.userData; showDetail(u.b, u.q); }
        else showHint();
      } catch (e) {}
    }
    function onUp(e) {
      var wasSingle = ptrIds().length === 1;
      delete pointers[e.pointerId];
      var k = ptrIds();
      if (k.length < 2) pinchDist = 0;
      if (k.length === 1) { dragging = true; lx = pointers[k[0]].x; ly = pointers[k[0]].y; }
      if (k.length === 0) { dragging = false; resumeT = performance.now() + 4000; if (wasSingle && !moved) tap(e.clientX, e.clientY); }
    }
    function onWheel(e) { e.preventDefault(); radius = clamp(radius * (1 + (e.deltaY > 0 ? 0.08 : -0.08)), 110, 540); }
    canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp); canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    function resize() {
      var p = canvas.parentNode, w = (p && p.clientWidth) || canvas.clientWidth || 600, h = (p && p.clientHeight) || 480;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    var ro = null;
    if (window.ResizeObserver && canvas.parentNode) { ro = new ResizeObserver(resize); ro.observe(canvas.parentNode); }
    window.addEventListener("resize", resize);

    var raf = 0, alive = true;
    function frame() {
      if (!alive) return;
      if (!canvas.isConnected) { dispose(); return; }
      raf = requestAnimationFrame(frame);
      if (autoRot && !dragging) thetaA += 0.0016;
      else if (!dragging && resumeT && performance.now() > resumeT) { autoRot = true; resumeT = 0; }
      items.forEach(function (it) {
        var tmpR = new Float32Array((N + 1) * 3), tmpV = new Float32Array(N * 2 * 3);
        for (var i = 0; i < N; i++) {
          it.cur[i].lerp(it.tgt[i], 0.09); it.curCol[i] = lerpC(it.curCol[i], it.tgtCol[i], 0.09);
          if (it.test[i]) { it.test[i].position.copy(it.cur[i]); it.test[i].material.color.copy(it.curCol[i]); it.test[i].material.emissive.copy(it.curCol[i]); }
          if (it.glow[i]) { it.glow[i].position.copy(it.cur[i]); it.glow[i].material.color.copy(it.curCol[i]); it.glow[i].scale.setScalar(18 + Math.min(it.cur[i].distanceTo(refPts[i]) * 0.9, 26)); }
          if (it.dots[i]) it.dots[i].position.copy(it.cur[i]);
          tmpR[i * 3] = it.cur[i].x; tmpR[i * 3 + 1] = it.cur[i].y; tmpR[i * 3 + 2] = it.cur[i].z;
          tmpV[i * 6] = refPts[i].x; tmpV[i * 6 + 1] = refPts[i].y; tmpV[i * 6 + 2] = refPts[i].z;
          tmpV[i * 6 + 3] = it.cur[i].x; tmpV[i * 6 + 4] = it.cur[i].y; tmpV[i * 6 + 5] = it.cur[i].z;
        }
        tmpR[N * 3] = it.cur[0].x; tmpR[N * 3 + 1] = it.cur[0].y; tmpR[N * 3 + 2] = it.cur[0].z;
        it.ringBuf.attributes.position.copyArray(tmpR); it.ringBuf.attributes.position.needsUpdate = true;
        if (it.vecBuf) { it.vecBuf.attributes.position.copyArray(tmpV); it.vecBuf.attributes.position.needsUpdate = true; }
      });
      camera.position.set(radius * Math.sin(phi) * Math.sin(thetaA), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(thetaA));
      camera.lookAt(0, 4, 0); renderer.render(scene, camera);
    }
    function dispose() {
      alive = false; cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", resize); if (ro) ro.disconnect();
      if (detail && detail.parentNode) detail.parentNode.removeChild(detail);
      labels.forEach(function (s) { root.remove(s); if (s.material.map) s.material.map.dispose(); s.material.dispose(); });
      disposeItems(); sphereGeo.dispose(); dotGeo.dispose(); GLOW.dispose(); renderer.dispose();
    }

    buildStatic(); buildLabels(); setReports(opts.reports || []); resize(); frame();
    return { setReports: setReports, setTheme: setTheme, setMode: setMode, resize: resize, dispose: dispose };
  }

  function keyOf(opts) {
    return [opts.mode, opts.theme, (opts.reports || []).map(function (x) { return [x.id, x.Rf, x.Rg, x.R9, x.color, (x.rcsBins && x.rcsBins.length) || 0, (x.rlsBins && x.rlsBins.length) || 0, (x.binRgb && x.binRgb.length) || 0].join(","); }).join("|")].join("::");
  }

  window.HCRICRI3D = {
    create: function (canvas, opts) {
      var ctrl = { setReports: function () {}, setTheme: function () {}, setMode: function () {}, resize: function () {}, dispose: function () {} };
      ensureThree(function () { var real = createEngine(canvas, opts || {}); ctrl.setReports = real.setReports; ctrl.setTheme = real.setTheme; ctrl.setMode = real.setMode; ctrl.resize = real.resize; ctrl.dispose = real.dispose; });
      return ctrl;
    },
    attach: function (el, getOpts) {
      if (!el) return;
      var opts; try { opts = getOpts(); } catch (e) { return; }
      var key = keyOf(opts);
      if (el.__criKey === key) return;
      el.__criKey = key;
      if (el.__cri) { try { el.__cri.setMode && el.__cri.setMode(opts.mode); el.__cri.setReports(opts.reports); el.__cri.setTheme(opts.theme); } catch (e) {} return; }
      ensureThree(function () {
        if (el.__criKey !== key || !el.isConnected) return;
        var cv = el.__canvas;
        if (!cv) { cv = document.createElement("canvas"); cv.style.width = "100%"; cv.style.height = "100%"; cv.style.display = "block"; el.appendChild(cv); el.__canvas = cv; }
        el.__cri = createEngine(cv, opts);
      });
    }
  };
})();