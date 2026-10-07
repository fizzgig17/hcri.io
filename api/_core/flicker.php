<?php
declare(strict_types=1);

// api/_core/flicker.php -- shared helpers for flicker readings.
//
// Table: flicker_readings (see sql/flicker_readings.sql). Created lazily the
// first time any flicker endpoint runs, so deploying needs no manual
// migration. The foreign keys are attempted first and dropped if the server
// refuses them (e.g. a non-InnoDB reports table); every query below copes
// with a dangling report_id by LEFT JOINing reports.

function ensure_flicker_schema(PDO $db): void {
    static $done = false;
    if ($done) return;
    $cols = "
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL,
      report_id       INT NULL,
      label           VARCHAR(255) NOT NULL DEFAULT '',
      notes           TEXT,
      model           VARCHAR(255),
      frequency_hz    FLOAT,
      percent_flicker FLOAT,
      flicker_index   FLOAT,
      cycle_ms        FLOAT,
      span_ms         FLOAT NULL,
      waveform        MEDIUMTEXT,
      settings        TEXT,
      captured_at     DATETIME NULL,
      created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_flicker_user (user_id),
      INDEX idx_flicker_report (report_id)";
    $tail = ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS flicker_readings ($cols,
          FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
          FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL $tail");
    } catch (\Throwable $e) {
        $db->exec("CREATE TABLE IF NOT EXISTS flicker_readings ($cols $tail");
    }
    $done = true;
}

/** One row -> API shape. The (large) waveform is only included when asked for. */
function flicker_out(array $r, bool $withWave): array {
    $out = [
        'id'             => (int)$r['id'],
        'reportId'       => isset($r['report_exists']) ? ($r['report_exists'] ? (int)$r['report_id'] : null)
                                                       : ($r['report_id'] !== null ? (int)$r['report_id'] : null),
        'reportLabel'    => $r['report_label'] ?? null,
        'label'          => (string)$r['label'],
        'notes'          => (string)($r['notes'] ?? ''),
        'model'          => $r['model'] ?? null,
        'frequencyHz'    => $r['frequency_hz']    !== null ? (float)$r['frequency_hz']    : null,
        'percentFlicker' => $r['percent_flicker'] !== null ? (float)$r['percent_flicker'] : null,
        'flickerIndex'   => $r['flicker_index']   !== null ? (float)$r['flicker_index']   : null,
        'cycleMs'        => $r['cycle_ms']        !== null ? (float)$r['cycle_ms']        : null,
        'spanMs'         => $r['span_ms']         !== null ? (float)$r['span_ms']         : null,
        'capturedAt'     => $r['captured_at'] ?? null,
        'createdAt'      => $r['created_at'] ?? null,
        'settings'       => !empty($r['settings']) ? (json_decode($r['settings'], true) ?: null) : null,
    ];
    if ($withWave) {
        $w = !empty($r['waveform']) ? json_decode($r['waveform'], true) : null;
        $out['waveform'] = is_array($w) ? array_map('floatval', $w) : [];
    }
    return $out;
}

/** Common SELECT (with the owning report's title, if any). */
function flicker_select_sql(bool $withWave): string {
    $wave = $withWave ? ', f.waveform' : '';
    return "SELECT f.id, f.user_id, f.report_id, f.label, f.notes, f.model, f.frequency_hz, f.percent_flicker,
                   f.flicker_index, f.cycle_ms, f.span_ms, f.settings, f.captured_at, f.created_at $wave,
                   r.label AS report_label, (r.id IS NOT NULL) AS report_exists
              FROM flicker_readings f LEFT JOIN reports r ON r.id = f.report_id";
}

/** Validates + normalises a POST/PATCH payload's numbers and waveform. Throws InvalidArgumentException. */
function flicker_clean_payload(array $b, bool $requireWave): array {
    $num = function ($k, $max = 1e9) use ($b) {
        if (!isset($b[$k]) || $b[$k] === '' || $b[$k] === null) return null;
        if (!is_numeric($b[$k])) throw new InvalidArgumentException("$k must be a number");
        $v = (float)$b[$k];
        if (!is_finite($v) || abs($v) > $max) throw new InvalidArgumentException("$k is out of range");
        return $v;
    };
    $out = [
        'frequency_hz'    => $num('frequencyHz', 1e6),
        'percent_flicker' => $num('percentFlicker', 1000),
        'flicker_index'   => $num('flickerIndex', 1000),
        'cycle_ms'        => $num('cycleMs', 1e7),
        'span_ms'         => $num('spanMs', 1e9),
        'waveform'        => null,
    ];
    if (isset($b['waveform'])) {
        $w = $b['waveform'];
        if (!is_array($w) || count($w) < 2 || count($w) > 4000) throw new InvalidArgumentException('waveform must be an array of 2-4000 numbers');
        $clean = [];
        foreach ($w as $v) {
            if (!is_numeric($v)) throw new InvalidArgumentException('waveform must contain only numbers');
            $clean[] = round((float)$v, 2);
        }
        $out['waveform'] = json_encode($clean);
    } elseif ($requireWave) {
        throw new InvalidArgumentException('waveform is required');
    }
    return $out;
}

/** May this viewer see flicker readings attached to $reportId? Owner, super admin, public report, or a matching share token. */
function flicker_can_view_report(PDO $db, int $reportId, int $myId, string $shareTok): bool {
    $isSuper = false;
    if ($myId > 0) {
        try { $q = $db->prepare('SELECT is_super_admin FROM users WHERE id=?'); $q->execute([$myId]); $isSuper = ((int)$q->fetchColumn()) === 1; } catch (\Throwable $e) {}
    }
    if ($isSuper) return true;
    $s = $db->prepare('SELECT 1 FROM reports WHERE id=? AND (is_public=1 OR user_id=? OR (share_token IS NOT NULL AND share_token=?))');
    $s->execute([$reportId, $myId, $shareTok]);
    return (bool)$s->fetchColumn();
}
