<?php
// api/_core/categories_csv.php
declare(strict_types=1);
require_once __DIR__ . '/report_leds.php';

// Shared logic for category CSV export/import, duplicate audit/merge, and case
// normalization. Used by both the admin API (api/admin.php) and the CLI tool
// (tools/categories_csv.php) so the two stay in lockstep.

require_once __DIR__ . '/categories.php';
require_once __DIR__ . '/settings.php';

const CATEGORY_VALID_CASES = ['upper', 'lower', 'sentence', 'title'];

function category_apply_case(string $value, string $case): string {
    switch ($case) {
        case 'upper':
            return mb_strtoupper($value, 'UTF-8');
        case 'lower':
            return mb_strtolower($value, 'UTF-8');
        case 'sentence':
            $lower = mb_strtolower($value, 'UTF-8');
            $first = mb_substr($lower, 0, 1, 'UTF-8');
            $rest  = mb_substr($lower, 1, null, 'UTF-8');
            return mb_strtoupper($first, 'UTF-8') . $rest;
        case 'title':
            // Capitalizes the first letter of each word, lowercases the rest.
            // Words are split on whitespace/hyphens/etc, so "high-cri" -> "High-Cri".
            return preg_replace_callback(
                '/[\p{L}\p{N}\']+/u',
                function (array $m): string {
                    $w = mb_strtolower($m[0], 'UTF-8');
                    return mb_strtoupper(mb_substr($w, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($w, 1, null, 'UTF-8');
                },
                $value
            );
        default:
            throw new \InvalidArgumentException("Unknown case '$case'. Use one of: " . implode(', ', CATEGORY_VALID_CASES) . '.');
    }
}

// ── Export ───────────────────────────────────────────────────────────────────

function categories_export_rows(PDO $db): array {
    return $db->query(
        'SELECT c.id, c.kind, c.value, COUNT(rc.report_id) AS uses
           FROM categories c
           LEFT JOIN report_categories rc ON rc.category_id = c.id
          GROUP BY c.id, c.kind, c.value
          ORDER BY c.kind, c.value'
    )->fetchAll();
}

function categories_export_csv_string(PDO $db): string {
    $fh = fopen('php://temp', 'r+');
    fputcsv($fh, ['id', 'kind', 'value', 'uses']);
    foreach (categories_export_rows($db) as $r) {
        fputcsv($fh, [$r['id'], $r['kind'], $r['value'], $r['uses']]);
    }
    rewind($fh);
    $out = stream_get_contents($fh);
    fclose($fh);
    return $out;
}

// ── Import ───────────────────────────────────────────────────────────────────
// Parses/applies a CSV with columns id (optional), kind, value. Never creates a
// duplicate: rows without an id are matched case-insensitively within their kind
// via find_category(); rows with an id are only renamed after the same
// case-insensitive collision check rename_category() itself uses.

function categories_import_csv_string(PDO $db, string $csv, bool $dryRun): array {
    $fh = fopen('php://temp', 'r+');
    fwrite($fh, $csv);
    rewind($fh);

    $header = fgetcsv($fh);
    if (!$header) throw new \InvalidArgumentException('CSV is empty.');
    $header   = array_map(fn($h) => strtolower(trim((string)$h)), $header);
    $idIdx    = array_search('id', $header, true);
    $kindIdx  = array_search('kind', $header, true);
    $valueIdx = array_search('value', $header, true);
    if ($kindIdx === false || $valueIdx === false) {
        throw new \InvalidArgumentException("CSV must have at least 'kind' and 'value' columns (an 'id' column is optional).");
    }

    $created = 0; $renamed = 0; $unchanged = 0; $skipped = 0; $errors = 0;
    $log = [];
    $seenInFile = [];
    $lineNo = 1;

    while (($row = fgetcsv($fh)) !== false) {
        $lineNo++;
        $kind  = trim((string)($row[$kindIdx] ?? ''));
        $value = trim((string)($row[$valueIdx] ?? ''));
        $id    = ($idIdx !== false) ? trim((string)($row[$idIdx] ?? '')) : '';

        if ($value === '') { $skipped++; continue; }
        if (!is_category_kind($kind)) {
            $log[] = "Line $lineNo: skipped — unknown kind '$kind'";
            $errors++; continue;
        }
        if (mb_strlen($value) > 255) {
            $log[] = "Line $lineNo: skipped — value too long";
            $errors++; continue;
        }

        $dupKey = $kind . '|' . mb_strtolower($value);
        if (isset($seenInFile[$dupKey])) { $skipped++; continue; }
        $seenInFile[$dupKey] = true;

        if ($id !== '') {
            $s = $db->prepare('SELECT id, kind, value FROM categories WHERE id = ?');
            $s->execute([(int)$id]);
            $existing = $s->fetch();
            if (!$existing) {
                $log[] = "Line $lineNo: skipped — id $id not found (leave id blank to create a new value)";
                $errors++; continue;
            }
            if ($existing['kind'] !== $kind) {
                $log[] = "Line $lineNo: skipped — id $id belongs to kind '{$existing['kind']}', not '$kind' (kind can't be changed via import)";
                $errors++; continue;
            }
            if (mb_strtolower($existing['value']) === mb_strtolower($value)) {
                if ($existing['value'] !== $value) {
                    if (!$dryRun) $db->prepare('UPDATE categories SET value = ? WHERE id = ?')->execute([$value, (int)$id]);
                    $renamed++;
                } else {
                    $unchanged++;
                }
                continue;
            }
            $c = $db->prepare('SELECT id FROM categories WHERE kind = ? AND LOWER(value) = LOWER(?) AND id <> ? LIMIT 1');
            $c->execute([$kind, $value, (int)$id]);
            if ($c->fetch()) {
                $log[] = "Line $lineNo: skipped — renaming id $id to '$value' would duplicate an existing $kind value";
                $skipped++; continue;
            }
            if (!$dryRun) $db->prepare('UPDATE categories SET value = ? WHERE id = ?')->execute([$value, (int)$id]);
            $renamed++;
            continue;
        }

        $existing = find_category($db, $kind, $value);
        if ($existing) { $unchanged++; continue; }
        if (!$dryRun) get_or_create_category($db, $kind, $value);
        $created++;
    }
    fclose($fh);

    return [
        'dryRun'    => $dryRun,
        'created'   => $created,
        'renamed'   => $renamed,
        'unchanged' => $unchanged,
        'skipped'   => $skipped,
        'errors'    => $errors,
        'log'       => $log,
    ];
}

// ── Duplicate audit / merge ─────────────────────────────────────────────────

function categories_find_dupes(PDO $db): array {
    $rows = $db->query('SELECT id, kind, value FROM categories ORDER BY kind, LOWER(value), id')->fetchAll();
    $groups = [];
    foreach ($rows as $r) {
        $key = $r['kind'] . '|' . mb_strtolower($r['value']);
        $groups[$key][] = ['id' => (int)$r['id'], 'value' => $r['value']];
    }
    $out = [];
    foreach ($groups as $key => $items) {
        if (count($items) < 2) continue;
        [$kind] = explode('|', $key, 2);
        $out[] = ['kind' => $kind, 'items' => $items];
    }
    return $out;
}

function categories_merge(PDO $db, int $keepId, int $dropId, bool $dryRun): array {
    if ($keepId === $dropId) throw new \InvalidArgumentException('keep_id and drop_id must be different.');
    $s = $db->prepare('SELECT id, kind, value FROM categories WHERE id = ?');
    $s->execute([$keepId]);
    $keep = $s->fetch();
    if (!$keep) throw new \RuntimeException("id $keepId not found.");
    $s->execute([$dropId]);
    $drop = $s->fetch();
    if (!$drop) throw new \RuntimeException("id $dropId not found.");
    if ($keep['kind'] !== $drop['kind']) throw new \RuntimeException('Both ids must belong to the same category kind.');

    if ($dryRun) {
        return ['dryRun' => true, 'kind' => $keep['kind'], 'keep' => $keep['value'], 'dropped' => $drop['value']];
    }

    $db->beginTransaction();
    try {
        $db->prepare(
            'DELETE FROM report_categories
              WHERE category_id = ?
                AND report_id IN (SELECT report_id FROM (
                      SELECT report_id FROM report_categories WHERE category_id = ?
                    ) x)'
        )->execute([$dropId, $keepId]);
        $db->prepare('UPDATE report_categories SET category_id = ? WHERE category_id = ?')->execute([$keepId, $dropId]);
        report_leds_repoint($db, $dropId, $keepId, (string)$keep['kind']);
        $db->prepare('DELETE FROM categories WHERE id = ?')->execute([$dropId]);
        $db->commit();
    } catch (\Throwable $e) {
        $db->rollBack();
        throw $e;
    }
    return ['dryRun' => false, 'kind' => $keep['kind'], 'keep' => $keep['value'], 'dropped' => $drop['value']];
}

// ── Normalize ────────────────────────────────────────────────────────────────
// Rewriting only letter case can never create a new duplicate: LOWER(value) is
// unchanged by any of the four case transforms, and LOWER(value) uniqueness
// per kind is already guaranteed by get_or_create_category()/rename_category().

function categories_normalize(PDO $db, array $kinds, string $case, bool $dryRun): array {
    if (!in_array($case, CATEGORY_VALID_CASES, true)) {
        throw new \InvalidArgumentException("Unknown case '$case'. Use one of: " . implode(', ', CATEGORY_VALID_CASES) . '.');
    }
    foreach ($kinds as $kind) {
        if (!is_category_kind($kind)) throw new \InvalidArgumentException("Unknown kind '$kind'.");
    }

    $changed = 0; $unchanged = 0; $changes = [];
    foreach ($kinds as $kind) {
        $s = $db->prepare('SELECT id, value FROM categories WHERE kind = ? ORDER BY value');
        $s->execute([$kind]);
        foreach ($s->fetchAll() as $r) {
            $new = category_apply_case($r['value'], $case);
            if ($new === $r['value']) { $unchanged++; continue; }
            $changes[] = ['id' => (int)$r['id'], 'kind' => $kind, 'from' => $r['value'], 'to' => $new];
            if (!$dryRun) {
                $db->prepare('UPDATE categories SET value = ? WHERE id = ?')->execute([$new, $r['id']]);
            }
            $changed++;
        }
    }
    return ['dryRun' => $dryRun, 'case' => $case, 'changed' => $changed, 'unchanged' => $unchanged, 'changes' => $changes];
}

// ── Per-kind case preferences (remembered choice shown in the admin UI) ──────

function category_case_prefs_get(PDO $db): array {
    $prefs = setting_get($db, 'category_case_prefs', []);
    return is_array($prefs) ? $prefs : [];
}

function category_case_prefs_set(PDO $db, array $prefs): array {
    $clean = [];
    foreach ($prefs as $kind => $case) {
        if (!is_category_kind((string)$kind)) continue;
        if (!in_array($case, CATEGORY_VALID_CASES, true)) continue;
        $clean[$kind] = $case;
    }
    setting_set($db, 'category_case_prefs', $clean);
    return $clean;
}