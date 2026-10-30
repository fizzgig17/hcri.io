<?php
// api/_core/public_id.php
//
// Random public ids for reports. The numeric reports.id stays the internal key (foreign keys, joins); everything that
// leaves the server (JSON, URLs, sitemap, images) uses reports.public_id instead, so ids can't be counted through.
//
//   hcri_pid($db, 123)           -> "k7m2qx9vte"      (assigns one on first use)
//   hcri_pid_preload($db, [...]) -> loads many at once (use before a loop)
//   hcri_rid($db, "k7m2qx9vte")  -> 123               (0 if there is no such report)
//   hcri_rid($db, "123")         -> 123               (old numeric ids still work for the signed-in API)
//   hcri_is_legacy_id("123")     -> true
//
// Public ids start with a letter, so they can never be mistaken for an old numeric id.
declare(strict_types=1);

require_once __DIR__ . '/db.php';

const HCRI_PID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';   // no 0/o/1/l/i
const HCRI_PID_LEN = 10;

function hcri_is_legacy_id($v): bool
{
    return (is_int($v) && $v > 0) || (is_string($v) && $v !== '' && ctype_digit($v));
}

function hcri_pid_generate(): string
{
    $a = HCRI_PID_ALPHABET; $n = strlen($a);
    $letters = 'abcdefghjkmnpqrstuvwxyz'; 
    $s = $letters[random_int(0, strlen($letters) - 1)];
    for ($i = 1; $i < HCRI_PID_LEN; $i++) $s .= $a[random_int(0, $n - 1)];
    return $s;
}

/** Adds the column and gives every report an id, once per process (cheap check after the first time). */
function hcri_pid_ensure(PDO $db): void
{
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $has = $db->query("SHOW COLUMNS FROM reports LIKE 'public_id'")->fetch();
        if (!$has) {
            $db->exec('ALTER TABLE reports ADD COLUMN public_id VARCHAR(16) NULL, ADD UNIQUE KEY uq_reports_public_id (public_id)');
        }
        $ids = $db->query('SELECT id FROM reports WHERE public_id IS NULL LIMIT 5000')->fetchAll(PDO::FETCH_COLUMN);
        if ($ids) {
            $up = $db->prepare('UPDATE reports SET public_id = ? WHERE id = ? AND public_id IS NULL');
            foreach ($ids as $id) {
                for ($try = 0; $try < 5; $try++) {
                    try { $up->execute([hcri_pid_generate(), (int)$id]); break; } catch (\PDOException $e) { /* duplicate: try another */ }
                }
            }
        }
    } catch (\Throwable $e) { /* leave it; lookups fall back to the numeric id below */ }
}

function &hcri_pid_cache(): array { static $c = []; return $c; }

function hcri_pid_preload(PDO $db, array $ids): void
{
    hcri_pid_ensure($db);
    $c = &hcri_pid_cache();
    $need = [];
    foreach ($ids as $i) { $i = (int)$i; if ($i > 0 && !isset($c[$i])) $need[$i] = $i; }
    foreach (array_chunk(array_values($need), 500) as $chunk) {
        $q = $db->prepare('SELECT id, public_id FROM reports WHERE id IN (' . implode(',', array_fill(0, count($chunk), '?')) . ')');
        $q->execute($chunk);
        foreach ($q->fetchAll() as $r) {
            $pid = (string)($r['public_id'] ?? '');
            if ($pid === '') {   // created since the last backfill
                $pid = hcri_pid_generate();
                try { $db->prepare('UPDATE reports SET public_id=? WHERE id=? AND public_id IS NULL')->execute([$pid, (int)$r['id']]); } catch (\Throwable $e) {}
                $q2 = $db->prepare('SELECT public_id FROM reports WHERE id=?'); $q2->execute([(int)$r['id']]); $pid = (string)$q2->fetchColumn();
            }
            $c[(int)$r['id']] = $pid;
        }
    }
}

/** The public id for an internal report id. */
function hcri_pid(PDO $db, $internalId): string
{
    $i = (int)$internalId;
    $c = &hcri_pid_cache();
    if (!isset($c[$i])) hcri_pid_preload($db, [$i]);
    return $c[$i] ?? (string)$i;
}

/** The internal report id for a public id (or an old numeric id). 0 if there is none. */
function hcri_rid(PDO $db, $key): int
{
    $key = is_int($key) ? (string)$key : trim((string)$key);
    if ($key === '') return 0;
    if (ctype_digit($key)) return (int)$key;
    if (!preg_match('/^[A-Za-z0-9]{6,16}$/', $key)) return 0;
    hcri_pid_ensure($db);
    try {
        $q = $db->prepare('SELECT id FROM reports WHERE public_id = ?');
        $q->execute([$key]);
        return (int)$q->fetchColumn();
    } catch (\Throwable $e) { return 0; }
}

/** Swaps the internal 'id' of each report row for its public id (rows keep every other field). */
function hcri_pid_reports(PDO $db, array $reports): array
{
    hcri_pid_preload($db, array_column($reports, 'id'));
    foreach ($reports as &$r) $r['id'] = hcri_pid($db, $r['id']);
    unset($r);
    return $reports;
}

/** Guests (not signed in) see CCT to the nearest 10 K and Duv to 4 decimals in lists; signed-in users see exact values. */
function hcri_guest_round(int $myId, array $reports): array
{
    if ($myId > 0) return $reports;
    foreach ($reports as &$r) {
        if (isset($r['cct']) && is_numeric($r['cct'])) $r['cct'] = (int)(round($r['cct'] / 10) * 10);
        if (isset($r['duv']) && is_numeric($r['duv'])) $r['duv'] = round((float)$r['duv'], 4);
    }
    unset($r);
    return $reports;
}
