<?php
// api/_core/tm30_pdf_builder.php
/**
 * Shared TM-30 PDF builder — used by both reports_pdf.php and guest_pdf.php
 * Produces a full IES TM-30-18 layout matching the on-screen report.
 *
 * Usage:
 *   require_once __DIR__ . '/tm30_pdf_builder.php';
 *   $pdf = build_tm30_report($row, $rfBins, $wls, $vals);           // light (default)
 *   $pdf = build_tm30_report($row, $rfBins, $wls, $vals, 'dark');   // dark
 *   $pdf->Output('D', 'report_TM30.pdf');
 */

declare(strict_types=1);

// Convert UTF-8 string to Latin-1 for FPDF (which uses ISO-8859-1 internally)
function pdf_str(string $s): string {
    if (function_exists('iconv')) {
        return iconv('UTF-8', 'ISO-8859-1//TRANSLIT//IGNORE', $s) ?: $s;
    }
    return mb_convert_encoding($s, 'ISO-8859-1', 'UTF-8');
}

if (!defined('FPDF_FONTPATH')) {
    define('FPDF_FONTPATH', __DIR__ . '/../../vendor/fpdf/font/');
}
require_once __DIR__ . '/../../vendor/fpdf/fpdf.php';
// blackbody_spd/daylight_spd/interpolate_spd/strip_trailing_blocks + CMF_Y.
// Shared with the analysis path so the PDF's reference curve cannot drift from it.
require_once __DIR__ . '/spd.php';

/**
 * TM-30-18 reference illuminant at 5 nm, 380-780 nm (81 values):
 * Planckian below 4000 K, CIE daylight above 5000 K, and a normalised blend
 * between. Mirrors calc_rf_rg() in spd.php and __refVal() in the frontend.
 */
function tm30_reference_spd(float $cct): array {
    $T = max(1667.0, min(25000.0, $cct));
    if ($T <= 4000.0) return blackbody_spd($T);
    if ($T >= 5000.0) return daylight_spd($T);
    $p = blackbody_spd($T); $d = daylight_spd($T); $i560 = 36;
    $pn = $p[$i560] > 0 ? array_map(fn($v) => $v / $p[$i560], $p) : $p;
    $dn = $d[$i560] > 0 ? array_map(fn($v) => $v / $d[$i560], $d) : $d;
    $w  = ($T - 4000.0) / 1000.0;
    $out = [];
    for ($k = 0; $k < 81; $k++) $out[$k] = (1.0 - $w) * $pn[$k] + $w * $dn[$k];
    return $out;
}

// ── Theme ──────────────────────────────────────────────────────────────────────
/**
 * Every colour the builder draws with, in one place. 'light' reproduces the
 * original hardcoded palette exactly, so existing callers are unaffected.
 *
 * Blend bases matter more than they look. FPDF has no alpha channel, so the
 * spectrum fill, the CVG hue wedges and the CVG polygon fill are all
 * pre-composited against whatever sits behind them. Those bases have to track
 * the background or the shapes read as film over the wrong colour.
 */
function tm30_theme(string $name): array {
    $light = [
        'paintPage'   => false,                  // FPDF pages are already white
        'page'        => [255,255,255],
        'headerBar'   => [12,20,36],
        'headerRule'  => null,
        'headerText'  => [200,230,255],
        'headerSub'   => [80,140,180],
        'footerText'  => [160,160,160],
        'footerNote'  => [150,150,150],
        'body'        => [0,0,0],
        'sheadFill'   => [224,236,248],
        'sheadText'   => [20,60,110],
        'panelFill'   => [248,250,252],
        'panelLine'   => [190,210,225],
        'grid'        => [215,225,235],
        'tickText'    => [130,150,165],
        'axisText'    => [80,100,120],
        'spdAxis'     => [100,120,140],           // SPD x-axis caption only
        'infoFill'    => [230,238,248],
        'infoLine'    => [180,200,220],
        'infoLabel'   => [60,100,140],
        'spdBase'     => [185,185,185],           // spectrum fill blends to this
        'spdMix'      => 0.50,
        'testCurve'   => [200,30,30],
        'refCurve'    => [130,130,130],
        'refLegend'   => [100,100,100],
        'chartTitle'  => [30,60,100],
        'zeroLine'    => [100,120,140],
        'wedgeBase'   => [170,170,170],           // CVG wedges blend to this
        'wedgeMix'    => 0.45,
        'wheelInner'  => [248,249,252],
        'ringMinor'   => [180,190,210],
        'ringMajor'   => [30,30,30],
        'radial'      => [200,210,220],
        'polyFill'    => [245,225,228],           // polyLine over wheelInner
        'polyLine'    => [190,25,25],
        'polyDot'     => [170,15,15],
        'arrow'       => [30,60,150],
        'refRing'     => [20,20,20],
        'binNum'      => [20,20,20],
        'muted'       => [150,150,150],
        'good'        => [40,140,60],
        'warn'        => [180,120,20],
        'bad'         => [160,40,40],
        'neutral'     => [24,95,165],
        'violet'      => [83,58,183],
        'rfLabel'     => [60,80,110],
        'metricFill'  => [235,242,252],
        'metricLine'  => [190,210,230],
        'metricLabel' => [50,90,140],
        'subLabel'    => [50,50,50],
        'strong'      => [10,10,10],
        'boxLine'     => [170,195,220],
        // The original set (30,50,80) once and let every Cell in the bottom
        // block inherit it, so all three keys share that value in light.
        'botHead'     => [30,50,80],
        'botText'     => [30,50,80],
        'botValue'    => [30,50,80],
        'hueLo'       => 30,                      // tm30_hue2rgb clamp
        'hueHi'       => 240,
    ];

    if ($name !== 'dark') return $light;

    return array_replace($light, [
        'paintPage'   => true,
        'page'        => [11,16,26],
        'headerBar'   => [20,30,48],
        'headerRule'  => [45,70,105],
        'headerText'  => [214,234,255],
        'headerSub'   => [120,165,205],
        'footerText'  => [125,140,160],
        'footerNote'  => [105,120,142],
        'body'        => [228,236,246],
        'sheadFill'   => [24,36,54],
        'sheadText'   => [150,196,240],
        'panelFill'   => [17,25,38],
        'panelLine'   => [58,78,104],
        'grid'        => [42,57,78],
        'tickText'    => [118,138,162],
        'axisText'    => [120,142,168],
        'spdAxis'     => [130,150,178],
        'infoFill'    => [21,31,47],
        'infoLine'    => [54,74,100],
        'infoLabel'   => [124,166,208],
        'spdBase'     => [26,34,50],
        'spdMix'      => 0.72,                    // keep the spectrum vivid
        'testCurve'   => [255,96,84],
        'refCurve'    => [148,160,180],
        'refLegend'   => [150,164,186],
        'chartTitle'  => [148,192,236],
        'zeroLine'    => [126,148,176],
        'wedgeBase'   => [52,66,88],
        'wedgeMix'    => 0.52,
        'wheelInner'  => [14,20,32],
        'ringMinor'   => [52,70,94],
        'ringMajor'   => [214,226,242],
        'radial'      => [46,62,84],
        'polyFill'    => [38,27,36],              // ~10% polyLine over wheelInner
        'polyLine'    => [255,98,86],
        'polyDot'     => [255,112,98],
        'arrow'       => [108,158,255],
        'refRing'     => [222,232,246],
        'binNum'      => [198,214,236],
        'muted'       => [128,144,166],
        'good'        => [78,208,112],
        'warn'        => [240,182,64],
        'bad'         => [255,104,92],
        'neutral'     => [108,166,255],
        'violet'      => [160,140,255],
        'rfLabel'     => [138,164,198],
        'metricFill'  => [21,31,47],
        'metricLine'  => [56,76,102],
        'metricLabel' => [128,174,224],
        'subLabel'    => [148,164,190],
        'strong'      => [232,238,248],
        'boxLine'     => [56,76,102],
        'botHead'     => [150,196,240],
        'botText'     => [200,212,228],
        'botValue'    => [232,238,248],
        'hueLo'       => 55,                      // keep blue bins legible
        'hueHi'       => 250,
    ]);
}

/**
 * Composite $rgb over $base at weight $mix. FPDF has no alpha channel.
 * Truncates rather than rounds, matching the original inline arithmetic exactly
 * so the light theme stays byte-for-byte what it was.
 */
function tm30_blend(array $rgb, array $base, float $mix): array {
    $out = [];
    for ($i = 0; $i < 3; $i++) {
        $out[$i] = max(0, min(255, (int)($base[$i] + ($rgb[$i] - $base[$i]) * $mix)));
    }
    return $out;
}

// ── Colour helpers ─────────────────────────────────────────────────────────────
function tm30_wl2rgb(float $wl): array {
    if ($wl < 380) return [80,0,130];
    if ($wl < 440) { $t=($wl-380)/60; return [0,0,min(255,(int)(130+125*$t))]; }
    if ($wl < 490) { $t=($wl-440)/50; return [0,(int)(255*$t),255]; }
    if ($wl < 510) { $t=($wl-490)/20; return [0,255,(int)(255*(1-$t))]; }
    if ($wl < 580) { $t=($wl-510)/70; return [(int)(255*$t),(int)(255*(1-$t*0.2)),0]; }
    if ($wl < 645) { $t=($wl-580)/65; return [255,(int)(180*(1-$t)),0]; }
    if ($wl<=780)  { $t=($wl-645)/135;return [(int)(255*(1-$t*0.3)),0,0]; }
    return [80,0,0];
}

// Clamp bounds are theme-driven: the dark report lifts the floor so the blue
// hue bins stay legible against a dark panel.
function tm30_hue2rgb(float $h, int $lo = 30, int $hi = 240): array {
    $r=128+127*cos(deg2rad($h)); $g=128+127*cos(deg2rad($h-120)); $b=128+127*cos(deg2rad($h+120));
    return [max($lo,min($hi,(int)$r)),max($lo,min($hi,(int)$g)),max($lo,min($hi,(int)$b))];
}

// ── PDF class ───────────────────────────────────────────────────────────────────
class TM30ReportPDF extends FPDF {
    public string $reportTitle = '';
    public array  $th = [];

    // Public wrappers for protected FPDF internals
    public function out(string $s): void   { $this->_out($s); }
    public function getK(): float          { return $this->k; }
    public function getH(): float          { return $this->h; }

    function Header(): void {
        $T = $this->th;
        // The page background has to go down before anything else on the page.
        // Auto page break re-enters Header(), so wrapped pages stay dark too.
        // Uses $this->w/$this->h rather than 210x297 so a landscape or Letter
        // variant does not leave an unpainted strip on two edges.
        if ($T['paintPage']) {
            $this->SetFillColor(...$T['page']);
            $this->Rect(0,0,$this->w,$this->h,'F');
        }
        $this->SetFillColor(...$T['headerBar']);
        $this->Rect(0,0,210,16,'F');
        if ($T['headerRule']) {
            // The dark bar is close to the page colour; this separates them.
            $this->SetFillColor(...$T['headerRule']);
            $this->Rect(0,15.6,210,0.4,'F');
        }
        $this->SetFont('Arial','B',11);
        $this->SetTextColor(...$T['headerText']);
        $this->SetXY(8,3);
        $this->Cell(130,10,'IES TM-30-18 Color Rendition Report',0,0,'L');
        $this->SetFont('Arial','',8);
        $this->SetTextColor(...$T['headerSub']);
        $this->SetXY(130,3);
        $this->Cell(72,10,mb_substr($this->reportTitle,0,38),0,0,'R');
        $this->SetTextColor(...$T['body']);
        $this->Ln(18);
    }

    function Footer(): void {
        $T = $this->th;
        $this->SetY(-13);
        $this->SetFont('Arial','I',7);
        $this->SetTextColor(...$T['footerText']);
        // pdf_str(): the middle dots are U+00B7 and FPDF is Latin-1.
        $this->Cell(0,5,pdf_str('Generated '.date('Y-m-d H:i').' · hCRI.io · Colors are for visual orientation purposes only.'),0,0,'C');
        $this->SetY(-8.5);
        $this->SetFont('Arial','',5.5);
        $this->SetTextColor(...$T['footerNote']);
        $this->Cell(0,4,pdf_str('Color vector graphic revised 2026-08: the polygon now plots chroma and hue shift per TM-30-18. '
            .'Reports generated before this date plotted local colour fidelity and are not directly comparable.'),0,0,'C');
        $this->SetTextColor(...$T['body']);
    }

    function SHead(string $t): void {
        $T = $this->th;
        $this->SetFont('Arial','B',8);
        $this->SetFillColor(...$T['sheadFill']);
        $this->SetTextColor(...$T['sheadText']);
        $this->Cell(0,5,'  '.$t,0,1,'L',true);
        $this->SetTextColor(...$T['body']);
        $this->Ln(1);
    }

    // Draw circle
    function Circ(float $x,float $y,float $r,string $s='D'): void {
        $op=$s==='F'?'f':($s==='FD'||$s==='DF'?'B':'S');
        $lx=4/3*(M_SQRT2-1)*$r;$k=$this->k;$h=$this->h;
        $this->_out(sprintf('%.2f %.2f m %.2f %.2f %.2f %.2f %.2f %.2f c',($x+$r)*$k,($h-$y)*$k,($x+$r)*$k,($h-($y-$lx))*$k,($x+$lx)*$k,($h-($y-$r))*$k,$x*$k,($h-($y-$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',($x-$lx)*$k,($h-($y-$r))*$k,($x-$r)*$k,($h-($y-$lx))*$k,($x-$r)*$k,($h-$y)*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',($x-$r)*$k,($h-($y+$lx))*$k,($x-$lx)*$k,($h-($y+$r))*$k,$x*$k,($h-($y+$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c %s',($x+$lx)*$k,($h-($y+$r))*$k,($x+$r)*$k,($h-($y+$lx))*$k,($x+$r)*$k,($h-$y)*$k,$op));
    }

    // Draw wedge for CVG hue sectors
    function Wedge(float $cx,float $cy,float $r,float $a1d,float $a2d,array $fill): void {
        $this->SetFillColor(...$fill);
        $steps=max(3,(int)ceil(abs($a2d-$a1d)/4));
        $k=$this->k; $h=$this->h;
        $s=sprintf('%.2f %.2f m',$cx*$k,($h-$cy)*$k);
        for($i=0;$i<=$steps;$i++){
            $a=deg2rad($a1d+($a2d-$a1d)*$i/$steps);
            $s.=sprintf(' %.2f %.2f l',($cx+$r*cos($a))*$k,($h-($cy-$r*sin($a)))*$k);
        }
        $this->_out($s.' f');
    }
}

// ── Main builder function ───────────────────────────────────────────────────────
function build_tm30_report(array $row, array $rfBins, ?array $wls, ?array $vals, string $theme = 'light'): TM30ReportPDF {

    $T = tm30_theme($theme);
    $hueLo = $T['hueLo']; $hueHi = $T['hueHi'];

    $pdf = new TM30ReportPDF('P','mm','A4');
    // Must be assigned before AddPage(): AddPage() calls Header(), which paints
    // the page background from the theme.
    $pdf->th = $T;
    $pdf->reportTitle = pdf_str($row['label'] ?? '');
    $pdf->SetMargins(8,8,8);
    $pdf->SetAutoPageBreak(true, 16);   // taller footer (revision note)
    $pdf->AddPage();

    // Extract values
    $Rf  = $row['rf']    !== null ? (int)$row['rf']    : null;
    $Rg  = $row['rg']    !== null ? (int)$row['rg']    : null;
    $cct = $row['cct']   !== null ? (int)$row['cct']   : null;
    $duv = $row['duv']   !== null ? (float)$row['duv'] : null;
    $cx  = $row['cie_x'] !== null ? (float)$row['cie_x'] : null;
    $cy2 = $row['cie_y'] !== null ? (float)$row['cie_y'] : null;
    $meta = json_decode($row['meta'] ?: '{}', true) ?? [];
    $Ra  = $meta['ra']   ?? null;
    $R9  = $meta['r9']   ?? null;

    // Real per-bin shifts and per-CES fidelity. These are computed by
    // calc_rf_rg() and stored in meta; previously the charts below faked them
    // from $rfBins. Fall back to zeros/interpolation only for legacy rows.
    $pick = function($key) use ($meta, $row) {
        $v = $meta[$key] ?? ($row[$key] ?? null);
        return is_array($v) ? array_values($v) : [];
    };
    $cvgTest   = $pick('cvgTest');
    $cvgRef    = $pick('cvgRef');
    $rcsBins   = $pick('rcsBins');
    $rhsBins   = $pick('rhsBins');
    $rfSamples = $pick('rfSamples');
    $sampleHues= $pick('sampleHues');
    if (count($rcsBins) !== 16) $rcsBins = array_fill(0, 16, 0.0);
    if (count($rhsBins) !== 16) $rhsBins = array_fill(0, 16, 0.0);

    // Multi-scan exports can wrap to a lower wavelength mid-file; every other
    // consumer scrubs that, the PDF path did not (produced a zigzag SPD curve).
    if ($wls && $vals) [$wls, $vals] = strip_trailing_blocks($wls, $vals);

    // ── 1. SOURCE INFO BAR ────────────────────────────────────────────────────
    $infoY = $pdf->GetY();
    $pdf->SetDrawColor(...$T['infoLine']); $pdf->SetLineWidth(0.2);
    $catList = function($kind) use ($row) {
        $c = $row['categories'][$kind] ?? null;
        if (!is_array($c) || !$c) return '';
        $vals = array_map(function($x){ return is_array($x) ? (string)($x['value'] ?? '') : (string)$x; }, $c);
        return implode(', ', array_filter($vals, 'strlen'));
    };
    $lightBits = array_filter([$catList('light_brand'), $catList('light_model')], 'strlen');
    $ledBits   = array_filter([$catList('led_brand'),   $catList('led_model')],   'strlen');
    $cols = [['Source', $row['label'] ?? '-']];
    if ($lightBits)          $cols[] = ['Light', implode(' ', $lightBits)];
    if ($ledBits)            $cols[] = ['LED',   implode(' ', $ledBits)];
    if ($catList('led_cct')) $cols[] = ['CCT',   $catList('led_cct')];
    if ($catList('optic'))   $cols[] = ['Optic', $catList('optic')];
    if ($catList('lumens'))  $cols[] = ['Lumens',  $catList('lumens')];
    if ($catList('current')) $cols[] = ['Current', $catList('current')];
    $cols[] = ['Date', date('m/d/Y', strtotime($row['created_at'] ?? 'now'))];

    $n   = count($cols);
    $gap = 0.5;
    $cw  = (194 - ($n - 1) * $gap) / $n;          // single row, x=8..202mm
    $maxc = max(6, (int)(($cw - 2) / 1.5));        // approx chars that fit at 8pt
    foreach ($cols as $i => [$k, $v]) {
        $v = (string)($v ?? '');
        if (mb_strlen($v) > $maxc) $v = mb_substr($v, 0, $maxc - 1) . '.';
        $x = 8 + $i * ($cw + $gap);
        $pdf->SetFillColor(...$T['infoFill']);
        $pdf->Rect($x, $infoY, $cw, 10, 'DF');
        $pdf->SetFont('Arial','B',6.5); $pdf->SetTextColor(...$T['infoLabel']);
        $pdf->SetXY($x+1, $infoY+1);   $pdf->Cell($cw-2,4,pdf_str(strtoupper((string)$k)),0,0,'L');
        $pdf->SetFont('Arial','',8);   $pdf->SetTextColor(...$T['strong']);
        $pdf->SetXY($x+1, $infoY+5.5); $pdf->Cell($cw-2,4,pdf_str($v),0,0,'L');
    }
    $pdf->SetXY(8, $infoY+12);

    // ── 2. SPD CHART (left) + 3 bar charts (right) ───────────────────────────
    $secY = $pdf->GetY();
    $lW=96; $rX=108; $rW=94;

    // SPD chart
    $pdf->SHead('Spectral Power Distribution');
    $cY=$pdf->GetY(); $cH=38;
    $pdf->SetFillColor(...$T['panelFill']); $pdf->SetDrawColor(...$T['panelLine']);
    $pdf->Rect(8,$cY,$lW,$cH,'DF');

    if($wls && $vals && max($vals) > 0){
        $maxV=max($vals); $minWl=min($wls); $span=max(1,max($wls)-$minWl);
        $pL=8+7; $pR=8+$lW-2; $pT=$cY+2; $pB=$cY+$cH-5;
        $cW2=$pR-$pL; $cH2=$pB-$pT;
        // Grid
        $pdf->SetDrawColor(...$T['grid']); $pdf->SetLineWidth(0.15);
        foreach([400,450,500,550,600,650,700,750] as $wl){
            $gx=$pL+(($wl-$minWl)/$span)*$cW2;
            if($gx<$pL||$gx>$pR) continue;
            $pdf->Line($gx,$pT,$gx,$pB);
            $pdf->SetFont('Arial','',5.5); $pdf->SetTextColor(...$T['tickText']);
            $pdf->SetXY($gx-4,$pB+0.5); $pdf->Cell(8,3,(string)$wl,0,0,'C');
        }
        // Fill
        foreach($wls as $i=>$wl){
            if($i===0) continue;
            $x1=$pL+(($wls[$i-1]-$minWl)/$span)*$cW2;
            $x2=$pL+(($wl-$minWl)/$span)*$cW2;
            $ah=(($vals[$i-1]+$vals[$i])/2/$maxV)*$cH2*0.9;
            $rgb=tm30_wl2rgb((int)(($wl+$wls[$i-1])/2));
            $pdf->SetFillColor(...tm30_blend($rgb,$T['spdBase'],$T['spdMix']));
            $pdf->Rect($x1,$pB-$ah,max(0.1,$x2-$x1),$ah,'F');
        }
        // Red test curve
        $pdf->SetDrawColor(...$T['testCurve']); $pdf->SetLineWidth(0.5);
        $first=true;
        foreach($wls as $i=>$wl){
            $px=$pL+(($wl-$minWl)/$span)*$cW2;
            $py=$pB-($vals[$i]/$maxV)*$cH2*0.9;
            $pdf->out(sprintf($first?'%.2f %.2f m':'%.2f %.2f l',$px*$pdf->getK(),($pdf->getH()-$py)*$pdf->getK()));
            $first=false;
        }
        $pdf->out('S');

        // Reference illuminant, flux-matched to the test source (the panel used
        // to draw a flat line here and label it "Reference").
        if ($cct !== null && $cct > 0) {
            $refSpd = tm30_reference_spd((float)$cct);
            $testG  = interpolate_spd($wls, $vals);       // test on the same 5nm grid
            $ft = 0.0; $fr = 0.0;
            for ($i = 0; $i < 81; $i++) {
                $ft += $testG[$i]  * CMF_Y[$i];
                $fr += $refSpd[$i] * CMF_Y[$i];
            }
            $sc = $fr > 0 ? $ft / $fr : 0.0;
            if ($sc > 0) {
                $pdf->SetDrawColor(...$T['refCurve']); $pdf->SetLineWidth(0.3);
                $pdf->out('[1.2 1.2] 0 d');               // dashed
                $started = false;
                for ($i = 0; $i < 81; $i++) {
                    $wl = 380 + $i * 5;
                    if ($wl < $minWl || $wl > $minWl + $span) continue;
                    $rx = $pL + (($wl - $minWl) / $span) * $cW2;
                    $ry = $pB - min(1.0, ($refSpd[$i] * $sc) / $maxV) * $cH2 * 0.9;
                    $pdf->out(sprintf('%.2f %.2f %s',
                        $rx * $pdf->getK(), ($pdf->getH() - $ry) * $pdf->getK(),
                        $started ? 'l' : 'm'));
                    $started = true;
                }
                if ($started) $pdf->out('S');
                $pdf->out('[] 0 d');                      // solid again
            }
        }
        // Legend
        $pdf->SetFont('Arial','',6); $pdf->SetTextColor(...$T['testCurve']);
        $pdf->SetXY($pL+3,$pT+1); $pdf->Cell(16,3,'- Test',0,0,'L');
        $pdf->SetTextColor(...$T['refLegend']);
        $pdf->SetXY($pL+20,$pT+1); $pdf->Cell(20,3,'--- Reference',0,0,'L');
        // X axis label
        $pdf->SetTextColor(...$T['spdAxis']); $pdf->SetFont('Arial','',6);
        $pdf->SetXY(8+1,$cY+$cH-3); $pdf->Cell($lW-2,3,'Wavelength (nm)',0,0,'C');
        $pdf->SetLineWidth(0.2);
    }

    // 3 right-side bar charts.
    // Axis maxima use the same "snap to 0.05 / snap to 5" rule as the on-screen
    // charts in assets/app.js, so PDF and screen share one scale.
    $barH = 11; $bw=$rW/16;
    $absMax = function(array $a): float {
        $m = 0.0; foreach($a as $v) $m = max($m, abs((float)$v)); return $m;
    };
    $csMax = max(0.10, ceil($absMax($rcsBins) / 0.05) * 0.05);   // fraction
    $hsMax = max(5.0,  ceil($absMax($rhsBins) / 5.0)  * 5.0);    // degrees
    $chartDefs = [
        ['LOCAL CHROMA SHIFT (Rcs,hj)', 'chroma',   $rcsBins, $csMax,
            [sprintf('+%d%%', (int)round($csMax*100)), '0%',
             sprintf('-%d%%', (int)round($csMax*100))]],
        ['LOCAL HUE SHIFT (Rhs,hj)',    'hue',      $rhsBins, $hsMax,
            ['+'.rtrim(rtrim(number_format($hsMax,1),'0'),'.').chr(176), '0',
             '-'.rtrim(rtrim(number_format($hsMax,1),'0'),'.').chr(176)]],
        ['LOCAL COLOR FIDELITY (Rf,hj)','fidelity', $rfBins,  100.0,
            ['100','50','0']],
    ];
    $bY = $secY;
    foreach($chartDefs as [$title,$mode,$data,$axisMax,$ylabels]){
        $pdf->SetXY($rX,$bY);
        $pdf->SetFont('Arial','B',6.5); $pdf->SetTextColor(...$T['chartTitle']);
        $pdf->Cell($rW,4,$title,0,1,'L');
        $bY2=$pdf->GetY();
        $pdf->SetDrawColor(...$T['panelLine']); $pdf->SetLineWidth(0.15);
        $pdf->Rect($rX,$bY2,$rW,$barH,'D');
        $zeroY=$bY2+$barH/2;

        if($mode==='fidelity'){
            // Grid lines
            foreach([25,50,75,100] as $pct){
                $gy=$bY2+$barH-(($pct/100)*$barH);
                $pdf->SetDrawColor(...$T['grid']);$pdf->Line($rX,$gy,$rX+$rW,$gy);
            }
            for($h=0;$h<16;$h++){
                $rb=min(100,max(0,(float)($data[$h]??75)));
                $bh=($rb/100)*$barH*0.92;
                [$r,$g,$b]=tm30_hue2rgb($h*22.5+11.25,$hueLo,$hueHi);
                $pdf->SetFillColor($r,$g,$b);
                $pdf->Rect($rX+$h*$bw+0.3,$bY2+$barH-$bh,$bw-0.6,$bh,'F');
                $pdf->SetFont('Arial','',4.5); $pdf->SetTextColor(...$T['strong']);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH-$bh-2.8);
                $pdf->Cell($bw,2.5,(string)(int)round($rb),0,0,'C');
                $pdf->SetTextColor(...$T['axisText']);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH+0.3);
                $pdf->Cell($bw,2,(string)($h+1),0,0,'C');
            }
        } else {
            // Zero line
            $pdf->SetDrawColor(...$T['zeroLine']); $pdf->SetLineWidth(0.4);
            $pdf->Line($rX,$zeroY,$rX+$rW,$zeroY); $pdf->SetLineWidth(0.15);
            for($h=0;$h<16;$h++){
                // Real Rcs,hj (fraction) / Rhs,hj (degrees) for this bin.
                $val   = (float)($data[$h] ?? 0.0);
                $frac  = $axisMax > 0 ? max(-1.0, min(1.0, $val/$axisMax)) : 0.0;
                $barPx = abs($frac) * ($barH/2) * 0.92;
                [$r,$g,$b]=tm30_hue2rgb($h*22.5+11.25,$hueLo,$hueHi);
                $pdf->SetFillColor($r,$g,$b);
                if($frac>=0) $pdf->Rect($rX+$h*$bw+0.3,$zeroY-$barPx,$bw-0.6,$barPx,'F');
                else         $pdf->Rect($rX+$h*$bw+0.3,$zeroY,$bw-0.6,$barPx,'F');
                // Suppress near-zero labels, as the on-screen charts do.
                $lbl = '';
                if($mode==='chroma'){
                    $pct=(int)round($val*100);
                    if(abs($pct)>=2) $lbl=($pct>0?'+':'').$pct.'%';
                } else {
                    if(abs($val)>=0.5) $lbl=($val>0?'+':'').number_format($val,1).chr(176);
                }
                if($lbl!==''){
                    $pdf->SetFont('Arial','',4); $pdf->SetTextColor(...$T['strong']);
                    $lY=$frac>=0?$zeroY-$barPx-2.5:$zeroY+$barPx+0.2;
                    $pdf->SetXY($rX+$h*$bw,$lY); $pdf->Cell($bw,2.5,pdf_str($lbl),0,0,'C');
                }
                $pdf->SetTextColor(...$T['axisText']);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH+0.3);
                $pdf->SetFont('Arial','',4); $pdf->Cell($bw,2,(string)($h+1),0,0,'C');
            }
        }
        // Y labels — $ylabels is always ordered top, middle, bottom.
        $pdf->SetFont('Arial','',5); $pdf->SetTextColor(...$T['axisText']);
        foreach($ylabels as $j=>$lbl){
            $gy=$bY2+(($j/2)*$barH);
            $pdf->SetXY($rX-9,$gy-1.5); $pdf->Cell(8,3,pdf_str($lbl),0,0,'R');
        }
        $bY=$bY2+$barH+5;
    }

    // ── 3. CVG WHEEL + METRICS ────────────────────────────────────────────────
    // Start CVG below whichever is taller: SPD chart or the 3 bar charts
    $cvgStartY = max($secY+$cH+10, $bY+4);
    $pdf->SetXY(8, $cvgStartY);
    $pdf->SHead('Color Vector Graphic (CVG)');
    $cvgSecY=$pdf->GetY();
    $vcx=46.0; $vcy=$cvgSecY+42; $rRef=32.0;

    // Hue sectors
    for($h=0;$h<16;$h++){
        $a1=90-$h*22.5; $a2=$a1-22.5;
        $rgb=tm30_hue2rgb($h*22.5+11.25,$hueLo,$hueHi);
        $pdf->Wedge($vcx,$vcy,$rRef+5,$a2,$a1,tm30_blend($rgb,$T['wedgeBase'],$T['wedgeMix']));
    }
    // Wheel interior
    $pdf->SetFillColor(...$T['wheelInner']); $pdf->Circ($vcx,$vcy,$rRef,'F');
    // Rings
    foreach([0.25,0.5,0.75,1.0] as $f){
        $pdf->SetDrawColor(...($f===1.0 ? $T['ringMajor'] : $T['ringMinor']));
        $pdf->SetLineWidth($f===1.0?0.7:0.25);
        $pdf->Circ($vcx,$vcy,$rRef*$f,'D');
    }
    // Radials
    $pdf->SetDrawColor(...$T['radial']); $pdf->SetLineWidth(0.15);
    for($a=0;$a<16;$a++){
        $ang=deg2rad(90-$a*22.5);
        $pdf->Line($vcx+5*cos($ang),$vcy-5*sin($ang),$vcx+$rRef*cos($ang),$vcy-$rRef*sin($ang));
    }
    // ── Test polygon: a true TM-30-18 Color Vector Graphic ───────────────────
    // Radius is the chroma ratio C_test/C_ref (== 1 + Rcs,hj), angle is the bin's
    // own hue angle. Outside the reference circle = rendered more saturated.
    // Previously this plotted Rf,hj/100, which is bounded at 1.0 and therefore
    // could never show over-saturation at all.
    //
    // Coordinates come from spd.php (cvgTest/cvgRef, both normalised so the
    // reference is a unit circle). Legacy rows without them fall back to
    // reconstructing from rcsBins/rhsBins; rows with no spectral data at all get
    // no polygon, because a unit circle there would read as flawless rendering.
    $mapPt = function(array $p) use ($vcx,$vcy,$rRef): array {
        $r = max(0.05, min(1.45, sqrt($p[0]*$p[0] + $p[1]*$p[1])));
        $a = atan2($p[1], $p[0]);
        return [$vcx + $rRef*$r*cos($a), $vcy - $rRef*$r*sin($a)];
    };
    $polyPts = []; $refPts = [];
    if (count($cvgTest) === 16) {
        foreach ($cvgTest as $p) $polyPts[] = $mapPt($p);
        if (count($cvgRef) === 16) foreach ($cvgRef as $p) $refPts[] = $mapPt($p);
    } elseif ($wls && $vals) {
        // Legacy row: rebuild from the per-bin shifts (reference at bin centres).
        for($h=0;$h<16;$h++){
            $t = max(0.05, min(1.45, 1.0 + (float)($rcsBins[$h] ?? 0.0)));
            $a = deg2rad(90 - $h*22.5 - (float)($rhsBins[$h] ?? 0.0));
            $polyPts[] = [$vcx+$rRef*$t*cos($a), $vcy-$rRef*$t*sin($a)];
            $ar = deg2rad(90 - $h*22.5);
            $refPts[]  = [$vcx+$rRef*cos($ar), $vcy-$rRef*sin($ar)];
        }
    }
    if (!$polyPts) {
        // No spectral basis — say so rather than draw a misleading shape.
        $pdf->SetFont('Arial','I',7); $pdf->SetTextColor(...$T['muted']);
        $pdf->SetXY($vcx-30,$vcy-2); $pdf->Cell(60,4,'No spectral data',0,0,'C');
        $pdf->SetTextColor(...$T['body']);
    }
    if ($polyPts) {
    // Build the path once. 'l' (lineto) must be lowercase and operators must be
    // whitespace-separated: the previous 'm'/'L ' spelling emitted tokens like
    // "m78.00" and "L", neither of which is a PDF operator, so viewers dropped
    // the whole path and the polygon never appeared.
    $pathOps = [];
    foreach($polyPts as $i=>[$px,$py]) {
        $pathOps[] = sprintf('%.2f %.2f %s',
            $px*$pdf->getK(), ($pdf->getH()-$py)*$pdf->getK(), $i===0?'m':'l');
    }
    $path = implode("\n", $pathOps);
    // Fill. FPDF has no alpha channel, so this is the outline colour
    // pre-composited over the wheel interior at the theme's chosen weight.
    $pdf->SetFillColor(...$T['polyFill']);
    $pdf->out($path."\nh f");
    // Outline
    $pdf->SetDrawColor(...$T['polyLine']); $pdf->SetLineWidth(0.8);
    $pdf->out($path."\nh S");
    // Reference -> test arrows. With the polygon hugging the circle the shifts
    // are hard to read without them.
    if ($refPts) {
        $pdf->SetDrawColor(...$T['arrow']); $pdf->SetLineWidth(0.35);
        foreach ($refPts as $i => [$rx,$ry]) {
            [$tx,$ty] = $polyPts[$i];
            $dx=$tx-$rx; $dy=$ty-$ry; $len=sqrt($dx*$dx+$dy*$dy);
            if ($len < 0.35) continue;                  // nothing to show
            $pdf->Line($rx,$ry,$tx,$ty);
            $ux=$dx/$len; $uy=$dy/$len; $hd=1.1; $hw=0.42;
            $pdf->SetFillColor(...$T['arrow']);
            $ax1=$tx-$ux*$hd+(-$uy)*$hw; $ay1=$ty-$uy*$hd+$ux*$hw;
            $ax2=$tx-$ux*$hd-(-$uy)*$hw; $ay2=$ty-$uy*$hd-$ux*$hw;
            $k=$pdf->getK(); $hh=$pdf->getH();
            $pdf->out(sprintf("%.2f %.2f m\n%.2f %.2f l\n%.2f %.2f l\nh f",
                $tx*$k,($hh-$ty)*$k, $ax1*$k,($hh-$ay1)*$k, $ax2*$k,($hh-$ay2)*$k));
        }
        $pdf->SetLineWidth(0.15);
    }
    // Dots
    $pdf->SetFillColor(...$T['polyDot']);
    foreach($polyPts as [$px,$py]) $pdf->Circ($px,$py,0.9,'F');
    }
    // Bold reference ring
    $pdf->SetDrawColor(...$T['refRing']); $pdf->SetLineWidth(0.6);
    $pdf->Circ($vcx,$vcy,$rRef,'D');
    // Bin numbers
    $pdf->SetFont('Arial','B',5.5); $pdf->SetTextColor(...$T['binNum']);
    for($h=0;$h<16;$h++){
        $a=deg2rad(90-$h*22.5); $lr=$rRef+8;
        $pdf->SetXY($vcx+$lr*cos($a)-3,$vcy-$lr*sin($a)-2);
        $pdf->Cell(6,4,(string)($h+1),0,0,'C');
    }
    // Rf top-left
    $rfC=$Rf===null?$T['neutral']:($Rf>=85?$T['good']:($Rf>=70?$T['warn']:$T['bad']));
    $pdf->SetFont('Arial','B',18); $pdf->SetTextColor(...$rfC);
    $pdf->SetXY(8,$cvgSecY+1); $pdf->Cell(20,10,pdf_str($Rf!==null?(string)$Rf:'-'),0,0,'L');
    $pdf->SetFont('Arial','',7); $pdf->SetTextColor(...$T['rfLabel']);
    $pdf->SetXY(8,$cvgSecY+10); $pdf->Cell(10,5,'Rf',0,0,'L');
    // Rg top-right
    $rgC=$Rg===null?$T['violet']:(abs($Rg-100)<=8?$T['good']:$T['warn']);
    $pdf->SetFont('Arial','B',18); $pdf->SetTextColor(...$rgC);
    $pdf->SetXY(74,$cvgSecY+1); $pdf->Cell(20,10,pdf_str($Rg!==null?(string)$Rg:'-'),0,0,'R');
    $pdf->SetFont('Arial','',7); $pdf->SetTextColor(...$T['rfLabel']);
    $pdf->SetXY(84,$cvgSecY+10); $pdf->Cell(10,5,'Rg',0,0,'R');
    // CCT + Duv inside wheel
    $pdf->SetFont('Arial','',6); $pdf->SetTextColor(...$T['subLabel']);
    $pdf->SetXY($vcx-$rRef*0.88,$vcy+$rRef*0.60); $pdf->Cell(22,3,'CCT',0,0,'L');
    $pdf->SetFont('Arial','B',8); $pdf->SetTextColor(...$T['strong']);
    $pdf->SetXY($vcx-$rRef*0.88,$vcy+$rRef*0.60+3); $pdf->Cell(25,4,pdf_str($cct!==null?$cct.' K':'-'),0,0,'L');
    $pdf->SetFont('Arial','',6); $pdf->SetTextColor(...$T['subLabel']);
    $pdf->SetXY($vcx+$rRef*0.50,$vcy+$rRef*0.60); $pdf->Cell(22,3,'Duv',0,0,'L');
    $pdf->SetFont('Arial','B',8); $pdf->SetTextColor(...$T['strong']);
    $pdf->SetXY($vcx+$rRef*0.50,$vcy+$rRef*0.60+3); $pdf->Cell(25,4,pdf_str($duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'-'),0,0,'L');

    // Metrics grid (right of CVG)
    $mx=100; $mW=50; $mY=$cvgSecY;
    $metrics=[['CIE x',$cx!==null?number_format($cx,4):'-'],['CIE y',$cy2!==null?number_format($cy2,4):'-'],['CCT',$cct!==null?$cct.' K':'-'],['Duv',$duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'-'],['Ra (CRI)',$Ra!==null?(string)(int)$Ra:'-'],['R9',$R9!==null?(string)(int)$R9:'-']];
    foreach($metrics as $i=>[$lbl,$val]){
        $row2=$i%3; $col=(int)($i/3);
        $mx2=$mx+$col*$mW; $my2=$mY+$row2*14;
        $pdf->SetFillColor(...$T['metricFill']); $pdf->SetDrawColor(...$T['metricLine']);
        $pdf->Rect($mx2,$my2,$mW-2,13,'DF');
        $pdf->SetFont('Arial','B',6); $pdf->SetTextColor(...$T['metricLabel']);
        $pdf->SetXY($mx2+1,$my2+1.5); $pdf->Cell($mW-4,4,pdf_str(strtoupper((string)$lbl)),0,0,'L');
        $pdf->SetFont('Arial','B',11); $pdf->SetTextColor(...$T['strong']);
        $pdf->SetXY($mx2+1,$my2+5.5); $pdf->Cell($mW-4,6,pdf_str((string)($val??'-')),0,0,'L');
    }

    // ── 4. CES 99 COLOR BARS ──────────────────────────────────────────────────
    $pdf->SetXY(8, $cvgSecY+90);
    $pdf->SHead('Color Sample Fidelity, Rf,CES');
    $cesY=$pdf->GetY(); $cesW=194; $cesH=18; $n=99; $cbw=$cesW/$n;
    $pdf->SetDrawColor(...$T['panelLine']); $pdf->SetLineWidth(0.15);
    $pdf->Rect(8,$cesY,$cesW,$cesH,'D');
    // Grid
    foreach([25,50,75] as $pct){
        $gy=$cesY+$cesH-(($pct/100)*$cesH);
        $pdf->SetDrawColor(...$T['grid']); $pdf->Line(8,$gy,8+$cesW,$gy);
    }
    // Prefer the true per-CES fidelities (and their reference hue angles) over
    // interpolating the 16 hue bins, which is what this chart used to do.
    $haveSamples = count($rfSamples) === 99;
    $haveHues    = count($sampleHues) === 99;
    for($i=0;$i<$n;$i++){
        if($haveSamples){
            $rv  = min(100,max(0,(float)$rfSamples[$i]));
            $hue = $haveHues ? (float)$sampleHues[$i] : ($i/$n)*360;
        } else {
            $binIdx=($i/$n)*16; $b0=(int)$binIdx; $b1=min(15,$b0+1); $frac=$binIdx-$b0;
            $rv=min(100,max(0,($rfBins[$b0]??75)*(1-$frac)+($rfBins[$b1]??75)*$frac));
            $hue=($i/$n)*360;
        }
        $bh=($rv/100)*$cesH*0.94;
        [$r,$g,$b]=tm30_hue2rgb($hue,$hueLo,$hueHi);
        $pdf->SetFillColor($r,$g,$b);
        $pdf->Rect(8+$i*$cbw,$cesY+$cesH-$bh,max(0.3,$cbw),$bh,'F');
    }
    // X labels
    $pdf->SetFont('Arial','',5); $pdf->SetTextColor(...$T['axisText']);
    foreach([1,10,20,30,40,50,60,70,80,90,99] as $n2){
        $bx=8+($n2-1)*$cbw;
        $pdf->SetXY($bx-2,$cesY+$cesH+0.5); $pdf->Cell(6,3,(string)$n2,0,0,'C');
    }
    $pdf->SetXY(8,$cesY+$cesH+4); $pdf->Cell($cesW,3,'CES Color',0,0,'C');
    // Y labels
    $pdf->SetFont('Arial','',5); $pdf->SetTextColor(...$T['axisText']);
    foreach(['100'=>0,'75'=>0.25,'50'=>0.5,'25'=>0.75] as $lbl=>$frac){
        $gy=$cesY+$cesH*$frac;
        $pdf->SetXY(0,$gy-1.5); $pdf->Cell(7,3,(string)$lbl,0,0,'R');
    }

    // ── 5. BOTTOM INFO ────────────────────────────────────────────────────────
    $botY=$cesY+$cesH+10;
    $pdf->SetFont('Arial','B',7); $pdf->SetTextColor(...$T['botHead']);
    $pdf->SetXY(8,$botY); $pdf->Cell(15,4,'Notes:',0,0,'L');
    $pdf->SetFont('Arial','',7); $pdf->SetTextColor(...$T['botText']);
    $notesText = trim((string)($row['notes'] ?? ''));
    $pdf->Cell(85,4,pdf_str($notesText ?: '-'),0,0,'L');

    // x,y,u',v' box
    $pdf->SetDrawColor(...$T['boxLine']); $pdf->SetLineWidth(0.3);
    $pdf->Rect(100,$botY,52,20);
    $pdf->SetFont('Arial','',7.5);
    foreach([['x',$cx!==null?number_format($cx,4):'-'],['y',$cy2!==null?number_format($cy2,4):'-']] as $k2=>[$lk,$lv]){
        $pdf->SetFont('Arial','B',7.5); $pdf->SetTextColor(...$T['botValue']);
        $pdf->SetXY(102,$botY+1+$k2*5); $pdf->Cell(7,4,$lk,0,0,'L');
        $pdf->SetFont('Arial','',7.5);  $pdf->SetTextColor(...$T['botText']);
        $pdf->Cell(25,4,$lv,0,0,'L');
    }

    // CRI box
    $pdf->Rect(155,$botY,47,20);
    $pdf->SetFont('Arial','B',7); $pdf->SetTextColor(...$T['botHead']);
    $pdf->SetXY(157,$botY+1); $pdf->Cell(43,4,'CIE 13.3-1995 (CRI)',0,1,'C');
    $pdf->SetFont('Arial','',7.5); $pdf->SetTextColor(...$T['botText']); $pdf->SetXY(157,$botY+6);
    $pdf->Cell(15,4,'Ra',0,0,'L');
    $pdf->SetFont('Arial','B',9); $pdf->SetTextColor(...$T['botValue']);
    $pdf->Cell(20,4,pdf_str($Ra!==null?(string)(int)$Ra:'-'),0,1,'L');
    $pdf->SetFont('Arial','',7.5); $pdf->SetTextColor(...$T['botText']); $pdf->SetXY(157,$botY+12);
    $pdf->Cell(15,4,'R9',0,0,'L');
    $pdf->SetFont('Arial','B',9); $pdf->SetTextColor(...$T['botValue']);
    $pdf->Cell(20,4,pdf_str($R9!==null?(string)(int)$R9:'-'),0,1,'L');

    return $pdf;
}