<?php
declare(strict_types=1);

// tools/copy_demo_readings.php
//
// Fills a DEMO account (for App Review, screenshots, trying things out) with a random selection of another account's data.
// Run it on the server, from the site root:
//
//   php tools/copy_demo_readings.php --from=fizzgig@hcri.io --to=demo@hcri.io --reports=6 --backups=6 --light="Demo light" --dry-run
//
// What it can do (each part is optional):
//   --reports=N      copy N random reports from --from to --to as PRIVATE reports (their own ids, share tokens, categories, LEDs;
//                    the original is untouched and the copies are not public, not listed on Explore).
//   --backups=N      copy N random app-history backups (the readings "Restore readings from backup" brings back in the app).
//                    A backup that belongs to a copied report is linked to the copy; the others are copied WITHOUT any report link,
//                    so in the app they show as "not uploaded" and the reviewer can try uploading / syncing them.
//   --light=NAME     create a light called NAME on the demo account holding the first --light-readings=K (default 3) copied reports.
//   --reset          first delete everything the demo account has (reports, lights, app-history backups). Needs --yes, and the
//                    demo email must start with "demo" (or pass --force-target). Use it to tidy the account after a review.
//   --seed=N         repeatable random choice.   --dry-run: show what would happen, change nothing.
//
// Nothing is ever changed or deleted on the --from account.

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

chdir(dirname(__DIR__));
require_once 'api/_core/db.php';
require_once 'api/_core/public_id.php';
require_once 'api/_core/lights.php';

$o = getopt('', ['from::', 'to::', 'reports::', 'backups::', 'light::', 'light-readings::', 'reset', 'yes', 'force-target', 'seed::', 'dry-run', 'help']);
if (isset($o['help'])) { echo file_get_contents(__FILE__, false, null, 0, 2600), "\n"; exit(0); }
$fromEmail = (string)($o['from'] ?? 'fizzgig@hcri.io');
$toEmail   = (string)($o['to'] ?? 'demo@hcri.io');
$nReports  = max(0, (int)($o['reports'] ?? 6));
$nBackups  = max(0, (int)($o['backups'] ?? 6));
$lightName = isset($o['light']) && $o['light'] !== false ? trim((string)$o['light']) : '';
$lightN    = max(1, (int)($o['light-readings'] ?? 3));
$dry       = isset($o['dry-run']);
if (isset($o['seed'])) mt_srand((int)$o['seed']);

function out(string $m): void { echo $m, "\n"; }
function bail(string $m): never { fwrite(STDERR, "Error: $m\n"); exit(1); }
/** Random pick without repeats, using mt_rand so --seed makes it repeatable. */
function pick(array $items, int $n): array {
    $items = array_values($items);
    for ($i = count($items) - 1; $i > 0; $i--) { $j = mt_rand(0, $i); [$items[$i], $items[$j]] = [$items[$j], $items[$i]]; }
    return array_slice($items, 0, $n);
}
function tbl(PDO $db, string $t): bool { try { $db->query("SELECT 1 FROM `$t` LIMIT 1"); return true; } catch (\Throwable $e) { return false; } }
function cols(PDO $db, string $t): array { return array_map(fn($r) => $r['Field'], $db->query("SHOW COLUMNS FROM `$t`")->fetchAll()); }

$db = get_db();
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
hcri_pid_ensure($db);
lights_ensure($db);

$findUser = function (string $email) use ($db): array {
    $s = $db->prepare('SELECT id, email, name FROM users WHERE LOWER(email) = LOWER(?)');
    $s->execute([$email]);
    return $s->fetch() ?: bail("No account with the email $email.");
};
$from = $findUser($fromEmail);
$to   = $findUser($toEmail);
if ((int)$from['id'] === (int)$to['id']) bail('--from and --to are the same account.');
out("From: {$from['email']} (id {$from['id']})   To: {$to['email']} (id {$to['id']})" . ($dry ? '   [dry run]' : ''));

$reset = isset($o['reset']);
if ($reset) {
    if (!isset($o['force-target']) && !str_starts_with(strtolower($to['email']), 'demo')) bail('Refusing to reset an account whose email does not start with "demo" (use --force-target to override).');
    if (!isset($o['yes']) && !$dry) bail('--reset deletes everything on the target account; add --yes to confirm.');
}

$hasBackups = tbl($db, 'companion_backups');
$hasCats    = tbl($db, 'report_categories');
$hasLeds    = tbl($db, 'report_leds');
$rCols      = cols($db, 'reports');
$count = fn(string $sql, array $p) => (function () use ($db, $sql, $p) { $s = $db->prepare($sql); $s->execute($p); return (int)$s->fetchColumn(); })();

// ── reset ───────────────────────────────────────────────────────────────────────────────────────
if ($reset) {
    $tid = (int)$to['id'];
    $ids = $db->prepare('SELECT id FROM reports WHERE user_id = ?'); $ids->execute([$tid]); $rids = array_map('intval', $ids->fetchAll(PDO::FETCH_COLUMN));
    $lids = $db->prepare('SELECT id FROM lights WHERE user_id = ?'); $lids->execute([$tid]); $lightIds = array_map('intval', $lids->fetchAll(PDO::FETCH_COLUMN));
    $nb = $hasBackups ? $count('SELECT COUNT(*) FROM companion_backups WHERE user_id = ?', [$tid]) : 0;
    out("Reset: would delete " . count($rids) . " reports, " . count($lightIds) . " lights, $nb app-history backups on {$to['email']}.");
    if (!$dry) {
        $db->beginTransaction();
        $in = static fn(array $a) => implode(',', array_map('intval', $a)) ?: '0';
        if ($lightIds) { foreach (['light_reports', 'light_categories'] as $t) $db->exec("DELETE FROM $t WHERE light_id IN (" . $in($lightIds) . ')'); $db->exec('DELETE FROM lights WHERE id IN (' . $in($lightIds) . ')'); }
        if ($rids) {
            $db->exec('DELETE FROM light_reports WHERE report_id IN (' . $in($rids) . ')');
            if ($hasCats) $db->exec('DELETE FROM report_categories WHERE report_id IN (' . $in($rids) . ')');
            if ($hasLeds) $db->exec('DELETE FROM report_leds WHERE report_id IN (' . $in($rids) . ')');
            $db->exec('DELETE FROM reports WHERE user_id = ' . $tid);
        }
        if ($hasBackups) $db->prepare('DELETE FROM companion_backups WHERE user_id = ?')->execute([$tid]);
        $db->commit();
        out('Reset done.');
    }
}

// ── reports ─────────────────────────────────────────────────────────────────────────────────────
$map = [];            // source report id (internal, public id) => new report [id, public id]
$newReports = [];     // in copy order
if ($nReports > 0) {
    $s = $db->prepare('SELECT * FROM reports WHERE user_id = ?'); $s->execute([(int)$from['id']]);
    $all = $s->fetchAll();
    if (!$all) out('The source account has no reports.');
    $chosen = pick($all, $nReports);
    $copyCols = array_values(array_diff($rCols, ['id', 'user_id', 'public_id', 'share_token', 'is_public']));
    $extra = [];
    if (in_array('is_public', $rCols, true)) $extra['is_public'] = 0;
    if (in_array('share_token', $rCols, true)) $extra['share_token'] = null;   // set per row below
    if (!$dry) $db->beginTransaction();
    foreach ($chosen as $r) {
        out(sprintf('  report %s  "%s"  CCT %s', $r['public_id'] ?? $r['id'], $r['label'], isset($r['cct']) ? round((float)$r['cct']) : '?'));
        if ($dry) { $newReports[] = ['src' => $r, 'id' => 0, 'pid' => '(new)']; continue; }
        $names = array_merge(['user_id', 'public_id'], array_keys($extra), $copyCols);
        $pid = '';
        for ($try = 0; $try < 8; $try++) {
            $pid = hcri_pid_generate();
            $vals = [(int)$to['id'], $pid];
            foreach ($extra as $k => $v) $vals[] = $k === 'share_token' ? bin2hex(random_bytes(8)) : $v;
            foreach ($copyCols as $c) $vals[] = $r[$c];
            try {
                $db->prepare('INSERT INTO reports (`' . implode('`,`', $names) . '`) VALUES (' . implode(',', array_fill(0, count($names), '?')) . ')')->execute($vals);
                break;
            } catch (\PDOException $e) { if ($try === 7 || stripos($e->getMessage(), 'public_id') === false) throw $e; }
        }
        $newId = (int)$db->lastInsertId();
        if ($hasCats) {
            $cs = $db->prepare('SELECT kind, category_id FROM report_categories WHERE report_id = ?'); $cs->execute([(int)$r['id']]);
            foreach ($cs->fetchAll() as $c) $db->prepare('INSERT IGNORE INTO report_categories (report_id, kind, category_id) VALUES (?,?,?)')->execute([$newId, $c['kind'], $c['category_id']]);
        }
        if ($hasLeds) {
            $lc = array_values(array_diff(cols($db, 'report_leds'), ['id', 'report_id']));
            $ls = $db->prepare('SELECT * FROM report_leds WHERE report_id = ?'); $ls->execute([(int)$r['id']]);
            foreach ($ls->fetchAll() as $l) {
                $db->prepare('INSERT INTO report_leds (report_id,`' . implode('`,`', $lc) . '`) VALUES (?,' . implode(',', array_fill(0, count($lc), '?')) . ')')->execute(array_merge([$newId], array_map(fn($c) => $l[$c], $lc)));
            }
        }
        $map[(string)$r['id']] = ['id' => $newId, 'pid' => $pid];
        if (!empty($r['public_id'])) $map[(string)$r['public_id']] = ['id' => $newId, 'pid' => $pid];
        $newReports[] = ['src' => $r, 'id' => $newId, 'pid' => $pid];
    }
    if (!$dry) $db->commit();
    out(count($chosen) . ' report(s) ' . ($dry ? 'would be copied' : 'copied') . ' as private reports.');
}

// ── app-history backups ─────────────────────────────────────────────────────────────────────────
if ($nBackups > 0) {
    if (!$hasBackups) { out('No companion_backups table: skipping backups.'); }
    else {
        $s = $db->prepare("SELECT item_id, saved_at, payload FROM companion_backups WHERE user_id = ? AND item_id NOT LIKE 'fl\\_%'"); $s->execute([(int)$from['id']]);
        $rows = $s->fetchAll();
        $chosen = pick($rows, $nBackups);
        $linked = 0; $loose = 0;
        if (!$dry) $db->beginTransaction();
        foreach ($chosen as $b) {
            $p = json_decode((string)$b['payload'], true);
            if (!is_array($p)) continue;
            $rid = isset($p['reportId']) ? (string)$p['reportId'] : '';
            if ($rid !== '' && isset($map[$rid])) { $p['reportId'] = $map[$rid]['pid']; $p['reportIsPublic'] = false; $linked++; }
            else { unset($p['reportId'], $p['reportIsPublic']); $p['catSynced'] = false; $p['ledSynced'] = false; $loose++; }   // shows as "not uploaded"
            if (!$dry) {
                $db->prepare('INSERT INTO companion_backups (user_id, item_id, saved_at, payload) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE saved_at = VALUES(saved_at), payload = VALUES(payload)')
                   ->execute([(int)$to['id'], $b['item_id'], $b['saved_at'], json_encode($p, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
            }
        }
        if (!$dry) $db->commit();
        out(count($chosen) . " backup(s) " . ($dry ? 'would be copied' : 'copied') . ": $linked linked to a copied report, $loose without a report (show as not uploaded).");
    }
}

// ── a light ─────────────────────────────────────────────────────────────────────────────────────
if ($lightName !== '') {
    $use = array_slice($newReports, 0, $lightN);
    if (!$use) out('No copied reports to put on a light (use --reports).');
    elseif ($dry) out("A light \"$lightName\" would be created with " . count($use) . ' reading(s).');
    else {
        $db->prepare('INSERT INTO lights (user_id, name, notes) VALUES (?,?,?)')->execute([(int)$to['id'], $lightName, '']);
        $lid = (int)$db->lastInsertId();
        $hasPos = in_array('pos', cols($db, 'light_reports'), true);
        foreach ($use as $i => $n) {
            $q = $hasPos ? 'INSERT INTO light_reports (light_id, report_id, label, pos) VALUES (?,?,?,?)' : 'INSERT INTO light_reports (light_id, report_id, label) VALUES (?,?,?)';
            $db->prepare($q)->execute($hasPos ? [$lid, $n['id'], '', $i + 1] : [$lid, $n['id'], '']);
        }
        out("Light \"$lightName\" created with " . count($use) . ' reading(s). Set its categories on the website (Lights).');
    }
}
out($dry ? 'Dry run: nothing was changed.' : 'Done.');
