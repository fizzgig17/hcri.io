/* hCRI.io — report colour-rendering module.
   window.HCRIPhoto.attach(el, getData) builds, inside el:
     - a before/after photo comparison driven by the report's measured per-hue
       shifts (rcsBins / rhsBins / rlsBins).
   Photos are processed entirely in the browser and never uploaded. */
(function () {
  if (window.HCRIPhoto) return;
  var DEG = Math.PI / 180;
  var DEFAULT_PHOTO_1 = '/assets/default-photo-1.jpg';
  var DEFAULT_PHOTO_2 = '/assets/default-photo-2.jpg';
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lab2rgb(L, a, b) { var y = (L + 16) / 116, x = a / 500 + y, z = y - b / 200;
    function f(t) { var c = t * t * t; return c > 0.008856 ? c : (t - 16 / 116) / 7.787; }
    var X = 0.95047 * f(x), Y = f(y), Z = 1.08883 * f(z);
    var r = X * 3.2406 - Y * 1.5372 - Z * 0.4986, g = -X * 0.9689 + Y * 1.8758 + Z * 0.0415, bl = X * 0.0557 - Y * 0.204 + Z * 1.057;
    function gm(c) { c = clamp(c, 0, 1); return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
    return [gm(r), gm(g), gm(bl)]; }
  function rgb2lab(r, g, b) { var inv = function (c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    r = inv(r); g = inv(g); b = inv(b);
    var X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, Y = (r * 0.2126 + g * 0.7152 + b * 0.0722), Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    var f = function (t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }; X = f(X); Y = f(Y); Z = f(Z);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)]; }
  function se(e) { return [
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos(e * DEG)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((e - 120) * DEG)))),
    Math.max(30, Math.min(240, Math.round(128 + 127 * Math.cos((e - 240) * DEG)))) ]; }

  function planckXY(T){ var x;
    if(T<4000) x=-0.2661239e9/(T*T*T)-0.2343589e6/(T*T)+0.8776956e3/T+0.179910;
    else x=-3.0258469e9/(T*T*T)+2.1070379e6/(T*T)+0.2226347e3/T+0.240390;
    var y;
    if(T<2222) y=-1.1063814*x*x*x-1.34811020*x*x+2.18555832*x-0.20219683;
    else if(T<4000) y=-0.9549476*x*x*x-1.37418593*x*x+2.09137015*x-0.16748867;
    else y=3.0817580*x*x*x-5.87338670*x*x+3.75112997*x-0.37001483;
    return [x,y]; }
  function whiteLin(cct,duv){ var xy=planckXY(cct);
    function toUV(x,y){var d=(-2*x+12*y+3);return[4*x/d,6*y/d];}
    var uv=toUV(xy[0],xy[1]), xy2=planckXY(cct+(cct<4000?10:50)), uv2=toUV(xy2[0],xy2[1]);
    var du=uv2[0]-uv[0],dv=uv2[1]-uv[1],len=Math.hypot(du,dv)||1e-9,nu=-dv/len,nv=du/len; if(nv<0){nu=-nu;nv=-nv;}
    var u3=uv[0]+duv*nu,v3=uv[1]+duv*nv,d2=(2*u3-8*v3+4),x=3*u3/d2,y=2*v3/d2,X=x/y,Z=(1-x-y)/y;
    return [X*3.2406-1.5372-Z*0.4986,-X*0.9689+1.8758+Z*0.0415,X*0.0557-0.204+Z*1.057]; }
  function cctDuvToCast(cct,duv){ if(cct==null) return null; cct=+cct; duv=+duv||0;
    var w=whiteLin(cct,duv), r0=whiteLin(6500,0); var r=w[0]/r0[0],g=w[1]/r0[1],b=w[2]/r0[2];
    var L=0.2126*r+0.7152*g+0.0722*b||1; return [r/L,g/L,b/L]; }
  function labToDisplay(L,a,b,cast){ var y=(L+16)/116,x=a/500+y,z=y-b/200;
    function f(t){var c=t*t*t;return c>0.008856?c:(t-16/116)/7.787;}
    var X=0.95047*f(x),Y=f(y),Z=1.08883*f(z);
    var r=X*3.2406-Y*1.5372-Z*0.4986,g=-X*0.9689+Y*1.8758+Z*0.0415,bl=X*0.0557-Y*0.204+Z*1.057;
    if(cast){r*=cast[0];g*=cast[1];bl*=cast[2];}
    function gm(c){c=clamp(c,0,1);return c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055;}
    return [gm(r),gm(g),gm(bl)]; }

  // per-hue shift from measured 16-bin arrays (interpolated by hue)
  function shiftFromBins(rcs, rhs, rls) {
    var N = 16, ok = rcs && rcs.length === N;
    return function (h) {
      if (!ok) return [1, 0, 0];
      h = ((h % 360) + 360) % 360;
      var x = (h - 11.25) / 22.5, b0 = Math.floor(x), f = x - b0;
      var i0 = ((b0 % N) + N) % N, i1 = (i0 + 1) % N;
      function L(arr) { return (arr && arr.length === N) ? (+arr[i0] || 0) * (1 - f) + (+arr[i1] || 0) * f : 0; }
      return [1 + L(rcs), L(rhs), L(rls)];
    };
  }

  function keyOf(o) {
    return [(o.rfBins || []).join(','), (o.rcsBins || []).join(','), (o.rhsBins || []).join(','), o.Rf, o.Rg, o.cct, o.duv].join('|');
  }

  function build(el, o) {
    var th = o.theme || {}, dim = th.dim || '#8a97b5', text = th.text || '#e8eefc', border = th.border || '#1d2740', accent = th.accent || '#58a6ff';
    var CAST = cctDuvToCast(o.cct, o.duv), castOn = !!CAST;
    el.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start';

    // ---- photo comparison ----
    var pcol = document.createElement('div'); pcol.style.cssText = 'flex:1;min-width:240px';
    var pwrap = document.createElement('div');
    pwrap.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;touch-action:none;border:1px solid ' + border;
    var cRef = document.createElement('canvas'), cRend = document.createElement('canvas');
    cRef.style.cssText = 'display:block;width:100%;position:relative';
    cRend.style.cssText = 'display:block;width:100%;position:absolute;top:0;left:0;height:100%';
    var divider = document.createElement('div');
    divider.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.35);transform:translateX(-1px)';
    var grip = document.createElement('div');
    grip.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#05070d;font-size:14px';
    grip.innerHTML = '&#8646;'; divider.appendChild(grip);
    function lab(side, txt) { var d = document.createElement('div');
      d.style.cssText = 'position:absolute;top:6px;' + side + ':6px;font-size:10.5px;font-weight:600;color:#fff;background:rgba(0,0,0,.5);padding:2px 7px;border-radius:6px;pointer-events:none'; d.textContent = txt; return d; }
    pwrap.appendChild(cRef); pwrap.appendChild(cRend); pwrap.appendChild(divider);
    pwrap.appendChild(lab('left', 'Reference')); pwrap.appendChild(lab('right', 'Under this light'));
    var tools = document.createElement('div'); tools.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px';
    function mkBtn(t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'font:inherit;font-size:12px;color:' + text + ';background:none;border:1px solid ' + border + ';border-radius:8px;padding:6px 11px;cursor:pointer'; return b; }
    var bUpload = mkBtn('Use your own photo');
    var srcSeg = document.createElement('div'); srcSeg.style.cssText = 'display:inline-flex;border:1px solid ' + border + ';border-radius:8px;overflow:hidden';
    function srcBtn(t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'font:inherit;font-size:12px;border:0;padding:6px 12px;cursor:pointer'; return b; }
    var bChart = srcBtn('Colour chart'), bPhoto1 = srcBtn('Photo 1'), bPhoto2 = srcBtn('Photo 2'), srcMode = 'chart';
    function paintBtn(b, on) { b.style.background = on ? accent : 'transparent'; b.style.color = on ? '#05070d' : dim; b.style.fontWeight = on ? '700' : '400'; }
    function paintSrc() { paintBtn(bChart, srcMode === 'chart'); paintBtn(bPhoto1, srcMode === 'photo1'); paintBtn(bPhoto2, srcMode === 'photo2'); }
    bChart.onclick = function () { srcMode = 'chart'; paintSrc(); useSample(); };
    bPhoto1.onclick = function () { srcMode = 'photo1'; paintSrc(); loadDefaultPhoto(DEFAULT_PHOTO_1); };
    bPhoto2.onclick = function () { srcMode = 'photo2'; paintSrc(); loadDefaultPhoto(DEFAULT_PHOTO_2); };
    srcSeg.appendChild(bChart); srcSeg.appendChild(bPhoto1); srcSeg.appendChild(bPhoto2); paintSrc();
    var note = document.createElement('span'); note.style.cssText = 'font-size:10.5px;color:' + dim; note.textContent = 'photos are only used in the browser and are never uploaded to any server';
    var file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    tools.appendChild(srcSeg); tools.appendChild(bUpload); tools.appendChild(note); tools.appendChild(file);
    pcol.appendChild(pwrap);
    pcol.appendChild(tools);
    wrap.appendChild(pcol);
    el.appendChild(wrap);

    // photo engine
    var PMAX = 520, divPos = 50, origData = null;
    var origCv = document.createElement('canvas'), octx = origCv.getContext('2d', { willReadFrequently: true });
    var rctx = cRef.getContext('2d'), dctx = cRend.getContext('2d');
    var shiftFor = shiftFromBins(o.rcsBins, o.rhsBins, o.rlsBins);
    function setSizes(w, h) {[origCv, cRef, cRend].forEach(function (c) { c.width = w; c.height = h; }); }
    function layout() { divider.style.left = divPos + '%'; cRend.style.clipPath = 'inset(0 0 0 ' + divPos + '%)'; cRend.style.webkitClipPath = 'inset(0 0 0 ' + divPos + '%)'; }
    function fit() {
      if (!origData) return;
      var avail = pcol.clientWidth || pwrap.clientWidth || 480;
      var aspect = origData.width / origData.height, maxH = 440;
      var wpx = Math.min(avail, maxH * aspect);
      if (wpx > 10) pwrap.style.width = Math.round(wpx) + 'px';
      layout();
    }
    function render() {
      if (!origData) return; var src = origData.data, w = origData.width, h = origData.height;
      var out = dctx.createImageData(w, h), oo = out.data;
      for (var i = 0; i < src.length; i += 4) {
        if (src[i + 3] === 0) { oo[i + 3] = 0; continue; }
        var L = rgb2lab(src[i] / 255, src[i + 1] / 255, src[i + 2] / 255), C = Math.hypot(L[1], L[2]), hue = Math.atan2(L[2], L[1]) / DEG;
        var s = shiftFor(hue), C2 = Math.max(0, C * s[0]), h2 = (hue + s[1]) * DEG, L2 = clamp(L[0] + s[2], 0, 100);
        var rgb = labToDisplay(L2, C2 * Math.cos(h2), C2 * Math.sin(h2), castOn ? CAST : null);
        oo[i] = clamp(rgb[0] * 255, 0, 255); oo[i + 1] = clamp(rgb[1] * 255, 0, 255); oo[i + 2] = clamp(rgb[2] * 255, 0, 255); oo[i + 3] = src[i + 3];
      }
      dctx.putImageData(out, 0, 0);
    }
    function useSource(drawFn, w, h) {
      var sc = Math.min(1, PMAX / Math.max(w, h)), dw = Math.max(1, Math.round(w * sc)), dh = Math.max(1, Math.round(h * sc));
      setSizes(dw, dh); octx.clearRect(0, 0, dw, dh); drawFn(octx, dw, dh);
      origData = octx.getImageData(0, 0, dw, dh); rctx.putImageData(origData, 0, 0); render(); fit();
    }
    function drawChartImg(ctx, w, h) {
      var P = [[232,188,168],[205,150,120],[120,82,62],[196,46,38],[150,28,30],[228,124,34],
               [240,200,40],[210,178,70],[96,150,60],[58,110,72],[40,150,140],[120,185,225],
               [44,92,158],[36,62,140],[110,72,168],[140,72,150],[206,80,150],[222,140,150],
               [150,98,58],[238,238,236],[186,186,186],[124,124,124],[72,72,72],[34,34,34]];
      var cols = 6, rows = 4, pad = Math.round(w * 0.025), gap = Math.round(w * 0.014);
      var cw = (w - pad * 2 - gap * (cols - 1)) / cols, ch = (h - pad * 2 - gap * (rows - 1)) / rows;
      ctx.fillStyle = '#0c0f17'; ctx.fillRect(0, 0, w, h);
      for (var idx = 0; idx < P.length; idx++) { var r = Math.floor(idx / cols), c = idx % cols, p = P[idx];
        var x = pad + c * (cw + gap), y = pad + r * (ch + gap); ctx.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 6); ctx.fill(); } else ctx.fillRect(x, y, cw, ch); }
    }
    function useSample() { useSource(drawChartImg, 480, 320); }
    function loadDefaultPhoto(url) { var img = new Image();
      img.onload = function () { useSource(function (ctx, w, h) { ctx.drawImage(img, 0, 0, w, h); }, img.naturalWidth || img.width, img.naturalHeight || img.height); };
      img.onerror = function () { srcMode = 'chart'; paintSrc(); useSample(); }; img.src = url; }
    var drag = false;
    function setDiv(cx) { var r = pwrap.getBoundingClientRect(); divPos = clamp((cx - r.left) / r.width * 100, 3, 97); layout(); }
    pwrap.addEventListener('pointerdown', function (e) { drag = true; try { pwrap.setPointerCapture(e.pointerId); } catch (x) {} setDiv(e.clientX); });
    pwrap.addEventListener('pointermove', function (e) { if (drag) setDiv(e.clientX); });
    pwrap.addEventListener('pointerup', function () { drag = false; });
    pwrap.addEventListener('pointercancel', function () { drag = false; });
    bUpload.onclick = function () { file.click(); };
    file.addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (!f) return;
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () { useSource(function (ctx, w, h) { ctx.drawImage(img, 0, 0, w, h); }, img.naturalWidth || img.width, img.naturalHeight || img.height); URL.revokeObjectURL(url); srcMode = 'custom'; paintSrc(); };
      img.onerror = function () { URL.revokeObjectURL(url); }; img.src = url; });

    var rzT; window.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(fit, 120); });
    useSample();
    requestAnimationFrame(fit);
  }

  function attach(el, getData) {
    if (!el) return;
    var o; try { o = getData() || {}; } catch (e) { o = {}; }
    var k = keyOf(o);
    if (el.__hcriKey === k && el.firstChild) return;
    el.__hcriKey = k;
    build(el, o);
  }

  window.HCRIPhoto = { attach: attach, attachCompare: attachCompare };

  // ===== comparison page: one card per report (details + chart + photo) =====
  function drawSwatches(ctx, w, h) {
    var P = [[232,188,168],[205,150,120],[120,82,62],[196,46,38],[150,28,30],[228,124,34],
             [240,200,40],[210,178,70],[96,150,60],[58,110,72],[40,150,140],[120,185,225],
             [44,92,158],[36,62,140],[110,72,168],[140,72,150],[206,80,150],[222,140,150],
             [150,98,58],[238,238,236],[186,186,186],[124,124,124],[72,72,72],[34,34,34]];
    var cols = 6, rows = 4, pad = Math.round(w * 0.025), gap = Math.round(w * 0.014);
    var cw = (w - pad * 2 - gap * (cols - 1)) / cols, ch = (h - pad * 2 - gap * (rows - 1)) / rows;
    ctx.fillStyle = '#0c0f17'; ctx.fillRect(0, 0, w, h);
    for (var idx = 0; idx < P.length; idx++) { var r = Math.floor(idx / cols), c = idx % cols, p = P[idx];
      var x = pad + c * (cw + gap), y = pad + r * (ch + gap); ctx.fillStyle = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, cw, ch, 6); ctx.fill(); } else ctx.fillRect(x, y, cw, ch); }
  }

  function drawRefChart(cv, o, theme) {
    var cctx = cv.getContext('2d'), W = cv.width, a = W / 1.28, d = W / 2, p = W / 2, m = a * 0.36, hh = a * 0.05;
    var text = (theme && theme.text) || '#e8eefc', dim = (theme && theme.dim) || '#8a97b5';
    function rcol(v) { return v >= 85 ? '#3fb978' : v >= 70 ? '#d29922' : '#f85149'; }
    var rf = o.rfBins && o.rfBins.length === 16 ? o.rfBins : null;
    cctx.clearRect(0, 0, W, W);
    for (var e = 0; e < 16; e++) { var t = (90 - e * 22.5) * DEG, nn = (90 - (e + 1) * 22.5) * DEG, col = se(e * 22.5 + 11.25);
      cctx.beginPath(); cctx.moveTo(d, p); cctx.arc(d, p, m + a * 0.055, nn, t); cctx.closePath();
      cctx.fillStyle = 'rgb(' + Math.round(160 + (col[0] - 160) * 0.4) + ',' + Math.round(160 + (col[1] - 160) * 0.4) + ',' + Math.round(160 + (col[2] - 160) * 0.4) + ')'; cctx.fill(); }
    cctx.beginPath(); cctx.arc(d, p, m, 0, 2 * Math.PI); cctx.fillStyle = 'rgb(240,244,250)'; cctx.fill();
    [0.25, 0.5, 0.75, 1].forEach(function (g) { cctx.beginPath(); cctx.arc(d, p, m * g, 0, 2 * Math.PI);
      cctx.strokeStyle = g === 1 ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.12)'; cctx.lineWidth = g === 1 ? 1.2 : 0.5; cctx.stroke(); });
    cctx.strokeStyle = 'rgba(0,0,0,0.1)'; cctx.lineWidth = 0.4;
    for (var e2 = 0; e2 < 16; e2++) { var tt = (90 - e2 * 22.5) * DEG; cctx.beginPath();
      cctx.moveTo(d + hh * Math.cos(tt), p - hh * Math.sin(tt)); cctx.lineTo(d + m * Math.cos(tt), p - m * Math.sin(tt)); cctx.stroke(); }
    var pts = [];
    for (var b = 0; b < 16; b++) { var v = rf ? +rf[b] : (o.Rf || 75); var __u=(o&&o.cvgTest&&o.cvgTest.length===16)?o.cvgTest[b]:null, __rc=(o&&o.rcsBins&&o.rcsBins.length===16)?(1+(+o.rcsBins[b]||0)):null, __rh=(o&&o.rhsBins&&o.rhsBins.length===16)?(+o.rhsBins[b]||0):0; var rad = Math.max(0.05, Math.min(1.45, __u?Math.hypot(__u[0],__u[1]):(__rc!==null?__rc:1))), ang = __u?Math.atan2(__u[1],__u[0]):(90 - b * 22.5 - __rh) * DEG;
      pts.push([d + m * rad * Math.cos(ang), p - m * rad * Math.sin(ang)]); }
    cctx.beginPath(); pts.forEach(function (pt, i) { i ? cctx.lineTo(pt[0], pt[1]) : cctx.moveTo(pt[0], pt[1]); }); cctx.closePath();
    cctx.fillStyle = 'rgba(200,30,30,0.12)'; cctx.fill(); cctx.strokeStyle = 'rgba(190,25,25,0.9)'; cctx.lineWidth = 1.6; cctx.stroke();
    cctx.fillStyle = 'rgba(170,15,15,0.9)'; pts.forEach(function (pt) { cctx.beginPath(); cctx.arc(pt[0], pt[1], 2.4, 0, 2 * Math.PI); cctx.fill(); });
    cctx.beginPath(); cctx.arc(d, p, m, 0, 2 * Math.PI); cctx.strokeStyle = 'rgba(0,0,0,0.65)'; cctx.lineWidth = 1.3; cctx.stroke();
    cctx.font = 'bold ' + Math.round(a * 0.044) + 'px monospace'; cctx.fillStyle = text; cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
    for (var e3 = 0; e3 < 16; e3++) { var t3 = (90 - e3 * 22.5) * DEG, rn = m + a * 0.115; cctx.fillText(e3 + 1, d + rn * Math.cos(t3), p - rn * Math.sin(t3)); }
    cctx.textBaseline = 'alphabetic'; cctx.font = 'bold ' + Math.round(a * 0.11) + 'px monospace';
    if (o.Rf != null) { cctx.fillStyle = rcol(o.Rf); cctx.textAlign = 'left'; cctx.fillText(Math.round(o.Rf), 4, Math.round(a * 0.13) + 2); }
    if (o.Rg != null) { cctx.fillStyle = rcol(o.Rg); cctx.textAlign = 'right'; cctx.fillText(Math.round(o.Rg), W - 4, Math.round(a * 0.13) + 2); }
    cctx.font = Math.round(a * 0.04) + 'px sans-serif'; cctx.fillStyle = dim;
    cctx.textAlign = 'left'; cctx.fillText('Rf', 5, Math.round(a * 0.2)); cctx.textAlign = 'right'; cctx.fillText('Rg', W - 5, Math.round(a * 0.2));
  }

  function attachCompare(el, getData) {
    if (!el) return;
    var d; try { d = getData() || {}; } catch (e) { d = {}; }
    var reports = d.reports || [];
    var key = (d.themeName || '') + '#' + reports.map(function (o) { return keyOf(o) + ':' + (o.label || ''); }).join('||');
    if (el.__hcriCmpKey === key && el.firstChild) return;
    el.__hcriCmpKey = key;
    buildCompare(el, d.theme || {}, reports, d.colors || []);
  }

  function buildCompare(el, theme, reports, colors) {
    var dim = theme.dim || '#8a97b5', text = theme.text || '#e8eefc', border = theme.border || '#1d2740',
        accent = theme.accent || '#58a6ff', surface = theme.surface || theme.surface2 || 'rgba(10,15,28,.6)',
        good = theme.good || '#3fb978', warn = theme.warn || '#d29922', bad = theme.bad || '#f85149';
    el.innerHTML = '';
    var root = document.createElement('div');
    var intro = document.createElement('p');
    intro.style.cssText = 'font-size:12.5px;line-height:1.6;color:' + dim + ';margin:0 0 12px';
    intro.textContent = 'See how each light renders the same photo. The left of each image is the true (reference) colour; the right is how that light renders it \u2014 drag each divider to compare. Each image includes this light\u2019s colour cast, as photographed. Photos are processed only in your browser and are never uploaded.';
    root.appendChild(intro);

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 14px';
    function mkBtn(t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'font:inherit;font-size:12px;color:' + text + ';background:none;border:1px solid ' + border + ';border-radius:8px;padding:7px 12px;cursor:pointer'; return b; }
    var bUpload = mkBtn('Upload a photo (applies to all)');
    var srcSeg = document.createElement('div'); srcSeg.style.cssText = 'display:inline-flex;border:1px solid ' + border + ';border-radius:8px;overflow:hidden';
    function srcBtn(t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t;
      b.style.cssText = 'font:inherit;font-size:12px;border:0;padding:7px 12px;cursor:pointer'; return b; }
    var bChart = srcBtn('Colour chart'), bPhoto1 = srcBtn('Photo 1'), bPhoto2 = srcBtn('Photo 2'), srcMode = 'chart';
    function paintBtn(b, on) { b.style.background = on ? accent : 'transparent'; b.style.color = on ? '#05070d' : dim; b.style.fontWeight = on ? '700' : '400'; }
    function paintSrc() { paintBtn(bChart, srcMode === 'chart'); paintBtn(bPhoto1, srcMode === 'photo1'); paintBtn(bPhoto2, srcMode === 'photo2'); }
    var note = document.createElement('span'); note.style.cssText = 'font-size:10.5px;color:' + dim;
    note.textContent = 'photos are only used in the browser and are never uploaded to any server';
    var file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    bar.appendChild(srcSeg); bar.appendChild(bUpload); bar.appendChild(note); bar.appendChild(file);
    root.appendChild(bar);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start';
    root.appendChild(grid);
    el.appendChild(root);

    var dragSrc = null;
    var cards = reports.map(function (o, ix) { return makeCard(o, ix); });

    var shared = { data: null, w: 0, h: 0 };
    function setShared(drawFn, w, h) {
      var PMAX = 480, sc = Math.min(1, PMAX / Math.max(w, h)), dw = Math.max(1, Math.round(w * sc)), dh = Math.max(1, Math.round(h * sc));
      var cv = document.createElement('canvas'); cv.width = dw; cv.height = dh;
      var cx = cv.getContext('2d', { willReadFrequently: true }); cx.clearRect(0, 0, dw, dh); drawFn(cx, dw, dh);
      shared.data = cx.getImageData(0, 0, dw, dh); shared.w = dw; shared.h = dh;
      cards.forEach(function (c) { c.apply(shared); });
    }
    function loadDefaultPhotoShared(url) { var img = new Image();
      img.onload = function () { setShared(function (cx, w, h) { cx.drawImage(img, 0, 0, w, h); }, img.naturalWidth || img.width, img.naturalHeight || img.height); };
      img.onerror = function () { srcMode = 'chart'; paintSrc(); setShared(drawSwatches, 480, 320); }; img.src = url; }
    bChart.onclick = function () { srcMode = 'chart'; paintSrc(); setShared(drawSwatches, 480, 320); };
    bPhoto1.onclick = function () { srcMode = 'photo1'; paintSrc(); loadDefaultPhotoShared(DEFAULT_PHOTO_1); };
    bPhoto2.onclick = function () { srcMode = 'photo2'; paintSrc(); loadDefaultPhotoShared(DEFAULT_PHOTO_2); };
    srcSeg.appendChild(bChart); srcSeg.appendChild(bPhoto1); srcSeg.appendChild(bPhoto2); paintSrc();
    bUpload.onclick = function () { file.click(); };
    file.addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (!f) return;
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () { setShared(function (cx, w, h) { cx.drawImage(img, 0, 0, w, h); }, img.naturalWidth || img.width, img.naturalHeight || img.height); URL.revokeObjectURL(url); srcMode = 'custom'; paintSrc(); };
      img.onerror = function () { URL.revokeObjectURL(url); }; img.src = url; });

    var rzT, onRz = function () {
      if (!el.isConnected) { window.removeEventListener('resize', onRz); return; }
      clearTimeout(rzT); rzT = setTimeout(function () { cards.forEach(function (c) { c.fit(); }); }, 120);
    };
    window.addEventListener('resize', onRz);
    setShared(drawSwatches, 480, 320);
    requestAnimationFrame(function () { cards.forEach(function (c) { c.fit(); }); });

    function makeCard(o, ix) {
      var col = colors[ix] || accent;
      var card = document.createElement('div');
      card.style.cssText = 'background:' + surface + ';border:1px solid ' + border + ';border-radius:12px;padding:12px';
      var head = document.createElement('div'); head.style.cssText = 'display:flex;align-items:center;gap:8px;margin:0 0 8px';
      var grip2 = document.createElement('span'); grip2.textContent = '\u283F'; grip2.title = 'Drag to reorder';
      grip2.style.cssText = 'cursor:grab;color:' + dim + ';font-size:14px;line-height:1;flex:none;user-select:none';
      grip2.draggable = true;
      grip2.addEventListener('dragstart', function (e) { dragSrc = card; card.style.opacity = '.5';
        try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'm'); if (e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(card, 20, 20); } catch (x) {} });
      grip2.addEventListener('dragend', function () { card.style.opacity = '1'; dragSrc = null; });
      card.addEventListener('dragover', function (e) { if (dragSrc && dragSrc !== card) e.preventDefault(); });
      card.addEventListener('drop', function (e) { e.preventDefault(); if (!dragSrc || dragSrc === card) return;
        var rect = card.getBoundingClientRect(); var after = (e.clientX - rect.left) > rect.width / 2;
        grid.insertBefore(dragSrc, after ? card.nextSibling : card); });
      var dot = document.createElement('span'); dot.style.cssText = 'width:10px;height:10px;border-radius:50%;flex:none;background:' + col;
      var title = document.createElement('div'); title.style.cssText = 'font-size:13px;font-weight:700;color:' + text + ';font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      title.textContent = o.label || 'Untitled';
      head.appendChild(grip2); head.appendChild(dot); head.appendChild(title); card.appendChild(head);

      var det = document.createElement('div'); det.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px 12px;margin:0 0 10px;font-family:monospace;font-size:11px';
      function rRa(v) { return v == null ? text : v >= 90 ? good : v >= 80 ? warn : bad; }
      function rR9(v) { return v == null ? text : v >= 80 ? good : v >= 50 ? warn : bad; }
      function rRf(v) { return v == null ? text : v >= 90 ? good : v >= 80 ? warn : bad; }
      function rRg(v) { return v == null ? text : (v >= 95 && v <= 105) ? good : (v >= 90 && v <= 110) ? warn : bad; }
      var fmt = function (v) { return v == null ? '\u2014' : String(Math.round(v)); };
      function metric(label, val, c) { var s = document.createElement('span');
        s.innerHTML = '<span style="color:' + dim + '">' + label + '</span> <b style="color:' + (c || text) + '">' + val + '</b>'; return s; }
      det.appendChild(metric('CCT', o.cct == null ? '\u2014' : o.cct + 'K', accent));
      det.appendChild(metric('Duv', o.duv == null ? '\u2014' : ((o.duv >= 0 ? '+' : '') + (+o.duv).toFixed(4)), text));
      det.appendChild(metric('Ra', fmt(o.ra), rRa(o.ra)));
      det.appendChild(metric('R9', fmt(o.r9), rR9(o.r9)));
      det.appendChild(metric('Rf', fmt(o.Rf), rRf(o.Rf)));
      det.appendChild(metric('Rg', fmt(o.Rg), rRg(o.Rg)));
      card.appendChild(det);

      var body = document.createElement('div'); body.style.cssText = 'display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap';
      var SHOW_CHART = false, chart = null; // reference chart hidden for now (toggle to re-enable)
      if (SHOW_CHART) { chart = document.createElement('canvas'); chart.width = 300; chart.height = 300; chart.style.cssText = 'width:118px;height:118px;flex:none'; drawRefChart(chart, o, theme); }

      var pcol = document.createElement('div'); pcol.style.cssText = 'flex:1;min-width:190px';
      var pwrap = document.createElement('div'); pwrap.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;touch-action:none;border:1px solid ' + border;
      var cRef = document.createElement('canvas'), cRend = document.createElement('canvas');
      cRef.style.cssText = 'display:block;width:100%;position:relative';
      cRend.style.cssText = 'display:block;width:100%;position:absolute;top:0;left:0;height:100%';
      var divider = document.createElement('div'); divider.style.cssText = 'position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.35);transform:translateX(-1px)';
      var grip = document.createElement('div'); grip.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 2px 8px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#05070d;font-size:13px';
      grip.innerHTML = '&#8646;'; divider.appendChild(grip);
      function lab(side, txt) { var dd = document.createElement('div');
        dd.style.cssText = 'position:absolute;top:6px;' + side + ':6px;font-size:10px;font-weight:600;color:#fff;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:6px;pointer-events:none'; dd.textContent = txt; return dd; }
      pwrap.appendChild(cRef); pwrap.appendChild(cRend); pwrap.appendChild(divider);
      pwrap.appendChild(lab('left', 'Reference')); pwrap.appendChild(lab('right', 'Under this light'));
      pcol.appendChild(pwrap);

      var CAST = cctDuvToCast(o.cct, o.duv), castOn = !!CAST;
      if (chart) body.appendChild(chart); body.appendChild(pcol); card.appendChild(body);
      grid.appendChild(card);

      var rctx = cRef.getContext('2d'), dctx = cRend.getContext('2d');
      var shift = shiftFromBins(o.rcsBins, o.rhsBins, o.rlsBins);
      var divPos = 50, srcData = null;
      function layout() { divider.style.left = divPos + '%'; cRend.style.clipPath = 'inset(0 0 0 ' + divPos + '%)'; cRend.style.webkitClipPath = 'inset(0 0 0 ' + divPos + '%)'; }
      function fit() { if (!srcData) return; var avail = pcol.clientWidth || 220, aspect = srcData.width / srcData.height, maxH = 320;
        var wpx = Math.min(avail, maxH * aspect); if (wpx > 10) pwrap.style.width = Math.round(wpx) + 'px'; layout(); }
      function render() { if (!srcData) return; var src = srcData.data, w = srcData.width, h = srcData.height;
        var out = dctx.createImageData(w, h), oo = out.data, cast = castOn ? CAST : null;
        for (var i = 0; i < src.length; i += 4) {
          if (src[i + 3] === 0) { oo[i + 3] = 0; continue; }
          var L = rgb2lab(src[i] / 255, src[i + 1] / 255, src[i + 2] / 255), C = Math.hypot(L[1], L[2]), hue = Math.atan2(L[2], L[1]) / DEG;
          var s = shift(hue), C2 = Math.max(0, C * s[0]), h2 = (hue + s[1]) * DEG, L2 = clamp(L[0] + s[2], 0, 100);
          var rgb = labToDisplay(L2, C2 * Math.cos(h2), C2 * Math.sin(h2), cast);
          oo[i] = clamp(rgb[0] * 255, 0, 255); oo[i + 1] = clamp(rgb[1] * 255, 0, 255); oo[i + 2] = clamp(rgb[2] * 255, 0, 255); oo[i + 3] = src[i + 3];
        }
        dctx.putImageData(out, 0, 0);
      }
      function apply(sh) { if (!sh.data) return; srcData = sh.data; cRef.width = sh.w; cRef.height = sh.h; cRend.width = sh.w; cRend.height = sh.h; rctx.putImageData(srcData, 0, 0); render(); fit(); }
      var drag = false;
      function setDiv(cx) { var r = pwrap.getBoundingClientRect(); divPos = clamp((cx - r.left) / r.width * 100, 3, 97); layout(); }
      pwrap.addEventListener('pointerdown', function (e) { drag = true; try { pwrap.setPointerCapture(e.pointerId); } catch (x) {} setDiv(e.clientX); });
      pwrap.addEventListener('pointermove', function (e) { if (drag) setDiv(e.clientX); });
      pwrap.addEventListener('pointerup', function () { drag = false; });
      pwrap.addEventListener('pointercancel', function () { drag = false; });
      return { apply: apply, fit: fit };
    }
  }
})();