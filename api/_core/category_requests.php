<?php
// api/_core/category_requests.php
declare(strict_types=1);
//
// People suggesting new entries for the curated category lists (light brand / light model, LED CCT / brand / model,
// optic). A suggestion is a row in category_requests (the same table the app's and website's LED pickers already queue
// unknown values in), now with a note and a status; an admin approves it (the value is added to the list) or rejects it.
//   POST /api/categories/suggest        { kind, value, note? }       -> { status: 'sent'|'exists'|'already', ... }
//   GET  /api/categories/suggestions                                  -> the signed-in person's own suggestions
//   GET  /api/admin/category_requests                                 -> pending suggestions, grouped by kind + value
//   POST /api/admin/category_requests/resolve  { kind, value, action: 'approve'|'reject', newValue? }

require_once __DIR__ . '/categories.php';

const CATEGORY_REQUEST_MAX_PENDING = 30;   // per person

/** The kinds people can suggest values for: the curated lists (lumens and current are free-text numbers). */
function category_suggestable_kinds(): array {
    return ['light_brand', 'light_model', 'led_cct', 'led_brand', 'led_model', 'optic'];
}

/** Creates the table if needed and adds the review columns to a pre-existing one. */
function category_requests_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    try {
        $db->exec('CREATE TABLE IF NOT EXISTS category_requests (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            user_id    INT NULL,
            report_id  INT NULL,
            kind       VARCHAR(32)  NOT NULL,
            value      VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_kind_value (kind, value)
        )');
        $have = [];
        foreach ($db->query('SHOW COLUMNS FROM category_requests')->fetchAll() as $c) $have[$c['Field']] = true;
        if (empty($have['note']))        $db->exec('ALTER TABLE category_requests ADD COLUMN note VARCHAR(500) NULL');
        if (empty($have['status']))      $db->exec("ALTER TABLE category_requests ADD COLUMN status VARCHAR(12) NOT NULL DEFAULT 'pending'");
        if (empty($have['reviewed_by'])) $db->exec('ALTER TABLE category_requests ADD COLUMN reviewed_by INT NULL');
        if (empty($have['reviewed_at'])) $db->exec('ALTER TABLE category_requests ADD COLUMN reviewed_at DATETIME NULL');
    } catch (\Throwable $e) { /* no CREATE/ALTER privilege: callers cope */ }
}

/** Records a suggestion. Returns ['status' => 'sent'|'exists'|'already', 'value' => string]. Throws InvalidArgumentException for bad input. */
function category_request_submit(PDO $db, int $uid, string $kind, string $value, string $note = ''): array {
    category_requests_ensure($db);
    $value = trim(preg_replace('/\s+/', ' ', $value));
    $note  = mb_substr(trim($note), 0, 500);
    if (!in_array($kind, category_suggestable_kinds(), true)) throw new InvalidArgumentException('Invalid category');
    if ($value === '') throw new InvalidArgumentException('Please enter the value you would like added');
    if (mb_strlen($value) > 120) throw new InvalidArgumentException('That value is too long');

    $ex = find_category($db, $kind, $value);
    if ($ex) return ['status' => 'exists', 'value' => (string)$ex['value']];

    $dup = $db->prepare("SELECT 1 FROM category_requests WHERE user_id = ? AND kind = ? AND LOWER(value) = LOWER(?) AND status = 'pending' LIMIT 1");
    $dup->execute([$uid, $kind, $value]);
    if ($dup->fetchColumn()) return ['status' => 'already', 'value' => $value];

    $cnt = $db->prepare("SELECT COUNT(*) FROM category_requests WHERE user_id = ? AND status = 'pending'");
    $cnt->execute([$uid]);
    if ((int)$cnt->fetchColumn() >= CATEGORY_REQUEST_MAX_PENDING) throw new InvalidArgumentException('You have a lot of suggestions waiting for review already. Please wait for some to be reviewed.');

    $db->prepare('INSERT INTO category_requests (user_id, kind, value, note) VALUES (?, ?, ?, ?)')
       ->execute([$uid, $kind, $value, $note !== '' ? $note : null]);

    // Best-effort heads-up to the site owner.
    try {
        require_once __DIR__ . '/mailer.php';
        $who = $db->prepare('SELECT name, email FROM users WHERE id = ?');
        $who->execute([$uid]);
        $u = $who->fetch() ?: ['name' => '?', 'email' => ''];
        send_email(MAIL_FROM, MAIL_FROM_NAME, 'hCRI.io category suggestion: ' . $value,
            "New category suggestion\n\nKind:  $kind\nValue: $value\nNote:  " . ($note !== '' ? $note : '-') . "\nFrom:  {$u['name']} <{$u['email']}>\n\nReview it in Admin > Categories > Suggestions.");
    } catch (\Throwable $e) { /* the suggestion is saved either way */ }
    return ['status' => 'sent', 'value' => $value];
}

/** The person's own suggestions, newest first. */
function category_requests_mine(PDO $db, int $uid): array {
    category_requests_ensure($db);
    $s = $db->prepare('SELECT id, kind, value, note, status, created_at FROM category_requests WHERE user_id = ? ORDER BY id DESC LIMIT 100');
    $s->execute([$uid]);
    return array_map(fn($r) => ['id' => (int)$r['id'], 'kind' => $r['kind'], 'value' => $r['value'], 'note' => $r['note'], 'status' => $r['status'], 'createdAt' => $r['created_at']], $s->fetchAll());
}

/** Pending suggestions grouped by kind + value (case-insensitive), most-requested first. */
function category_requests_pending(PDO $db): array {
    category_requests_ensure($db);
    $rows = $db->query("SELECT r.kind, r.value, r.note, r.created_at, u.name AS user_name
                          FROM category_requests r LEFT JOIN users u ON u.id = r.user_id
                         WHERE r.status = 'pending' ORDER BY r.id")->fetchAll();
    $g = [];
    foreach ($rows as $r) {
        $key = $r['kind'] . "\0" . mb_strtolower($r['value']);
        if (!isset($g[$key])) $g[$key] = ['kind' => $r['kind'], 'value' => $r['value'], 'count' => 0, 'users' => [], 'notes' => [], 'latest' => $r['created_at']];
        $g[$key]['count']++;
        if ($r['user_name'] && !in_array($r['user_name'], $g[$key]['users'], true)) $g[$key]['users'][] = $r['user_name'];
        if ($r['note'] && count($g[$key]['notes']) < 3) $g[$key]['notes'][] = $r['note'];
        $g[$key]['latest'] = $r['created_at'];
    }
    $out = array_values($g);
    usort($out, fn($a, $b) => $b['count'] <=> $a['count'] ?: strcmp($b['latest'], $a['latest']));
    return $out;
}

/**
 * Approves (adds the value, or newValue if the admin corrected it, to the list) or rejects every pending suggestion for
 * kind + value. Returns ['resolved' => n, 'category' => ?array].
 */
function category_requests_resolve(PDO $db, int $adminId, string $kind, string $value, string $action, ?string $newValue = null): array {
    category_requests_ensure($db);
    if (!in_array($kind, category_suggestable_kinds(), true)) throw new InvalidArgumentException('Invalid category');
    $cat = null;
    if ($action === 'approve') {
        $final = trim((string)($newValue ?? $value));
        if ($final === '' || mb_strlen($final) > 255) throw new InvalidArgumentException('Invalid value');
        $cat = get_or_create_category($db, $kind, $final, $adminId);
    } elseif ($action !== 'reject') {
        throw new InvalidArgumentException('Invalid action');
    }
    $u = $db->prepare("UPDATE category_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW()
                        WHERE status = 'pending' AND kind = ? AND LOWER(value) = LOWER(?)");
    $u->execute([$action === 'approve' ? 'approved' : 'rejected', $adminId, $kind, $value]);
    return ['resolved' => $u->rowCount(), 'category' => $cat];
}
