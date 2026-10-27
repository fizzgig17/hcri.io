<?php
declare(strict_types=1);

// Private runtime (output-over-time) curves, one row per light, owned by the API token's user.
//
// A curve is a list of output readings taken at a fixed interval (for example a flashlight's lumens every 3 seconds
// for 30 minutes). These rows are NOT reports: they never appear on explore, search, profiles or any shared page, and
// nothing here is reachable without the owner's API token. Re-sending a curve with the same label replaces it.

const RUNTIME_MAX_PER_USER   = 2000;    // curves kept per account
const RUNTIME_MAX_PER_BATCH  = 500;     // curves per request
const RUNTIME_MAX_POINTS     = 100000;  // samples per curve (24 hours at one reading a second is 86,400)
const RUNTIME_MAX_TOTAL_POINTS = 6000000; // samples across all of one account's curves (about 40 MB of JSON)
const RUNTIME_LIST_POINTS    = 5000;    // longest curve the website list and shared pages draw; longer ones are averaged down to this
const RUNTIME_MIN_POINTS     = 2;

function runtime_curves_ensure(PDO $db): void {
    static $done = false;
    if ($done) return;
    $done = true;
    $cols = 'user_id     INT NOT NULL,
            curve_id    VARCHAR(64) NOT NULL,
            label       VARCHAR(160) NOT NULL,
            group_name  VARCHAR(80) NOT NULL DEFAULT \'\',
            unit        VARCHAR(16) NOT NULL DEFAULT \'\',
            interval_s  DOUBLE NOT NULL,
            points      INT NOT NULL,
            created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            payload     MEDIUMTEXT NOT NULL,
            PRIMARY KEY (user_id, curve_id),
            KEY idx_user_group (user_id, group_name, label)';
    try {
        try { $db->exec("CREATE TABLE IF NOT EXISTS runtime_curves ($cols, CONSTRAINT fk_rc_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE)"); }
        catch (\Throwable $e) { $db->exec("CREATE TABLE IF NOT EXISTS runtime_curves ($cols)"); }
    } catch (\Throwable $e) { /* no CREATE privilege: run sql/runtime_curves.sql */ }
    // Share link: a curve is private until its owner shares it; the token is what the share/compare links carry.
    try {
        if (!$db->query("SHOW COLUMNS FROM runtime_curves LIKE 'share_token'")->fetch()) {
            $db->exec('ALTER TABLE runtime_curves ADD COLUMN share_token VARCHAR(32) NULL');
            $db->exec('ALTER TABLE runtime_curves ADD UNIQUE KEY uq_rc_share (share_token)');
        }
    } catch (\Throwable $e) { /* run sql/runtime_curves.sql */ }
    // Older installs: add the optional meter-reading column.
    try {
        if (!$db->query("SHOW COLUMNS FROM runtime_curves LIKE 'meta'")->fetch()) $db->exec('ALTER TABLE runtime_curves ADD COLUMN meta TEXT NULL');
    } catch (\Throwable $e) { /* run sql/runtime_curves.sql */ }
}

/** Optional meter readings kept with a curve. Unknown keys and non-numeric values are dropped. */
function runtime_meta_clean(mixed $m): array {
    $ranges = ['cct' => [500, 50000], 'duv' => [-0.2, 0.2], 'cri' => [-100, 120], 'r9' => [-300, 120], 'r12' => [-300, 120],
               'rf' => [0, 120], 'rg' => [0, 200], 'tempF' => [-50, 1000]];
    $out = [];
    if (!is_array($m)) return $out;
    foreach ($ranges as $k => [$lo, $hi]) {
        if (isset($m[$k]) && is_numeric($m[$k]) && (float)$m[$k] >= $lo && (float)$m[$k] <= $hi) $out[$k] = $m[$k] + 0;
    }
    return $out;
}

/** Stable id for a label: a short readable slug plus a hash, so the same label always maps to the same row. */
function runtime_curve_id(string $label): string {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $label) ?? '', '-'));
    return substr($slug, 0, 40) . '-' . substr(sha1(mb_strtolower(trim($label), 'UTF-8')), 0, 10);
}

function runtime_curve_valid_id(mixed $id): bool {
    return is_string($id) && preg_match('/^[a-z0-9-]{1,64}$/', $id) === 1;
}

/**
 * Checks one curve from a request and returns it in storage form, or a string describing what is wrong.
 * Input keys: label, group (optional), unit (optional), intervalSeconds, values (list of numbers).
 * @return array{label:string,group:string,unit:string,interval:float,values:array<int,int|float>}|string
 */
function runtime_curve_normalize(mixed $it): array|string {
    if (!is_array($it)) return 'not an object';
    $label = trim((string)($it['label'] ?? ''));
    if ($label === '' || mb_strlen($label, 'UTF-8') > 160) return 'label is required (max 160 characters)';
    $interval = $it['intervalSeconds'] ?? null;
    if (!is_numeric($interval) || (float)$interval < 0.01 || (float)$interval > 3600) return 'intervalSeconds must be between 0.01 and 3600';
    $vals = $it['values'] ?? null;
    if (!is_array($vals) || !array_is_list($vals)) return 'values must be a list of numbers';
    $n = count($vals);
    if ($n < RUNTIME_MIN_POINTS || $n > RUNTIME_MAX_POINTS) return 'values needs between ' . RUNTIME_MIN_POINTS . ' and ' . RUNTIME_MAX_POINTS . ' numbers';
    $out = [];
    foreach ($vals as $v) {
        if (!is_int($v) && !is_float($v)) {
            if (!is_string($v) || !is_numeric($v)) return 'values must all be numbers';
            $v = $v + 0;
        }
        if (is_float($v) && (is_nan($v) || is_infinite($v))) return 'values must all be finite numbers';
        $out[] = $v;
    }
    return [
        'label'    => $label,
        'group'    => mb_substr(trim((string)($it['group'] ?? '')), 0, 80, 'UTF-8'),
        'unit'     => mb_substr(trim((string)($it['unit'] ?? '')), 0, 16, 'UTF-8'),
        'interval' => (float)$interval,
        'values'   => $out,
        'meta'     => runtime_meta_clean($it['meta'] ?? null),
    ];
}

/**
 * Reads a wide CSV: the first column is time in minutes, every other column is one light (the header is its label).
 * Optional rows right under the header start with "#" and give per-light info: #group, #unit, #cct, #duv, #cri, #r9, #r12, #rf, #rg, #tempF.
 * Blank cells at the end of a column are ignored. The interval is the median gap between times.
 * @return array{items:array<int,array>,error:?string}
 */
function runtime_curves_from_csv(string $csv, string $group = '', string $unit = ''): array {
    $csv = preg_replace('/^\xEF\xBB\xBF/', '', $csv) ?? $csv;
    $lines = preg_split('/\r\n|\n|\r/', trim($csv)) ?: [];
    if (count($lines) < 1 + RUNTIME_MIN_POINTS) return ['items' => [], 'error' => 'The CSV needs a header row and at least ' . RUNTIME_MIN_POINTS . ' data rows'];
    $head = str_getcsv(array_shift($lines), ',', '"', '');
    if (count($head) < 2) return ['items' => [], 'error' => 'The CSV needs a time column and at least one light column'];
    $times = [];
    $cols = array_fill(1, count($head) - 1, []);
    $info = []; // per-light info rows: a first cell like "#group", "#unit", "#cct", "#duv", "#cri", "#r9", "#r12", "#rf", "#rg", "#tempF"
    foreach ($lines as $ln) {
        if (trim($ln) === '') continue;
        $row = str_getcsv($ln, ',', '"', '');
        if (isset($row[0]) && str_starts_with(trim((string)$row[0]), '#')) {
            $k = strtolower(trim(substr(trim((string)$row[0]), 1)));
            if ($k === 'tempf' || $k === 'temp_f') $k = 'tempF';
            for ($c = 1; $c < count($head); $c++) if (isset($row[$c]) && trim((string)$row[$c]) !== '') $info[$c][$k] = trim((string)$row[$c]);
            continue;
        }
        if (!isset($row[0]) || !is_numeric($row[0])) return ['items' => [], 'error' => 'The first column must be time in minutes (numbers)'];
        $times[] = (float)$row[0];
        for ($c = 1; $c < count($head); $c++) $cols[$c][] = $row[$c] ?? '';
    }
    $gaps = [];
    for ($i = 1; $i < count($times); $i++) if ($times[$i] > $times[$i - 1]) $gaps[] = $times[$i] - $times[$i - 1];
    if (!$gaps) return ['items' => [], 'error' => 'The time column must increase'];
    sort($gaps);
    $interval = $gaps[intdiv(count($gaps), 2)] * 60.0;
    $items = [];
    for ($c = 1; $c < count($head); $c++) {
        $label = trim((string)$head[$c]);
        if ($label === '') continue;
        $vals = $cols[$c];
        while ($vals && trim((string)end($vals)) === '') array_pop($vals);
        $i = $info[$c] ?? [];
        $meta = [];
        foreach (['cct', 'duv', 'cri', 'r9', 'r12', 'rf', 'rg', 'tempF'] as $mk) if (isset($i[$mk])) $meta[$mk] = $i[$mk];
        $items[] = ['label' => $label, 'group' => $i['group'] ?? $group, 'unit' => $i['unit'] ?? $unit, 'intervalSeconds' => round($interval, 3), 'values' => $vals, 'meta' => $meta];
    }
    return ['items' => $items, 'error' => null];
}

/** A fresh unused share token (16 hex characters, same shape as report share tokens). */
function runtime_new_share_token(PDO $db): string {
    $exists = $db->prepare('SELECT 1 FROM runtime_curves WHERE share_token = ?');
    do {
        $t = bin2hex(random_bytes(8));
        $exists->execute([$t]);
    } while ($exists->fetchColumn());
    return $t;
}

function runtime_valid_share_token(mixed $t): bool {
    return is_string($t) && preg_match('/^[a-f0-9]{16}$/', $t) === 1;
}

/**
 * Drops the near-dark readings at the start of a curve (before the light came on): everything before the output first reaches
 * 2 percent of the curve's peak, keeping about one second of lead-in. Same rule the Companion app applies when a run is stopped.
 * @param array<int,int|float> $vals
 * @return array<int,int|float> the same list when there is nothing to trim
 */
function runtime_trim_leading(array $vals, float $interval): array {
    if (count($vals) < 2) return $vals;
    $peak = max($vals);
    if (!($peak > 0)) return $vals;
    $first = null;
    foreach ($vals as $i => $v) { if ($v >= $peak * 0.02) { $first = $i; break; } }
    if ($first === null || $first <= 0) return $vals;
    $keep = (int)ceil(1.0 / max(0.01, $interval));
    $start = max(0, $first - $keep);
    if ($start <= 0 || count($vals) - $start < RUNTIME_MIN_POINTS) return $vals;
    return array_values(array_slice($vals, $start));
}

/**
 * Averages a long curve down to at most $max points for drawing. Returns [values, intervalSeconds]; the curve is unchanged when it
 * already fits. The stored curve and GET ?id=<id> keep every point.
 * @param array<int,int|float> $vals
 * @return array{0:array<int,int|float>,1:float}
 */
function runtime_downsample(array $vals, float $interval, int $max = RUNTIME_LIST_POINTS): array {
    $n = count($vals);
    if ($n <= $max) return [$vals, $interval];
    $k = (int)ceil($n / $max);
    $out = [];
    for ($i = 0; $i < $n; $i += $k) {
        $chunk = array_slice($vals, $i, $k);
        $out[] = round(array_sum($chunk) / count($chunk), 2);
    }
    return [$out, $interval * $k];
}
