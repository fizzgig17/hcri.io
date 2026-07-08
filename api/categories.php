<?php
// api/categories.php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';
require_once __DIR__ . '/_core/categories.php';

cors_headers();
header('Cache-Control: no-store, no-cache, must-revalidate');

$user = require_auth();
$user['id'] = (int)$user['id'];
$db   = get_db();
$m    = $_SERVER['REQUEST_METHOD'];
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^.*?/api/categories#', '', $uri);   // '' | '/assign'

// ── GET /api/categories — all values grouped by kind (for the dropdowns) ──────
if ($m === 'GET' && ($path === '' || $path === '/')) {
    json_out(all_categories($db, false));
}

// ── POST /api/categories — create (or fetch) a value within a kind ────────────
if ($m === 'POST' && ($path === '' || $path === '/')) {
    if (empty($user['is_admin'])) {
        $chk = $db->prepare('SELECT is_admin FROM users WHERE id = ?'); $chk->execute([$user['id']]);
        $r = $chk->fetch();
        if (!$r || (int)$r['is_admin'] !== 1) json_error('Adding new values is restricted to admins. Please use the contact link to request one.', 403);
    }
    $b     = body();
    $kind  = $b['kind']  ?? '';
    $value = trim((string)($b['value'] ?? ''));
    if (!is_category_kind($kind)) json_error('Invalid category kind', 400);
    if ($value === '')            json_error("'value' required", 400);
    if (mb_strlen($value) > 255)  json_error('Value too long', 400);
    json_out(get_or_create_category($db, $kind, $value, $user['id']));
}

// ── POST /api/categories/assign — set/clear a report's value for a kind ───────
// body: { reportId, kind, value }  (empty value clears the assignment)
if ($m === 'POST' && $path === '/assign') {
    $b        = body();
    $reportId = (int)($b['reportId'] ?? 0);
    $kind     = $b['kind'] ?? '';
    $value    = trim((string)($b['value'] ?? ''));
    if (!$reportId)               json_error('reportId required', 400);
    if (!is_category_kind($kind)) json_error('Invalid category kind', 400);

    // Ownership: only the report owner may categorize it.
    $own = $db->prepare('SELECT user_id FROM reports WHERE id = ?');
    $own->execute([$reportId]);
    $row = $own->fetch();
    if (!$row) json_error('Report not found', 404);
    if ((int)$row['user_id'] !== $user['id']) json_error('Forbidden', 403);

    // Multi-value: set the full list for this kind.
    if (array_key_exists('values', $b) && is_array($b['values'])) {
        // Free-form numeric kinds (lumens, current) let the owner create values on the fly;
        // other kinds stay select-only from admin-curated lists.
        $allowCreate = in_array($kind, ['lumens', 'current'], true);
        $cats = set_report_categories($db, $reportId, $kind, $b['values'], $user['id'], $allowCreate);
        json_out(['categories' => $cats]);
    }

    if ($value === '') {
        $db->prepare('DELETE FROM report_categories WHERE report_id = ? AND kind = ?')
           ->execute([$reportId, $kind]);
        json_out(['category' => null]);
    }

    $cat = find_category($db, $kind, $value);
    if (!$cat) json_error('That value is not available. Ask an admin to add it.', 400);
    $db->prepare(
        'INSERT INTO report_categories (report_id, kind, category_id) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE category_id = VALUES(category_id)'
    )->execute([$reportId, $kind, $cat['id']]);
    json_out(['category' => ['id' => $cat['id'], 'value' => $cat['value']]]);
}

// ── POST /api/categories/bulk_assign — categorize many reports at once ────────
// body: { reportIds: [..], values: { kind: [values...], ... }, overwrite: bool }
// - overwrite = true:  every selected report gets every selected category value,
//                      replacing whatever that report already had for that kind.
// - overwrite = false: a report only gets a kind's values if it currently has
//                      NO values assigned for that kind (existing choices are left alone).
if ($m === 'POST' && $path === '/bulk_assign') {
    $b         = body();
    $reportIds = array_values(array_unique(array_map('intval', (array)($b['reportIds'] ?? []))));
    $valuesIn  = is_array($b['values'] ?? null) ? $b['values'] : [];
    $overwrite = !empty($b['overwrite']);

    if (!$reportIds) json_error('reportIds required', 400);

    // Only keep kinds that are valid and actually have at least one non-empty value selected.
    $kindValues = [];
    foreach ($valuesIn as $kind => $vals) {
        if (!is_category_kind($kind) || !is_array($vals)) continue;
        $vals = array_values(array_filter(array_map(fn($v) => trim((string)$v), $vals), fn($v) => $v !== ''));
        if ($vals) $kindValues[$kind] = $vals;
    }
    if (!$kindValues) json_error('No category values selected', 400);

    // Only ever touch reports the caller actually owns.
    $in = implode(',', array_fill(0, count($reportIds), '?'));
    $own = $db->prepare("SELECT id FROM reports WHERE id IN ($in) AND user_id = ?");
    $own->execute([...$reportIds, $user['id']]);
    $ownedIds = array_map(fn($r) => (int)$r['id'], $own->fetchAll());

    $updated = [];
    foreach ($ownedIds as $reportId) {
        $touchedKinds = [];
        foreach ($kindValues as $kind => $vals) {
            if (!$overwrite) {
                $existing = $db->prepare('SELECT 1 FROM report_categories WHERE report_id = ? AND kind = ? LIMIT 1');
                $existing->execute([$reportId, $kind]);
                if ($existing->fetch()) continue; // leave this report's existing value alone
            }
            $allowCreate = in_array($kind, ['lumens', 'current'], true);
            set_report_categories($db, $reportId, $kind, $vals, $user['id'], $allowCreate);
            $touchedKinds[] = $kind;
        }
        if ($touchedKinds) $updated[] = ['id' => $reportId, 'kinds' => $touchedKinds];
    }

    json_out([
        'requested' => count($reportIds),
        'owned'     => count($ownedIds),
        'updated'   => $updated,
    ]);
}

json_error('Not found', 404);