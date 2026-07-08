<?php
declare(strict_types=1);
require_once __DIR__ . '/_core/response.php';
require_once __DIR__ . '/_core/db.php';
require_once __DIR__ . '/_core/auth.php';

cors_headers();
header('Cache-Control: no-store, no-cache, must-revalidate');

$db = get_db();
$m  = $_SERVER['REQUEST_METHOD'];

// Identify the voter: a logged-in user if a valid token is present, else the
// anonymous client token. Returns '' when neither is available.
function voter_key_from(?string $anon): string {
    $hdr = get_auth_header();
    if (str_starts_with($hdr, 'Bearer ')) {
        $p = jwt_verify(substr($hdr, 7));
        if ($p && isset($p['id'])) return 'u:' . (int)$p['id'];
    }
    $anon = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$anon);
    return $anon !== '' ? 'a:' . substr($anon, 0, 60) : '';
}

function vote_counts(PDO $db, array $ids): array {
    $out = [];
    if (!$ids) return $out;
    $ph = implode(',', array_fill(0, count($ids), '?'));
    $s  = $db->prepare("SELECT report_id, SUM(value=1) AS up, SUM(value=-1) AS down
                        FROM report_votes WHERE report_id IN ($ph) GROUP BY report_id");
    $s->execute($ids);
    foreach ($s->fetchAll() as $r) {
        $out[(int)$r['report_id']] = ['up' => (int)$r['up'], 'down' => (int)$r['down']];
    }
    return $out;
}

// ── GET /api/votes?ids=1,2,3&voter=token → { "1": {up,down,myVote}, ... } ──────
if ($m === 'GET') {
    $ids = array_values(array_filter(
        array_map('intval', explode(',', (string)($_GET['ids'] ?? ''))),
        fn($x) => $x > 0
    ));
    $vk   = voter_key_from($_GET['voter'] ?? '');
    $c    = vote_counts($db, $ids);
    $mine = [];
    if ($ids && $vk !== '') {
        $ph = implode(',', array_fill(0, count($ids), '?'));
        $s  = $db->prepare("SELECT report_id, value FROM report_votes WHERE voter_key=? AND report_id IN ($ph)");
        $s->execute(array_merge([$vk], $ids));
        foreach ($s->fetchAll() as $r) $mine[(int)$r['report_id']] = (int)$r['value'];
    }
    $resp = [];
    foreach ($ids as $id) {
        $resp[(string)$id] = [
            'up'     => $c[$id]['up']   ?? 0,
            'down'   => $c[$id]['down'] ?? 0,
            'myVote' => $mine[$id]      ?? 0,
        ];
    }
    json_out($resp);
}

// ── POST /api/votes  { reportId, value: 1|-1|0, voter } ───────────────────────
if ($m === 'POST') {
    $b   = body();
    $rid = (int)($b['reportId'] ?? 0);
    $val = (int)($b['value'] ?? 0);
    $vk  = voter_key_from($b['voter'] ?? '');
    if (!$rid)                          json_error('reportId required', 400);
    if ($vk === '')                     json_error('voter required', 400);
    if (!in_array($val, [1, -1, 0], true)) json_error('value must be 1, -1 or 0', 400);

    $chk = $db->prepare('SELECT id FROM reports WHERE id=?');
    $chk->execute([$rid]);
    if (!$chk->fetch()) json_error('Report not found', 404);

    if ($val === 0) {
        $db->prepare('DELETE FROM report_votes WHERE report_id=? AND voter_key=?')->execute([$rid, $vk]);
    } else {
        $db->prepare('INSERT INTO report_votes (report_id, voter_key, value) VALUES (?,?,?)
                      ON DUPLICATE KEY UPDATE value = VALUES(value)')->execute([$rid, $vk, $val]);
    }
    $c = vote_counts($db, [$rid]);
    json_out([
        'reportId' => $rid,
        'up'       => $c[$rid]['up']   ?? 0,
        'down'     => $c[$rid]['down'] ?? 0,
        'myVote'   => $val,
    ]);
}

json_error('Method not allowed', 405);