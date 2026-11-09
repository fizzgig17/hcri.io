<?php
declare(strict_types=1);

// Private cloud backup for the hCRI Companion app.
//
// One row per backed-up reading (the app's own reading id), owned by the API token's user. These rows are NOT
// reports: they never appear on explore, search, profiles or any public/shared page, and nothing here is
// reachable without the owner's API token. Later the app can offer to turn selected backups into ordinary
// reports; until then the data is only ever returned to the user who stored it.

const COMPANION_BACKUP_MAX_ITEM_BYTES = 262144;   // one reading with its spectrum is a few tens of KB
const COMPANION_BACKUP_MAX_BATCH      = 25;       // items per request
const COMPANION_BACKUP_MAX_PER_USER   = 5000;     // readings kept per account

function companion_backup_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $cols = 'user_id      INT NOT NULL,
            item_id      VARCHAR(64) NOT NULL,
            saved_at     BIGINT NOT NULL,
            updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            payload      MEDIUMTEXT NOT NULL,
            PRIMARY KEY (user_id, item_id),
            KEY idx_user_saved (user_id, saved_at)';
    try {
        try { $db->exec("CREATE TABLE IF NOT EXISTS companion_backups ($cols, CONSTRAINT fk_cb_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)"); }
        catch (\Throwable $e) { $db->exec("CREATE TABLE IF NOT EXISTS companion_backups ($cols)"); }
    } catch (\Throwable $e) { /* no CREATE privilege: run sql/companion_backups.sql */ }
}

/** Removes everything a user backed up (called when an account is deleted). */
function companion_backup_delete_user(PDO $db, int $userId): void {
    try { $db->prepare('DELETE FROM companion_backups WHERE user_id = ?')->execute([$userId]); } catch (\Throwable $e) {}
}

/** Item ids are the app's own ids ("1760000000000-ab12cd"): keep them to a safe, short character set. */
function companion_backup_valid_id(mixed $id): bool {
    return is_string($id) && preg_match('/^[A-Za-z0-9._-]{1,64}$/', $id) === 1;
}

/**
 * Compact row for the website's "App history" list: the numbers and labels, without the spectrum.
 * $p is one decoded backup payload (a saved reading, or a saved flicker whose id starts with "fl_").
 */
function companion_backup_summary(string $id, int $savedAt, array $p): array {
    $isFlicker = str_starts_with($id, 'fl_');
    $res = is_array($p['result'] ?? null) ? $p['result'] : [];
    $fl  = $isFlicker ? ($p['flicker'] ?? null) : ($res['flicker'] ?? null);
    $leds = [];
    foreach ((is_array($p['leds'] ?? null) ? $p['leds'] : (is_array($p['led'] ?? null) ? [$p['led']] : [])) as $l) {
        if (!is_array($l)) continue;
        $t = trim(implode(' ', array_filter([(string)($l['brand'] ?? ''), (string)($l['model'] ?? ''), (string)($l['cct'] ?? '')])));
        if ($t !== '') $leds[] = $t;
    }
    $an = is_array($p['analysis'] ?? null) ? $p['analysis'] : [];
    $num = static fn($v) => is_numeric($v) ? (float)$v : null;
    $ri  = is_array($res['rIndices'] ?? null) ? array_map($num, array_slice($res['rIndices'], 0, 15)) : [];
    return [
        'id'        => $id,
        'kind'      => $isFlicker ? 'flicker' : 'reading',
        'savedAt'   => $savedAt,
        'label'     => mb_substr((string)($p['label'] ?? ''), 0, 200),
        'device'    => mb_substr((string)($res['deviceName'] ?? ($p['model'] ?? '')), 0, 80),
        'cct'       => $num($an['cct'] ?? ($res['cct'] ?? null)),
        'duv'       => $num($an['duv'] ?? ($res['duv'] ?? null)),
        'ra'        => $num($an['ra']  ?? ($res['ra']  ?? null)),
        'r9'        => $ri[8] ?? null,
        'rIndices'  => $ri,
        'lux'       => $num($res['lux'] ?? null),
        'rf'        => $num($res['tm30Rf'] ?? null),
        'rg'        => $num($res['tm30Rg'] ?? null),
        'leds'      => $leds,
        'categories'=> is_array($p['categories'] ?? null) ? array_map(static fn($v) => mb_substr((string)$v, 0, 80), $p['categories']) : new stdClass(),
        'reportId'  => isset($p['reportId']) ? (string)$p['reportId'] : null,
        'reportIsPublic' => isset($p['reportIsPublic']) ? (bool)$p['reportIsPublic'] : null,
        'flicker'   => is_array($fl) ? ['hz' => $num($fl['frequencyHz'] ?? null), 'percent' => $num($fl['percentFlicker'] ?? null), 'index' => $num($fl['flickerIndex'] ?? null)] : null,
        'hasSpectrum' => !$isFlicker && is_array($res['spectrum'] ?? null) && count($res['spectrum']) > 0,
    ];
}

/** One page of a user's backed-up history, newest first. Cursor is "<saved_at>:<item_id>". */
function companion_backup_page(PDO $db, int $uid, int $limit, string $after): array {
    companion_backup_ensure($db);
    $limit = max(1, min(100, $limit));
    $where = 'user_id = ?';
    $args  = [$uid];
    if ($after !== '' && preg_match('/^(\d{1,20}):([A-Za-z0-9._-]{1,64})$/', $after, $m)) {
        $where .= ' AND (saved_at < ? OR (saved_at = ? AND item_id < ?))';
        array_push($args, (int)$m[1], (int)$m[1], $m[2]);
    }
    $s = $db->prepare("SELECT item_id, saved_at, payload FROM companion_backups WHERE $where ORDER BY saved_at DESC, item_id DESC LIMIT " . ($limit + 1));
    $s->execute($args);
    $rows = $s->fetchAll();
    $next = null;
    if (count($rows) > $limit) {
        array_pop($rows);
        $last = end($rows);
        $next = $last['saved_at'] . ':' . $last['item_id'];
    }
    $items = [];
    foreach ($rows as $r) {
        $p = json_decode((string)$r['payload'], true);
        if (!is_array($p)) continue;
        $items[] = companion_backup_summary((string)$r['item_id'], (int)$r['saved_at'], $p);
    }
    $c = $db->prepare('SELECT COUNT(*) FROM companion_backups WHERE user_id = ?');
    $c->execute([$uid]);
    return ['items' => $items, 'next' => $next, 'total' => (int)$c->fetchColumn(), 'maxPerUser' => COMPANION_BACKUP_MAX_PER_USER];
}

/** The spectrum (nm, value) of one backed-up reading, thinned to at most ~200 points, for the history chart. */
function companion_backup_spectrum(PDO $db, int $uid, string $id): ?array {
    companion_backup_ensure($db);
    if (!companion_backup_valid_id($id)) return null;
    $s = $db->prepare('SELECT payload FROM companion_backups WHERE user_id = ? AND item_id = ?');
    $s->execute([$uid, $id]);
    $raw = $s->fetchColumn();
    if ($raw === false) return null;
    $p = json_decode((string)$raw, true);
    $sp = is_array($p['result']['spectrum'] ?? null) ? $p['result']['spectrum'] : [];
    $n = count($sp);
    $step = max(1, (int)ceil($n / 200));
    $out = [];
    for ($i = 0; $i < $n; $i += $step) {
        $pt = $sp[$i];
        if (is_array($pt) && isset($pt['nm'], $pt['value'])) $out[] = [(float)$pt['nm'], (float)$pt['value']];
    }
    return $out;
}

/** Shared by the signed-in-user route and the admin route; reads ?after=, ?limit= and ?spectrum=<id>. */
function companion_backup_respond(PDO $db, int $uid): never {
    if (isset($_GET['spectrum'])) {
        $sp = companion_backup_spectrum($db, $uid, (string)$_GET['spectrum']);
        if ($sp === null) json_error('Not found', 404);
        json_out(['spectrum' => $sp]);
    }
    json_out(companion_backup_page($db, $uid, (int)($_GET['limit'] ?? 50), (string)($_GET['after'] ?? '')));
}
