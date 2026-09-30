<?php
declare(strict_types=1);

function extract_pdf(string $path): array {
    $text = pdf_to_text($path);
    $result = ['text' => $text, 'spd' => null, 'metrics' => []];

    // Strategy 1: wavelength/value table
    preg_match_all('/\b(3[89]\d|[4-7]\d{2}|780)\s+(\d+\.?\d*)\b/', $text, $m, PREG_SET_ORDER);
    $wlMap = [];
    foreach ($m as $match) {
        $wl = (int)$match[1]; $val = (float)$match[2];
        if ($wl >= 380 && $wl <= 780 && !isset($wlMap[$wl])) $wlMap[$wl] = $val;
    }
    if (count($wlMap) >= 20) {
        ksort($wlMap);
        $wls = array_keys($wlMap); $vals = array_values($wlMap);
        $max = max($vals);
        $result['spd'] = ['wls' => $wls, 'vals' => array_map(fn($v) => $v / $max, $vals)];
    }

    // Strategy 2: key metrics
    $metrics = [];
    if (preg_match('/CCT\s*[:\s]\s*(\d{3,5})\s*K/i', $text, $mm)) $metrics['cct'] = (int)$mm[1];
    if (preg_match('/R_?f\s*[:\s]\s*(\d{1,3})/i', $text, $mm))     $metrics['rf']  = (int)$mm[1];
    if (preg_match('/R_?g\s*[:\s]\s*(\d{1,3})/i', $text, $mm))     $metrics['rg']  = (int)$mm[1];
    if (preg_match('/Duv\s*[:\s]\s*([+-]?\d*\.?\d+)/i', $text, $mm)) $metrics['duv'] = (float)$mm[1];
    $result['metrics'] = $metrics;
    return $result;
}

function pdf_to_text(string $path): string {
    if (@shell_exec('which pdftotext 2>/dev/null')) {
        $out = shell_exec('pdftotext ' . escapeshellarg($path) . ' - 2>/dev/null');
        if ($out && strlen($out) > 20) return $out;
    }
    // Fallback: raw stream scan
    $raw = file_get_contents($path);
    preg_match_all('/BT\s*(.*?)\s*ET/s', $raw, $m);
    $text = '';
    foreach ($m[1] as $block) {
        preg_match_all('/\(((?:[^()\\\\]|\\\\.)*)\)\s*Tj/', $block, $tj);
        $text .= implode(' ', $tj[1]) . "\n";
    }
    return $text;
}
