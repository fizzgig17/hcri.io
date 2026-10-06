<?php



// index.php

/**

 * hCRI.io — single entry point.

 */

// ── Inject Authorization header into $_SERVER if Apache stripped it ───────────

// Apache on Windows frequently strips this header. We rescue it here

// before routing so all API files can find it in $_SERVER normally.

if (empty($_SERVER['HTTP_AUTHORIZATION'])) {

    $hdr = '';

    if (function_exists('apache_request_headers')) {

        foreach (apache_request_headers() as $k => $v) {

            if (strtolower($k) === 'authorization') { $hdr = $v; break; }

        }

    }

    if (!$hdr && function_exists('getallheaders')) {

        foreach (getallheaders() as $k => $v) {

            if (strtolower($k) === 'authorization') { $hdr = $v; break; }

        }

    }

    if ($hdr) $_SERVER['HTTP_AUTHORIZATION'] = $hdr;

}

// ── Compute base href for the SPA ─────────────────────────────────────────────

// If the server rewrites /spd/* → /* (e.g. via .htaccess at the web root),

// the visible URL base is / even though SCRIPT_NAME says /spd/index.php.

// Detect this by checking if REQUEST_URI starts with the script dir — if not,

// the rewrite is active and the base should be /.

$scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\'); // e.g. /spd

$requestUri0 = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($scriptDir && $scriptDir !== '/' && !str_starts_with($requestUri0, $scriptDir)) {

    // Rewrite active — URLs are served from root

    $base    = '/';

    $baseDir = '';

} else {

    $base    = $scriptDir ? $scriptDir . '/' : '/';

    $baseDir = $scriptDir;

}

// ── Get clean request path ────────────────────────────────────────────────────

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip base directory prefix

if ($baseDir && $baseDir !== '/' && str_starts_with($uri, $baseDir)) {

    $uri = substr($uri, strlen($baseDir));

}

$uri = '/' . ltrim($uri, '/');

// Strip index.php prefix if present (repeat to handle double /index.php/index.php)

while (str_starts_with($uri, '/index.php')) {

    $uri = substr($uri, strlen('/index.php'));

    $uri = '/' . ltrim($uri, '/');

}

if ($uri === '') $uri = '/';

// ── Security ──────────────────────────────────────────────────────────────────

if (preg_match('#^/(data|vendor|api/_core)(/|$)#', $uri)) {

    http_response_code(403);

    header('Content-Type: application/json');

    echo json_encode(['error' => 'Forbidden']);

    exit;

}

// ── Static assets ─────────────────────────────────────────────────────────────

$staticFile = __DIR__ . $uri;

if ($uri !== '/' && is_file($staticFile)) {

    $ext  = strtolower(pathinfo($staticFile, PATHINFO_EXTENSION));

    $mime = [

        'js'    => 'application/javascript',

        'css'   => 'text/css',

        'svg'   => 'image/svg+xml',

        'png'   => 'image/png',

        'ico'   => 'image/x-icon',

        'woff2' => 'font/woff2',

        'json'  => 'application/json',

        'html'  => 'text/html; charset=utf-8',

    ];

    if (isset($mime[$ext])) header('Content-Type: ' . $mime[$ext]);

    readfile($staticFile);

    exit;

}

// ── Legal pages (clean URLs) ──────────────────────────────────────────────────

if ($uri === '/privacy' || $uri === '/privacy.html' || $uri === '/terms' || $uri === '/terms.html' || $uri === '/licenses' || $uri === '/licenses.html') {

    $page = (strpos($uri, 'terms') !== false) ? 'terms.html' : ((strpos($uri, 'licenses') !== false) ? 'licenses.html' : 'privacy.html');

    header('Content-Type: text/html; charset=utf-8');

    readfile(__DIR__ . '/' . $page);

    exit;

}

// ── API routing ───────────────────────────────────────────────────────────────

if (str_starts_with($uri, '/api/')) {

    if (preg_match('#^/api/auth/(login|register|me|reset_request|reset_confirm)$#', $uri, $m)) {

        require __DIR__ . '/api/auth/' . $m[1] . '.php'; exit;

    }

    if (preg_match('#^/api/reports/(\d+)/pdf$#', $uri)) {

        require __DIR__ . '/api/reports_pdf.php'; exit;

    }

    if (preg_match('#^/api/reports/(\d+)(/recalc)?$#', $uri)) {

        require __DIR__ . '/api/reports_item.php'; exit;

    }

    if ($uri === '/api/folders/reorder') {

        require __DIR__ . '/api/folders.php'; exit;

    }

    if (preg_match('#^/api/folders/(\d+)$#', $uri)) {

        require __DIR__ . '/api/folders_item.php'; exit;

    }

    if (preg_match('#^/api/folders/?$#', $uri)) {

        require __DIR__ . '/api/folders.php'; exit;

    }

    if (preg_match('#^/api/reports/?$#', $uri)) {

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {

            require __DIR__ . '/api/reports_upload.php';

        } else {

            require __DIR__ . '/api/reports_list.php';

        }

        exit;

    }

    if ($uri === '/api/og/compare.png') {

        require __DIR__ . '/api/og_compare.php'; exit;

    }

    if (preg_match('#^/api/og/([a-zA-Z0-9_-]+)\.png$#', $uri)) {

        require __DIR__ . '/api/og_image.php'; exit;

    }

    if (preg_match('#^/api/shared/([a-zA-Z0-9_-]+)$#', $uri)) {

        require __DIR__ . '/api/shared.php'; exit;

    }

    if ($uri === '/api/admin/recalc') {

        require __DIR__ . '/api/admin_recalc.php'; exit;

    }

    if ($uri === '/api/paste_analyze') {

        require __DIR__ . '/api/paste_analyze.php'; exit;

    }

    if (str_starts_with($uri, '/api/votes')) {

        require __DIR__ . '/api/votes.php'; exit;

    }

    if (str_starts_with($uri, '/api/categories')) {

        require __DIR__ . '/api/categories.php'; exit;

    }

    if ($uri === '/api/v1/upload') {

        require __DIR__ . '/api/v1_upload.php'; exit;

    }

    if (preg_match('#^/api/v1/reports/(\d+)/share$#', $uri, $m)) {

        $_GET['id'] = $m[1];

        require __DIR__ . '/api/v1_share.php'; exit;

    }

    if ($uri === '/api/tokens' || preg_match('#^/api/tokens/\d+$#', $uri)) {

        require __DIR__ . '/api/tokens.php'; exit;

    }

    if ($uri === '/api/share_tokens' || preg_match('#^/api/share_tokens/\d+$#', $uri)) {

        require __DIR__ . '/api/share_tokens.php'; exit;

    }

    if ($uri === '/api/notices') {

        require __DIR__ . '/api/notices.php'; exit;

    }

    if ($uri === '/api/featured') {

        require __DIR__ . '/api/featured.php'; exit;

    }

    if (str_starts_with($uri, '/api/account/') || $uri === '/api/account') {

        require __DIR__ . '/api/account.php'; exit;

    }

    if ($uri === '/api/explore/stats') {

        require __DIR__ . '/api/explore_stats.php'; exit;

    }

    if ($uri === '/api/explore') {

        require __DIR__ . '/api/explore.php'; exit;

    }

    if (preg_match('#^/api/explore/(\d+)$#', $uri)) {

        require __DIR__ . '/api/explore_item.php'; exit;

    }

    if ($uri === '/api/annexe_pdf') {

        require __DIR__ . '/api/annexe_pdf.php'; exit;

    }

    if (str_starts_with($uri, '/api/admin')) {

        require __DIR__ . '/api/admin.php'; exit;

    }

    if ($uri === '/api/guest_analyze') {

        require __DIR__ . '/api/guest_analyze.php'; exit;

    }

    if ($uri === '/api/guest_pdf') {

        require __DIR__ . '/api/guest_pdf.php'; exit;

    }

    if ($uri === '/api/contact') {

        require __DIR__ . '/api/contact.php'; exit;

    }

    if ($uri === '/api/auth/profile') {

        require __DIR__ . '/api/auth/profile.php'; exit;

    }

    http_response_code(404);

    header('Content-Type: application/json');

    echo json_encode(['error' => 'Not found: ' . $uri]);

    exit;

}

// ── Filtered-set rollup report (tokenless, shareable) ─────────────

if ($uri === '/summary') {



// /summary — Shareable rollup report for an explicit set of reports (inlined).

// The URL carries ?r=id.token,id,... (Compare-style): public reports as bare ids,

// private reports as id.shareToken so the link works for anyone. The page forwards

// the list to the Explore aggregate endpoint (?summary=1&r=...), which validates

// each report's access (public OR owned OR matching share token) and aggregates.

//

// $base is provided by index.php (the SPA base href, e.g. "/" or "/spd/").

if (!isset($base)) { $base = '/'; }

$apiUrl = htmlspecialchars($base . 'index.php/api/explore', ENT_QUOTES);

$exploreUrl = htmlspecialchars($base . '?explore', ENT_QUOTES);

header('Content-Type: text/html; charset=utf-8');

?><!doctype html>

<html lang="en">

<head>

<meta charset="utf-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Filtered Set Summary — hCRI.io</title>

<meta property="og:title" content="hCRI.io — Filtered Set Summary">

<meta property="og:description" content="Aggregate metrics (CCT, CRI, R9, Duv, TM-30 Rf/Rg) for a filtered set of public spectral reports.">

<meta name="robots" content="noindex">

<script src="<?= htmlspecialchars($base) ?>assets/chart.umd.js"></script>

<style>

  :root{

    --bg:#0d1117; --surface:#161b22; --surface2:#1c2230; --border:#2d3645;

    --text:#e6edf3; --dim:#8b949e; --accent:#58a6ff; --good:#3fb978;

    --warn:#d29922; --bad:#f85149;

  }

  *{box-sizing:border-box}

  body{margin:0;background:var(--bg);color:var(--text);

    font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;line-height:1.5}

  a{color:var(--accent);text-decoration:none}

  .wrap{max-width:1180px;margin:0 auto;padding:24px 20px 64px}

  .embed header.top{display:none}

  .embed .wrap{padding-top:14px}

  header.top{display:flex;flex-wrap:wrap;align-items:center;gap:12px;justify-content:space-between;

    border-bottom:1px solid var(--border);padding-bottom:16px;margin-bottom:8px}

  .brand{font-size:20px;font-weight:900;letter-spacing:1px}

  .brand .dot{color:var(--accent)}

  h1{font-size:22px;margin:18px 0 4px}

  .sub{color:var(--dim);font-size:13px;margin-bottom:4px}

  .filters{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}

  .chip{background:var(--surface2);border:1px solid var(--border);border-radius:999px;

    padding:4px 12px;font-size:12px;color:var(--dim)}

  .chip b{color:var(--text);font-weight:600}

  .btn{height:34px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;

    background:rgba(88,166,255,.12);border:1.5px solid rgba(88,166,255,.4);color:var(--accent);

    border-radius:6px;padding:0 14px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}

  .btn.ghost{background:none;border-color:var(--border);color:var(--text)}

  .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:22px 0}

  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px}

  .card .name{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--dim);font-weight:700}

  .card .big{font-size:30px;font-weight:800;margin:6px 0 2px}

  .card .big small{font-size:14px;color:var(--dim);font-weight:600}

  .statrow{display:flex;justify-content:space-between;font-size:12px;color:var(--dim);padding:2px 0}

  .statrow b{color:var(--text);font-weight:600}

  .charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px;margin-top:8px}

  .panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px}

  .panel h2{font-size:14px;margin:0 0 12px;font-weight:700}

  .panel .h2dim{color:var(--dim);font-weight:400;font-size:12px}

  .chartbox{position:relative;height:240px}

  .empty,.loading{text-align:center;padding:80px 20px;color:var(--dim)}

  .err{color:var(--bad)}

  .foot{margin-top:36px;color:var(--dim);font-size:12px;border-top:1px solid var(--border);padding-top:14px}

</style>

</head>

<body>

<script>if(new URLSearchParams(location.search).has(`embed`))document.body.classList.add(`embed`);</script>

<div class="wrap">

  <header class="top">

    <a class="brand" href="<?= $exploreUrl ?>">hCRI<span class="dot">.io</span></a>

    <div style="display:flex;gap:8px">

      <button class="btn" id="copyBtn" title="Copy a shareable link to this report">🔗 Copy link</button>

      <a class="btn ghost" href="<?= $exploreUrl ?>">← Explore</a>

    </div>

  </header>



  <h1>Filtered Set Summary</h1>

  <div class="sub" id="subline">Aggregate metrics for the current filter selection.</div>

  <div class="filters" id="filters"></div>



  <div id="content"><div class="loading">Loading summary…</div></div>



  <div class="foot">

    Aggregated from public reports only — no private data is included, so this link is safe to share with anyone.

    <span id="genat"></span>

  </div>

</div>



<script>

const API = "<?= $apiUrl ?>";

const css = getComputedStyle(document.documentElement);

const C = {

  accent: css.getPropertyValue('--accent').trim() || '#58a6ff',

  good:   css.getPropertyValue('--good').trim()   || '#3fb978',

  warn:   css.getPropertyValue('--warn').trim()   || '#d29922',

  bad:    css.getPropertyValue('--bad').trim()    || '#f85149',

  dim:    css.getPropertyValue('--dim').trim()    || '#8b949e',

  text:   css.getPropertyValue('--text').trim()   || '#e6edf3',

  border: css.getPropertyValue('--border').trim() || '#2d3645',

};



// Copy-link

document.getElementById('copyBtn').addEventListener('click', async () => {

  try { await navigator.clipboard.writeText(location.href);

    const b=document.getElementById('copyBtn'); const t=b.textContent; b.textContent='✓ Copied';

    setTimeout(()=>b.textContent=t,1500);

  } catch(e){}

});



// The set is defined explicitly by the ?r=id.token,... list in the URL.

function renderFilters() { var h=document.getElementById('filters'); if(h) h.innerHTML=''; }

renderFilters();



const fmt = (v, d=0) => v===null||v===undefined ? '—' : Number(v).toLocaleString(undefined,{maximumFractionDigits:d});



function statCard(key, m, decimals) {

  const s = m.stats;

  return `<div class="card">

    <div class="name">${m.label}</div>

    <div class="big">${fmt(s.mean,decimals)}<small> avg</small></div>

    <div class="statrow"><span>n</span><b>${fmt(s.n)}</b></div>

    <div class="statrow"><span>min / max</span><b>${fmt(s.min,decimals)} / ${fmt(s.max,decimals)}</b></div>

    <div class="statrow"><span>median</span><b>${fmt(s.median,decimals)}</b></div>

    <div class="statrow"><span>p25 / p75</span><b>${fmt(s.p25,decimals)} / ${fmt(s.p75,decimals)}</b></div>

    <div class="statrow"><span>std dev</span><b>${fmt(s.std,decimals)}</b></div>

  </div>`;

}



function baseAxis() {

  return {

    grid:{ color: C.border }, ticks:{ color: C.dim, font:{ size:10 } },

  };

}



function histChart(canvas, m, decimals, color) {

  const bins = m.hist.bins;

  new Chart(canvas, {

    type:'bar',

    data:{ labels: bins.map(b=>fmt(b.x0,decimals)),

      datasets:[{ data: bins.map(b=>b.count), backgroundColor: color, borderRadius:3, barPercentage:1, categoryPercentage:0.96 }] },

    options:{ responsive:true, maintainAspectRatio:false,

      plugins:{ legend:{display:false}, tooltip:{ callbacks:{

        title:(it)=>{ const b=bins[it[0].dataIndex]; return `${fmt(b.x0,decimals)} – ${fmt(b.x1,decimals)}`; },

        label:(it)=>`${it.raw} report${it.raw===1?'':'s'}` } } },

      scales:{ x:{ ...baseAxis(), title:{display:true,text:m.label,color:C.dim,font:{size:11}} },

               y:{ ...baseAxis(), beginAtZero:true, title:{display:true,text:'count',color:C.dim,font:{size:11}} } } }

  });

}



function scatterChart(canvas, pts, xl, yl, color) {

  new Chart(canvas, {

    type:'scatter',

    data:{ datasets:[{ data: pts.map(p=>({x:p[0],y:p[1]})), backgroundColor: color+'cc', pointRadius:3, pointHoverRadius:5 }] },

    options:{ responsive:true, maintainAspectRatio:false,

      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(it)=>`${xl} ${it.parsed.x}, ${yl} ${it.parsed.y}` } } },

      scales:{ x:{ ...baseAxis(), title:{display:true,text:xl,color:C.dim,font:{size:11}} },

               y:{ ...baseAxis(), title:{display:true,text:yl,color:C.dim,font:{size:11}} } } }

  });

}



function tintChart(canvas, tint) {

  new Chart(canvas, {

    type:'doughnut',

    data:{ labels:['Rosy (Duv < 0)','Neutral','Green (Duv > 0)'],

      datasets:[{ data:[tint.rosy,tint.neutral,tint.green],

        backgroundColor:[C.bad, C.dim, C.good], borderColor: css.getPropertyValue('--surface').trim(), borderWidth:2 }] },

    options:{ responsive:true, maintainAspectRatio:false,

      plugins:{ legend:{ position:'bottom', labels:{ color:C.dim, font:{size:11}, boxWidth:12 } } } }

  });

}



function render(data) {

  const content = document.getElementById('content');

  document.getElementById('subline').textContent =

    `Aggregate metrics across ${data.count.toLocaleString()} report${data.count===1?'':'s'} in this set.`;

  { const h=document.getElementById('filters'); if(h&&data.count) h.innerHTML='<span class="chip"><b>'+data.count.toLocaleString()+'</b> report'+(data.count===1?'':'s')+' in this set</span>'; }

  if (data.generatedAt) {

    const d = new Date(data.generatedAt);

    document.getElementById('genat').textContent = ' · Generated ' + d.toLocaleString();

  }

  if (!data.count) {

    content.innerHTML = '<div class="empty">No reports could be loaded from this link.</div>';

    return;

  }



  const M = data.metrics;

  const dec = { cct:0, ra:1, r9:1, duv:4, Rf:1, Rg:1 };

  const cardOrder = ['cct','ra','r9','duv','Rf','Rg'];

  const colors = { cct:C.warn, ra:C.good, r9:C.accent, duv:'#a371f7', Rf:C.accent, Rg:'#2ec4b6' };



  let html = '<div class="cards">' + cardOrder.map(k=>statCard(k, M[k], dec[k])).join('') + '</div>';

  html += '<div class="charts">';

  for (const k of cardOrder) {

    html += `<div class="panel"><h2>${M[k].label} <span class="h2dim">— distribution</span></h2>

      <div class="chartbox"><canvas id="h_${k}"></canvas></div></div>`;

  }

  // tint + scatters

  html += `<div class="panel"><h2>Tint balance <span class="h2dim">— by Duv</span></h2>

      <div class="chartbox"><canvas id="tint"></canvas></div></div>`;

  html += `<div class="panel"><h2>CCT vs Duv <span class="h2dim">— chromaticity spread</span></h2>

      <div class="chartbox"><canvas id="s_cctduv"></canvas></div></div>`;

  html += `<div class="panel"><h2>Rf vs Rg <span class="h2dim">— fidelity vs gamut</span></h2>

      <div class="chartbox"><canvas id="s_rfrg"></canvas></div></div>`;

  html += '</div>';

  content.innerHTML = html;



  for (const k of cardOrder) histChart(document.getElementById('h_'+k), M[k], dec[k], colors[k]);

  tintChart(document.getElementById('tint'), data.tint);

  scatterChart(document.getElementById('s_cctduv'), data.scatter.cctDuv, 'CCT (K)', 'Duv', C.warn);

  scatterChart(document.getElementById('s_rfrg'), data.scatter.rfRg, 'Rf', 'Rg', C.accent);

}



(async () => {

  try {

    const rlist = new URLSearchParams(location.search).get('r') || '';

    let tok = ''; try { tok = localStorage.getItem('spd_token') || ''; } catch(e){}

    let url = API + '?summary=1' + (rlist ? '&r=' + encodeURIComponent(rlist) : '');

    if (tok) url += '&_token=' + encodeURIComponent(tok);

    const hdrs = { 'Accept':'application/json' };

    if (tok) hdrs['Authorization'] = 'Bearer ' + tok;

    const res = await fetch(url, { headers: hdrs });

    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();

    if (data.error) throw new Error(data.error);

    render(data);

  } catch (e) {

    document.getElementById('content').innerHTML =

      '<div class="empty err">Could not load summary.<br>' + (e && e.message ? e.message : '') + '</div>';

  }

})();

</script>

</body>

</html>

<?php

    exit;

}

// ── SPA shell ─────────────────────────────────────────────────────────────────

// Open Graph / share preview metadata

$ogScheme = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https' || (int)($_SERVER['SERVER_PORT'] ?? 0) === 443) ? 'https' : 'http';

$ogHost   = $_SERVER['HTTP_HOST'] ?? 'hcri.io';

$ogBase   = $ogScheme . '://' . $ogHost . $base;

$ogTitle  = 'hCRI.io — High-CRI LED & flashlight spectral analysis';

$ogDesc   = 'Upload, analyze and share LED spectral power distributions with CRI, TM-30 (Rf/Rg), CCT and Duv.';

$ogImage  = $ogBase . 'assets/og-default.png';

$ogUrl    = $ogBase;

$ogType   = 'website';

$shareTok = isset($_GET['share']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$_GET['share']) : '';

if ($shareTok !== '') {

    try {

        require_once __DIR__ . '/api/_core/db.php';

        require_once __DIR__ . '/api/_core/share_lookup.php';

        $rep = load_shared_report(get_db(), $shareTok);

        if ($rep) {

            $ogTitle = $rep['label'] . ' — hCRI.io';

            $sum = share_metric_summary($rep);

            if ($sum !== '') $ogDesc = $sum;

            $ogUrl  = $ogBase . '?share=' . rawurlencode($shareTok);

            $ogType = 'article';

            if (extension_loaded('gd')) $ogImage = $ogBase . 'index.php/api/og/' . rawurlencode($shareTok) . '.png';

        }

    } catch (\Throwable $e) { /* fall back to site defaults */ }

}

$reportId = isset($_GET['report']) ? (int)$_GET['report'] : 0;

if ($reportId > 0 && $shareTok === '') {

    try {

        require_once __DIR__ . '/api/_core/db.php';

        require_once __DIR__ . '/api/_core/share_lookup.php';

        $rep = load_public_report(get_db(), $reportId);

        if ($rep) {

            $ogTitle = $rep['label'] . ' — hCRI.io';

            $sum = share_metric_summary($rep);

            if ($sum !== '') $ogDesc = $sum;

            $ogUrl  = $ogBase . '?report=' . $reportId;

            $ogType = 'article';

            if (extension_loaded('gd')) $ogImage = $ogBase . 'index.php/api/og/r' . $reportId . '.png';

        }

    } catch (\Throwable $e) { /* fall back to site defaults */ }

}

$cmpRaw = isset($_GET['compare']) ? (string)$_GET['compare'] : '';

if ($cmpRaw !== '' && $shareTok === '' && $reportId === 0) {

    $cmpValid = [];

    foreach (array_filter(array_map('trim', explode(',', $cmpRaw))) as $cmpEn) {

        if (preg_match('/^\d+(?:\.[a-zA-Z0-9_-]+)?$/', $cmpEn)) $cmpValid[] = $cmpEn;

    }

    $cmpValid = array_slice($cmpValid, 0, 10);

    if (count($cmpValid) >= 2) {

        $cmpList = implode(',', $cmpValid);

        $cmpN    = count($cmpValid);

        $ogTitle = 'Spectral comparison of ' . $cmpN . ' lights — hCRI.io';

        $ogDesc  = 'Overlaid spectral power distributions (SPD) for ' . $cmpN . ' lights, with CCT, CRI, R9 and TM-30 Rf/Rg, on hCRI.io.';

        $ogUrl   = $ogBase . '?compare=' . rawurlencode($cmpList);

        $ogType  = 'article';

        if (extension_loaded('gd')) $ogImage = $ogBase . 'index.php/api/og/compare.png?c=' . rawurlencode($cmpList);

    }

}

$ogH = fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');

header('Content-Type: text/html; charset=utf-8');

?><!DOCTYPE html>

<html lang="en">

<head>

<!-- Umami Analytics (privacy-friendly, cookieless -- no consent gating needed) -->

<script defer src="https://cloud.umami.is/script.js" data-website-id="c2604a3e-d016-4010-a5b6-1fc2e009d9cb"></script>

<script>

(function(){

  window.track=function(n,p){try{window.umami&&window.umami.track(n,p||{});}catch(e){}};

  window.trackPage=function(pth,ttl){try{window.umami&&window.umami.track(function(props){return Object.assign({},props,{url:pth,title:ttl||document.title});});}catch(e){}};

})();

</script>

<meta charset="UTF-8">

<!-- viewport-fit=cover lets the page draw under the iOS/notch safe areas
     and is what makes env(safe-area-inset-*) resolve to a real value
     instead of 0 -- without it, content (and anything using those env()
     insets, like the mobile selection bar's bottom padding) can render
     flush against the true edge of the screen, visible/legible through
     Safari's and Firefox's translucent bottom toolbar as the page is
     scrolled or the toolbar collapses. -->

<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">

<meta name="theme-color" content="#060a0f">

<style>

@media (max-width: 768px) {

  html, body, #root { height: auto !important; overflow: visible !important; overflow-x: hidden !important; }

}

</style>

<title><?= $ogH($ogTitle) ?></title>

<meta name="description" content="<?= $ogH($ogDesc) ?>">

<meta property="og:type" content="<?= $ogH($ogType) ?>">

<meta property="og:site_name" content="hCRI.io">

<meta property="og:title" content="<?= $ogH($ogTitle) ?>">

<meta property="og:description" content="<?= $ogH($ogDesc) ?>">

<meta property="og:url" content="<?= $ogH($ogUrl) ?>">

<meta property="og:image" content="<?= $ogH($ogImage) ?>">

<meta property="og:image:width" content="1200">

<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">

<meta name="twitter:title" content="<?= $ogH($ogTitle) ?>">

<meta name="twitter:description" content="<?= $ogH($ogDesc) ?>">

<meta name="twitter:image" content="<?= $ogH($ogImage) ?>">

<base href="<?= htmlspecialchars($base) ?>">

<link rel="icon" type="image/x-icon"  href="<?= htmlspecialchars($base) ?>assets/favicon.ico">

<link rel="icon" type="image/png" sizes="32x32"   href="<?= htmlspecialchars($base) ?>assets/favicon-32.png">

<link rel="apple-touch-icon" sizes="192x192"       href="<?= htmlspecialchars($base) ?>assets/favicon-192.png">

<link rel="stylesheet" href="assets/app.css?v=<?php echo filemtime(__DIR__.'/assets/app.css'); ?>">

</head>

<body>

<div id="root"></div>

<script src="assets/hcri-analysis.js?v=<?php echo @filemtime(__DIR__.'/assets/hcri-analysis.js'); ?>"></script>

<script src="assets/hcri-playground.js?v=<?php echo @filemtime(__DIR__.'/assets/hcri-playground.js'); ?>"></script>

<script src="assets/hcri-photo.js?v=<?php echo @filemtime(__DIR__.'/assets/hcri-photo.js'); ?>"></script>

<script src="assets/app.js?v=<?php echo filemtime(__DIR__.'/assets/app.js'); ?>"></script>

</body>

</html>