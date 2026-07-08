<?php
// api/_core/categories.php
declare(strict_types=1);

// Categorization helpers for hCRI.io reports.
// Kinds map to the UI labels: Light, CCT, LED Brand, LED Model, Optic.

function category_kinds(): array {
    return ['light_brand', 'light_model', 'led_cct', 'led_brand', 'led_model', 'optic', 'lumens', 'current'];
}

function is_category_kind(?string $k): bool {
    return $k !== null && in_array($k, category_kinds(), true);
}

// Categories assigned to a single report, keyed by kind. Missing kinds are null.
// Wrapped in try/catch so endpoints keep working if the migration hasn't run yet.
function report_categories_map(PDO $db, int $reportId): array {
    $out = array_fill_keys(category_kinds(), []);
    try {
        $s = $db->prepare(
            'SELECT rc.kind, c.id, c.value
               FROM report_categories rc
               JOIN categories c ON c.id = rc.category_id
              WHERE rc.report_id = ?
              ORDER BY c.value'
        );
        $s->execute([$reportId]);
        foreach ($s->fetchAll() as $row) {
            if (array_key_exists($row['kind'], $out)) {
                $out[$row['kind']][] = ['id' => (int)$row['id'], 'value' => $row['value']];
            }
        }
    } catch (\Throwable $e) { /* tables may not exist yet */ }
    return $out;
}

// All category values grouped by kind, optionally with usage counts.
function all_categories(PDO $db, bool $withUses = false): array {
    $out = array_fill_keys(category_kinds(), []);
    $sql = $withUses
        ? 'SELECT c.id, c.kind, c.value, COUNT(rc.report_id) AS uses
              FROM categories c
              LEFT JOIN report_categories rc ON rc.category_id = c.id
             GROUP BY c.id, c.kind, c.value
             ORDER BY c.kind, c.value'
        : 'SELECT id, kind, value FROM categories ORDER BY kind, value';
    try {
        foreach ($db->query($sql)->fetchAll() as $row) {
            $k = $row['kind'];
            if (!array_key_exists($k, $out)) continue;
            $e = ['id' => (int)$row['id'], 'value' => $row['value']];
            if ($withUses) $e['uses'] = (int)$row['uses'];
            $out[$k][] = $e;
        }
    } catch (\Throwable $e) { /* tables may not exist yet */ }
    return $out;
}

// Find an existing category value (case-insensitive on value), else create it.
function get_or_create_category(PDO $db, string $kind, string $value, ?int $uid = null): array {
    $value = trim($value);
    $s = $db->prepare('SELECT id, value FROM categories WHERE kind = ? AND LOWER(value) = LOWER(?) LIMIT 1');
    $s->execute([$kind, $value]);
    $row = $s->fetch();
    if ($row) return ['id' => (int)$row['id'], 'kind' => $kind, 'value' => $row['value']];
    $db->prepare('INSERT INTO categories (kind, value, created_by) VALUES (?, ?, ?)')
       ->execute([$kind, $value, $uid]);
    return ['id' => (int)$db->lastInsertId(), 'kind' => $kind, 'value' => $value];
}

// Find an existing category value (case-insensitive) WITHOUT creating it.
function find_category(PDO $db, string $kind, string $value): ?array {
    $value = trim($value);
    if ($value === '') return null;
    $s = $db->prepare('SELECT id, value FROM categories WHERE kind = ? AND LOWER(value) = LOWER(?) LIMIT 1');
    $s->execute([$kind, $value]);
    $row = $s->fetch();
    return $row ? ['id' => (int)$row['id'], 'kind' => $kind, 'value' => $row['value']] : null;
}

// Rename an existing category value (admin). Throws on collision/missing.
function rename_category(PDO $db, int $id, string $value): array {
    $value = trim($value);
    if ($value === '') throw new \InvalidArgumentException('value required');
    $s = $db->prepare('SELECT kind FROM categories WHERE id = ?');
    $s->execute([$id]);
    $row = $s->fetch();
    if (!$row) throw new \RuntimeException('Category not found');
    $kind = $row['kind'];
    $c = $db->prepare('SELECT id FROM categories WHERE kind = ? AND LOWER(value) = LOWER(?) AND id <> ? LIMIT 1');
    $c->execute([$kind, $value, $id]);
    if ($c->fetch()) throw new \RuntimeException('A value with that name already exists in this category');
    $db->prepare('UPDATE categories SET value = ? WHERE id = ?')->execute([$value, $id]);
    return ['id' => $id, 'kind' => $kind, 'value' => $value];
}

// Replace ALL of a report's values for one kind with the provided list.
// Returns the resulting [{id,value}] array.
function set_report_categories(PDO $db, int $reportId, string $kind, array $values, ?int $uid = null, bool $create = true): array {
    $db->prepare('DELETE FROM report_categories WHERE report_id = ? AND kind = ?')->execute([$reportId, $kind]);
    $out = []; $seen = [];
    foreach ($values as $v) {
        $v = trim((string)$v);
        if ($v === '') continue;
        $key = mb_strtolower($v);
        if (isset($seen[$key])) continue;
        $seen[$key] = true;
        $cat = $create ? get_or_create_category($db, $kind, $v, $uid) : find_category($db, $kind, $v);
        if (!$cat) continue;
        try { $db->prepare('INSERT INTO report_categories (report_id, kind, category_id) VALUES (?, ?, ?)')->execute([$reportId, $kind, $cat['id']]); }
        catch (\Throwable $e) { /* duplicate (report_id, category_id) */ }
        $out[] = ['id' => $cat['id'], 'value' => $cat['value']];
    }
    return $out;
}