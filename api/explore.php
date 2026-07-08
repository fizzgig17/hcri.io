<?php
// api/explore.php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/categories.php';
cors_headers();
if (!function_exists('build_explore_summary')) {
/**
 * Descriptive statistics for a list of numbers.
 * Returns nulls (with n=0) when there is no data.
 */
function summary_stats(array $vals): array {
    $vals = array_values(array_filter($vals, fn($v) => $v !== null && is_numeric($v)));
    $vals = array_map('floatval', $vals);
    $n = count($vals);
    if ($n === 0) {
        return ['n' => 0, 'min' => null, 'max' => null, 'mean' => null,
                'median' => null, 'std' => null, 'p25' => null, 'p75' => null];
    }
    sort($vals);
    $sum  = array_sum($vals);
    $mean = $sum / $n;
    $var  = 0.0;
    foreach ($vals as $v) $var += ($v - $mean) ** 2;
    $std  = $n > 1 ? sqrt($var / ($n - 1)) : 0.0;
    $pct = function (float $p) use ($vals, $n) {
        if ($n === 1) return $vals[0];
        $rank = $p * ($n - 1);
        $lo   = (int)floor($rank);
        $hi   = (int)ceil($rank);
        $frac = $rank - $lo;
        return $vals[$lo] + ($vals[$hi] - $vals[$lo]) * $frac;
    };
    return [
        'n'      => $n,
        'min'    => round($vals[0], 4),
        'max'    => round($vals[$n - 1], 4),
        'mean'   => round($mean, 4),
        'median' => round($pct(0.5), 4),
        'std'    => round($std, 4),
        'p25'    => round($pct(0.25), 4),
        'p75'    => round($pct(0.75), 4),
    ];
}
/**
 * Histogram of values into `bins` buckets spanning [lo, hi].
 * If lo/hi are null, they are derived from the data (with a little padding).
 * Returns ['bins' => [{x0,x1,mid,count}], 'lo' => float, 'hi' => float].
 */
function summary_hist(array $vals, ?float $lo = null, ?float $hi = null, int $bins = 20): array {
    $vals = array_values(array_filter($vals, fn($v) => $v !== null && is_numeric($v)));
    $vals = array_map('floatval', $vals);
    if (!$vals) return ['bins' => [], 'lo' => 0, 'hi' => 0];
    if ($lo === null) $lo = min($vals);
    if ($hi === null) $hi = max($vals);
    if ($hi <= $lo) { $hi = $lo + 1; }       // avoid zero-width range
    $bins = max(1, $bins);
    $w = ($hi - $lo) / $bins;
    $counts = array_fill(0, $bins, 0);
    foreach ($vals as $v) {
        if ($v < $lo || $v > $hi) continue;  // clamp to range (values can be filtered)
        $idx = (int)floor(($v - $lo) / $w);
        if ($idx >= $bins) $idx = $bins - 1;
        if ($idx < 0) $idx = 0;
        $counts[$idx]++;
    }
    $out = [];
    for ($i = 0; $i < $bins; $i++) {
        $x0 = $lo + $i * $w;
        $x1 = $x0 + $w;
        $out[] = ['x0' => round($x0, 4), 'x1' => round($x1, 4),
                  'mid' => round(($x0 + $x1) / 2, 4), 'count' => $counts[$i]];
    }
    return ['bins' => $out, 'lo' => round($lo, 4), 'hi' => round($hi, 4)];
}
/**
 * Build the full aggregate payload for the Explore rollup report from raw
 * report rows (each with cct, duv, cie_x, cie_y, rf, rg, meta).
 */
function build_explore_summary(array $rows): array {
    $cct = $duv = $rf = $rg = $ra = $r9 = [];
    $cctDuv = $rfRg = [];
    $tint = ['rosy' => 0, 'neutral' => 0, 'green' => 0];
    foreach ($rows as $r) {
        $c  = isset($r['cct'])   && $r['cct']   !== null ? (float)$r['cct']   : null;
        $dv = isset($r['duv'])   && $r['duv']   !== null ? (float)$r['duv']   : null;
        $f  = isset($r['rf'])    && $r['rf']    !== null ? (float)$r['rf']    : null;
        $g  = isset($r['rg'])    && $r['rg']    !== null ? (float)$r['rg']    : null;
        $x  = isset($r['cie_x']) && $r['cie_x'] !== null ? (float)$r['cie_x'] : null;
        $y  = isset($r['cie_y']) && $r['cie_y'] !== null ? (float)$r['cie_y'] : null;
        $meta = [];
        if (!empty($r['meta'])) { $meta = json_decode((string)$r['meta'], true) ?: []; }
        $raV = isset($meta['ra']) && is_numeric($meta['ra']) ? (float)$meta['ra'] : null;
        $r9V = isset($meta['r9']) && is_numeric($meta['r9']) ? (float)$meta['r9'] : null;
        if ($c  !== null) $cct[] = $c;
        if ($dv !== null) $duv[] = $dv;
        if ($f  !== null) $rf[]  = $f;
        if ($g  !== null) $rg[]  = $g;
        if ($raV !== null) $ra[] = $raV;
        if ($r9V !== null) $r9[] = $r9V;
        if ($c !== null && $dv !== null && count($cctDuv) < 4000) $cctDuv[] = [round($c), round($dv, 5)];
        if ($f !== null && $g !== null && count($rfRg)   < 4000) $rfRg[]   = [round($f, 1), round($g, 1)];
        if ($dv !== null) {
            if ($dv < -0.002)      $tint['rosy']++;
            elseif ($dv > 0.002)   $tint['green']++;
            else                   $tint['neutral']++;
        }
    }
    return [
        'count'       => count($rows),
        'generatedAt' => gmdate('c'),
        'metrics' => [
            'cct' => ['label' => 'CCT (K)',         'stats' => summary_stats($cct), 'hist' => summary_hist($cct, null, null, 24)],
            'ra'  => ['label' => 'CRI (Ra)',        'stats' => summary_stats($ra),  'hist' => summary_hist($ra, 0, 100, 20)],
            'r9'  => ['label' => 'R9',              'stats' => summary_stats($r9),  'hist' => summary_hist($r9, -100, 100, 20)],
            'duv' => ['label' => 'Duv',             'stats' => summary_stats($duv), 'hist' => summary_hist($duv, null, null, 24)],
            'Rf'  => ['label' => 'TM-30 Rf',        'stats' => summary_stats($rf),  'hist' => summary_hist($rf, 0, 100, 20)],
            'Rg'  => ['label' => 'TM-30 Rg',        'stats' => summary_stats($rg),  'hist' => summary_hist($rg, 60, 140, 20)],
        ],
        'tint'    => $tint,
        'scatter' => ['cctDuv' => $cctDuv, 'rfRg' => $rfRg],
    ];
}
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Toggle is_public — requires auth
    $user = require_auth();
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($body['id'] ?? 0);
    $pub  = !empty($body['public']);
    if (!$id) json_error('Missing id', 400);
    $db = get_db();
    $s = $db->prepare('SELECT id FROM reports WHERE id=? AND user_id=?');
    $s->execute([$id, $user['id']]);
    if (!$s->fetch()) json_error('Not found', 404);
    $db->prepare('UPDATE reports SET is_public=? WHERE id=?')->execute([$pub?1:0, $id]);
    json_out(['id'=>$id, 'public'=>$pub]);
}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = get_db();
    // Parse filters
    // Optional auth: logged-in users also see their own private reports
    $myId = 0;
    try {
        $hdr = get_auth_header();
        if (str_starts_with($hdr, 'Bearer ')) {
            $tok = jwt_verify(substr($hdr, 7));
            if ($tok && isset($tok['id'])) $myId = (int)$tok['id'];
        }
    } catch (\Throwable $e) {}
    $isSuper = false;
    if ($myId > 0) { try { $ssq = get_db()->prepare('SELECT is_super_admin FROM users WHERE id = ?'); $ssq->execute([$myId]); $isSuper = ((int)$ssq->fetchColumn()) === 1; } catch (\Throwable $e) {} }
    $visRanges = $isSuper ? '1=1' : ($myId > 0 ? '(is_public = 1 OR user_id = ?)' : 'is_public = 1');
    $visParams = (!$isSuper && $myId > 0) ? [$myId] : [];
    // Rollup/summary mode respects the viewer's visibility: an authenticated user's
    // summary includes their own private reports (plus public); anonymous viewers see
    // public reports only. The standard \$where visibility clause below enforces this.
    $label    = trim($_GET['q']    ?? '');
    $cctMin   = isset($_GET['cctMin'])  ? (int)$_GET['cctMin']    : 1000;
    $cctMax   = isset($_GET['cctMax'])  ? (int)$_GET['cctMax']    : 20000;
    $duvMin   = isset($_GET['duvMin'])  ? (float)$_GET['duvMin']  : -0.05;
    $duvMax   = isset($_GET['duvMax'])  ? (float)$_GET['duvMax']  : 0.05;
    $rfMin    = isset($_GET['rfMin'])   ? (int)$_GET['rfMin']     : 0;
    $rgMin    = isset($_GET['rgMin'])   ? (int)$_GET['rgMin']     : 0;
    $rgMax    = isset($_GET['rgMax'])   ? (int)$_GET['rgMax']     : 150;
    $r9Min    = isset($_GET['r9Min'])   ? (int)$_GET['r9Min']     : -100;
    $r9Max    = isset($_GET['r9Max'])   ? (int)$_GET['r9Max']     : 100;
    $raMin    = isset($_GET['raMin'])   ? (int)$_GET['raMin']     : 0;
    $raMax    = isset($_GET['raMax'])   ? (int)$_GET['raMax']     : 100;
    $uid      = (int)($_GET['userId'] ?? 0);
    $folderParam = $_GET['folderId'] ?? '';
    $lumMin   = isset($_GET['lumMin']) ? (float)$_GET['lumMin'] : 0;
    $lumMax   = isset($_GET['lumMax']) ? (float)$_GET['lumMax'] : 20000;
    $curMin   = isset($_GET['curMin']) ? (float)$_GET['curMin'] : 0;
    $curMax   = isset($_GET['curMax']) ? (float)$_GET['curMax'] : 30;
    $page     = max(1, (int)($_GET['page'] ?? 1));
    $perPage  = isset($_GET['perPage']) ? max(6, min(!empty($_GET['all']) ? 5000 : 120, (int)$_GET['perPage'])) : 24;
    $offset   = ($page - 1) * $perPage;
    $where = [$isSuper ? '1=1' : ($myId > 0 ? '(r.is_public = 1 OR r.user_id = ?)' : 'r.is_public = 1')];
    $params = (!$isSuper && $myId > 0) ? [$myId] : [];
    if ($label !== '') {
        $where[] = 'r.label LIKE ?';
        $like = '%' . $label . '%';
        $params[] = $like;
    }
    $where[] = 'r.cct BETWEEN ? AND ?';        array_push($params, $cctMin, $cctMax);
    if ($uid > 0) { $where[] = 'r.user_id = ?'; $params[] = $uid; }
    $where[] = 'r.duv BETWEEN ? AND ?';        array_push($params, $duvMin, $duvMax);
    if ($folderParam !== '') {
        if ($folderParam === 'none' || $folderParam === '0') {
            $where[] = 'r.folder_id IS NULL';
        } else {
            $where[] = 'r.folder_id = ?'; $params[] = (int)$folderParam;
        }
    }
    $where[] = '(r.rf IS NULL OR r.rf >= ?)';  $params[] = $rfMin;
    $where[] = '(r.rg IS NULL OR (r.rg >= ? AND r.rg <= ?))'; array_push($params, $rgMin, $rgMax);
    if ($r9Min > -100 || $r9Max < 100) {
        $where[] = '(JSON_EXTRACT(r.meta,\'$.r9\') IS NULL OR JSON_TYPE(JSON_EXTRACT(r.meta,\'$.r9\')) = \'NULL\' OR (CAST(JSON_EXTRACT(r.meta,\'$.r9\') AS DECIMAL(10,2)) >= ? AND CAST(JSON_EXTRACT(r.meta,\'$.r9\') AS DECIMAL(10,2)) <= ?))';
        $params[] = $r9Min;
        $params[] = $r9Max;
    }
    if ($raMin > 0 || $raMax < 100) {
        $where[] = '(JSON_EXTRACT(r.meta,\'$.ra\') IS NULL OR JSON_TYPE(JSON_EXTRACT(r.meta,\'$.ra\')) = \'NULL\' OR (CAST(JSON_EXTRACT(r.meta,\'$.ra\') AS DECIMAL(10,2)) >= ? AND CAST(JSON_EXTRACT(r.meta,\'$.ra\') AS DECIMAL(10,2)) <= ?))';
        $params[] = $raMin;
        $params[] = $raMax;
    }
    if ($lumMin > 0 || $lumMax < 20000) {
        $where[] = 'EXISTS (SELECT 1 FROM report_categories rc JOIN categories c ON c.id = rc.category_id WHERE rc.report_id = r.id AND rc.kind = ? AND CAST(c.value AS DECIMAL(12,3)) BETWEEN ? AND ?)';
        array_push($params, 'lumens', $lumMin, $lumMax);
    }
    if ($curMin > 0 || $curMax < 30) {
        $where[] = 'EXISTS (SELECT 1 FROM report_categories rc JOIN categories c ON c.id = rc.category_id WHERE rc.report_id = r.id AND rc.kind = ? AND CAST(c.value AS DECIMAL(12,3)) BETWEEN ? AND ?)';
        array_push($params, 'current', $curMin, $curMax);
    }
    $tint = array_values(array_filter(array_map('trim', explode(',', (string)($_GET['tint'] ?? ''))), fn($x) => $x !== ''));
    if ($tint) {
        $tmap = ['rosy' => 'r.duv < -0.002', 'neutral' => '(r.duv >= -0.002 AND r.duv <= 0.002)', 'green' => 'r.duv > 0.002'];
        $ors = [];
        foreach ($tint as $tt) { if (isset($tmap[$tt])) $ors[] = $tmap[$tt]; }
        if ($ors) $where[] = '(' . implode(' OR ', $ors) . ')';
    }
    // Category filters - one category id per kind
    foreach (category_kinds() as $ck) {
        if (empty($_GET[$ck])) continue;
        $ids = array_values(array_filter(array_map('intval', explode(',', (string)$_GET[$ck])), fn($x) => $x > 0));
        if ($ids) {
            $ph = implode(',', array_fill(0, count($ids), '?'));
            $where[]  = "EXISTS (SELECT 1 FROM report_categories rc WHERE rc.report_id = r.id AND rc.category_id IN ($ph))";
            foreach ($ids as $id) $params[] = $id;
        }
    }
    // R9 is in meta JSON — filter post-query or add virtual column
    // For now include r9 filter as optional (skip if default)
    $whereStr = implode(' AND ', $where);
    if (isset($_GET['summary'])) {
        // build=1: return the shareable id.token list for the current filter set.
        // Public reports -> bare id; the viewer's own private reports -> id.shareToken
        // (reusing an existing token, minting one only if absent). Respects $where visibility.
        if (isset($_GET['build'])) {
            $bs = $db->prepare("SELECT id, is_public, user_id, share_token FROM reports r WHERE $whereStr");
            $bs->execute($params);
            $parts = [];
            foreach ($bs->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $rid = (int)$row['id'];
                if ((int)$row['is_public'] === 1) { $parts[] = (string)$rid; continue; }
                if ($myId > 0 && (int)$row['user_id'] === $myId) {
                    $tok = (string)($row['share_token'] ?? '');
                    if ($tok === '') {
                        do { $tok = bin2hex(random_bytes(8)); $chk = $db->prepare('SELECT id FROM reports WHERE share_token = ?'); $chk->execute([$tok]); } while ($chk->fetch());
                        $db->prepare('UPDATE reports SET share_token=? WHERE id=?')->execute([$tok, $rid]);
                    }
                    $parts[] = $rid . '.' . $tok;
                } else {
                    $parts[] = (string)$rid; // visible to a super-admin but not owned: no token minted
                }
            }
            json_out(['list' => implode(',', $parts), 'count' => count($parts)]);
        }
        // Compare-style explicit set: ?r=id.token,id,id.token,...  Each report is
        // included only if accessible to this viewer: public, owned, super-admin,
        // or the supplied per-report share token matches. (No filter params used.)
        if (isset($_GET['r']) && $_GET['r'] !== '') {
            $tokById = [];
            foreach (explode(',', (string)$_GET['r']) as $part) {
                $part = trim($part);
                if ($part === '') continue;
                $dot = strpos($part, '.');
                if ($dot === false) { $rid = (int)$part; $tk = ''; }
                else { $rid = (int)substr($part, 0, $dot); $tk = substr($part, $dot + 1); }
                if ($rid > 0) $tokById[$rid] = $tk;
            }
            if (!$tokById) json_out(build_explore_summary([]));
            $ids = array_keys($tokById);
            $in  = implode(',', array_fill(0, count($ids), '?'));
            $q = $db->prepare("SELECT id, cct, duv, cie_x, cie_y, rf, rg, meta, is_public, user_id, share_token FROM reports WHERE id IN ($in)");
            $q->execute($ids);
            $rows = [];
            foreach ($q->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $rid = (int)$row['id'];
                $tk  = (string)($tokById[$rid] ?? '');
                $ok  = ((int)$row['is_public'] === 1)
                    || $isSuper
                    || ($myId > 0 && (int)$row['user_id'] === $myId)
                    || (!empty($row['share_token']) && hash_equals((string)$row['share_token'], $tk));
                if ($ok) $rows[] = $row;
            }
            json_out(build_explore_summary($rows));
        }
        $sumStmt = $db->prepare("SELECT r.cct, r.duv, r.cie_x, r.cie_y, r.rf, r.rg, r.meta FROM reports r WHERE $whereStr");
        $sumStmt->execute($params);
        json_out(build_explore_summary($sumStmt->fetchAll(PDO::FETCH_ASSOC)));
    }
    $countSql = "SELECT COUNT(*) FROM reports r WHERE $whereStr";
    $cs = $db->prepare($countSql); $cs->execute($params);
    $total = (int)$cs->fetchColumn();
    $sortMap = ['date' => 'r.created_at', 'title' => 'LOWER(r.label)'];
    $sortCol = $sortMap[strtolower((string)($_GET['sort'] ?? 'date'))] ?? 'r.created_at';
    $sortDir = strtolower((string)($_GET['order'] ?? 'desc')) === 'asc' ? 'ASC' : 'DESC';
    $orderBy = "$sortCol $sortDir, r.id DESC";
    $sql = "SELECT r.id, r.label,
                   r.cct, r.duv, r.rf, r.rg, r.cie_x, r.cie_y,
                   r.created_at, r.meta, r.user_id, r.is_public, r.folder_id,
                   u.name as user_name
            FROM reports r
            LEFT JOIN users u ON u.id = r.user_id
            WHERE $whereStr
            ORDER BY $orderBy
            LIMIT $perPage OFFSET $offset";
    $s = $db->prepare($sql);
    $s->execute($params);
    $rows = $s->fetchAll();
    $maskedLabel = [];
    try {
        $mids = array_map(fn($x) => (int)$x['id'], $db->query('SELECT DISTINCT u.id FROM users u JOIN reports r ON r.user_id = u.id WHERE u.name_masked = 1 AND r.is_public = 1 ORDER BY u.id')->fetchAll());
        if (count($mids) === 1) $maskedLabel[$mids[0]] = 'hidden';
        else foreach ($mids as $i => $mid) $maskedLabel[$mid] = 'hidden ' . ($i + 1);
    } catch (\Throwable $e) {}
    $reports = array_map(function($r) use ($r9Min, $maskedLabel) {
        $meta = json_decode($r['meta'] ?: '{}', true) ?? [];
        $r9   = isset($meta['r9']) ? (float)$meta['r9'] : null;
        $ra   = isset($meta['ra']) ? (float)$meta['ra'] : null;
        return [
            'id'           => (int)$r['id'],
            'label'        => $r['label'],
            'cct'          => $r['cct'] ? (int)$r['cct'] : null,
            'duv'          => $r['duv'] !== null ? (float)$r['duv'] : null,
            'Rf'           => $r['rf']  !== null ? (int)$r['rf']   : null,
            'Rg'           => $r['rg']  !== null ? (int)$r['rg']   : null,
            'ra'           => $ra,
            'r9'           => $r9,
            'x'            => $r['cie_x'] !== null ? (float)$r['cie_x'] : null,
            'y'            => $r['cie_y'] !== null ? (float)$r['cie_y'] : null,
            'userId'       => (int)$r['user_id'],
            'userName'     => $maskedLabel[(int)$r['user_id']] ?? $r['user_name'],
            'private'      => ((int)($r['is_public'] ?? 1)) === 0,
            'folderId'     => $r['folder_id'] !== null ? (int)$r['folder_id'] : null,
            'createdAt'    => $r['created_at'],
        ];
    }, $rows);
    // r9 is filtered in the SQL WHERE clause above, so it now drives COUNT + pagination; no post-query trim.
        // Attach thumbs up/down counts (graceful if the votes table doesn't exist yet).
    try {
        $vids = array_map(fn($r) => $r['id'], $reports);
        if ($vids) {
            $vph = implode(',', array_fill(0, count($vids), '?'));
            $vq  = $db->prepare("SELECT report_id, SUM(value=1) AS up, SUM(value=-1) AS down FROM report_votes WHERE report_id IN ($vph) GROUP BY report_id");
            $vq->execute($vids);
            $vmap = [];
            foreach ($vq->fetchAll() as $vr) $vmap[(int)$vr['report_id']] = ['up' => (int)$vr['up'], 'down' => (int)$vr['down']];
            foreach ($reports as &$rep) { $rep['up'] = $vmap[$rep['id']]['up'] ?? 0; $rep['down'] = $vmap[$rep['id']]['down'] ?? 0; }
            unset($rep);
        }
    } catch (\Throwable $e) {
        foreach ($reports as &$rep) { $rep['up'] = $rep['up'] ?? 0; $rep['down'] = $rep['down'] ?? 0; }
        unset($rep);
    }
    // Category options used by public reports, for the filter dropdowns
    $categoryOptions = array_fill_keys(category_kinds(), []);
    try {
        if ($uid > 0) {
            $catVis = $isSuper ? 'r.user_id = ?' : ($myId > 0 ? '(r.is_public = 1 OR r.user_id = ?) AND r.user_id = ?' : '(r.is_public = 1 AND r.user_id = ?)');
            $catParams = $isSuper ? [$uid] : ($myId > 0 ? [$myId, $uid] : [$uid]);
            if ($folderParam !== '') {
                if ($folderParam === 'none' || $folderParam === '0') {
                    $catVis .= ' AND r.folder_id IS NULL';
                } else {
                    $catVis .= ' AND r.folder_id = ?'; $catParams[] = (int)$folderParam;
                }
            }
            $cs2 = $db->prepare('SELECT DISTINCT c.id, c.kind, c.value FROM categories c JOIN report_categories rc ON rc.category_id = c.id JOIN reports r ON r.id = rc.report_id WHERE '.$catVis.' ORDER BY c.kind, c.value');
            $cs2->execute($catParams);
        } else {
            $cs2 = $db->query('SELECT DISTINCT c.id, c.kind, c.value FROM categories c JOIN report_categories rc ON rc.category_id = c.id JOIN reports r ON r.id = rc.report_id WHERE r.is_public = 1 ORDER BY c.kind, c.value');
        }
        foreach ($cs2->fetchAll() as $cr) {
            if (array_key_exists($cr['kind'], $categoryOptions)) $categoryOptions[$cr['kind']][] = ['id' => (int)$cr['id'], 'value' => $cr['value']];
        }
    } catch (\Throwable $e) { /* tables may not exist yet */ }
    // Users that own at least one public report, for the user filter dropdown.
    $userOptions = [];
    try {
        $uq = $db->query("SELECT u.id, u.name, u.name_masked, COUNT(r.id) AS n FROM users u JOIN reports r ON r.user_id = u.id WHERE r.is_public = 1 GROUP BY u.id, u.name, u.name_masked HAVING n > 0 ORDER BY u.name");
        foreach ($uq->fetchAll() as $ur) $userOptions[] = ['id' => (int)$ur['id'], 'name' => ($maskedLabel[(int)$ur['id']] ?? $ur['name'])];
    } catch (\Throwable $e) {
        try {
            $uq = $db->query("SELECT u.id, u.name, COUNT(r.id) AS n FROM users u JOIN reports r ON r.user_id = u.id WHERE r.is_public = 1 GROUP BY u.id, u.name HAVING n > 0 ORDER BY u.name");
            foreach ($uq->fetchAll() as $ur) $userOptions[] = ['id' => (int)$ur['id'], 'name' => $ur['name']];
        } catch (\Throwable $e2) {}
    }
    usort($userOptions, fn($a, $b) => strcasecmp((string)$a['name'], (string)$b['name']));
    $visRangesU = $visRanges; $visParamsU = $visParams; if ($uid > 0) { $visRangesU .= ' AND user_id = ?'; $visParamsU[] = $uid; }
    if ($folderParam !== '') {
        if ($folderParam === 'none' || $folderParam === '0') {
            $visRangesU .= ' AND folder_id IS NULL';
        } else {
            $visRangesU .= ' AND folder_id = ?'; $visParamsU[] = (int)$folderParam;
        }
    }
    // Filter slider ranges across all public reports (unfiltered), for data-aware defaults
    $ranges = ['cct'=>[1000,10000],'duv'=>[-0.02,0.02],'rf'=>[0,100],'rg'=>[80,130],'r9'=>[0,100],'ra'=>[0,100]];
    try {
        $rs = $db->prepare("SELECT MIN(cct) miCct, MAX(cct) maCct, MIN(duv) miDuv, MAX(duv) maDuv, MIN(rf) miRf, MAX(rf) maRf, MIN(rg) miRg, MAX(rg) maRg FROM reports WHERE $visRangesU"); $rs->execute($visParamsU); $rr = $rs->fetch();
        if ($rr) {
            // A full extra unit of padding on both ends guards against float-precision
            // and rounding edge cases (e.g. a value sitting exactly on a computed
            // boundary) silently excluding a report from its own computed range.
            if ($rr['maCct'] !== null) $ranges['cct'] = [(int)(floor(((float)$rr['miCct'] - 100) / 100) * 100), (int)(ceil(((float)$rr['maCct'] + 100) / 100) * 100)];
            if ($rr['maDuv'] !== null) { $st = 0.0005; $ranges['duv'] = [floor((float)$rr['miDuv']/$st)*$st - $st, ceil((float)$rr['maDuv']/$st)*$st + $st]; }
            if ($rr['maRf']  !== null) $ranges['rf'] = [(int)floor((float)$rr['miRf']) - 1, (int)ceil((float)$rr['maRf']) + 1];
            if ($rr['maRg']  !== null) $ranges['rg'] = [(int)floor((float)$rr['miRg']) - 1, (int)ceil((float)$rr['maRg']) + 1];
        }
        $r9vals = []; $ravals = [];
        $ms = $db->prepare("SELECT meta FROM reports WHERE $visRangesU"); $ms->execute($visParamsU); foreach ($ms->fetchAll() as $mr) {
            $mm = json_decode($mr['meta'] ?: '{}', true);
            if (isset($mm['r9']) && is_numeric($mm['r9'])) $r9vals[] = (float)$mm['r9'];
            if (isset($mm['ra']) && is_numeric($mm['ra'])) $ravals[] = (float)$mm['ra'];
        }
        if ($r9vals) $ranges['r9'] = [(int)floor(min($r9vals)) - 1, (int)ceil(max($r9vals)) + 1];
        if ($ravals) $ranges['ra'] = [(int)floor(min($ravals)) - 1, (int)ceil(max($ravals)) + 1];
        // Guard against a degenerate single-value range (min == max)
        foreach ($ranges as $k => &$rv) {
            if ($rv[0] == $rv[1]) { $pad = ($k === 'duv') ? 0.0005 : 1; $rv[0] -= $pad; $rv[1] += $pad; }
        }
        unset($rv);
    } catch (\Throwable $e) {}
    json_out([
        'categoryOptions' => $categoryOptions,
        'userOptions' => $userOptions,
        'ranges' => $ranges, 'reports' => $reports,
        'total'   => $total,
        'page'    => $page,
        'pages'   => max(1, (int)ceil($total / $perPage)),
    ]);
}