<?php
declare(strict_types=1);

define('FPDF_FONTPATH', __DIR__ . '/../vendor/fpdf/font/');
require_once __DIR__ . '/../vendor/fpdf/fpdf.php';

// ── Colour helpers ────────────────────────────────────────────────────────────
function wl2rgb(float $wl): array {
    if ($wl < 380) return [80,0,130];
    if ($wl < 440) { $t=($wl-380)/60; return [0,0,min(255,(int)(130+125*$t))]; }
    if ($wl < 490) { $t=($wl-440)/50; return [0,(int)(255*$t),255]; }
    if ($wl < 510) { $t=($wl-490)/20; return [0,255,(int)(255*(1-$t))]; }
    if ($wl < 580) { $t=($wl-510)/70; return [(int)(255*$t),(int)(255*(1-$t*0.2)),0]; }
    if ($wl < 645) { $t=($wl-580)/65; return [255,(int)(180*(1-$t)),0]; }
    if ($wl<=780)  { $t=($wl-645)/135;return [(int)(255*(1-$t*0.3)),0,0]; }
    return [80,0,0];
}

function hue2rgb(float $h): array {
    // perceptual hue wheel colours matching TM-30 CVG
    $r = 128+127*cos(deg2rad($h));
    $g = 128+127*cos(deg2rad($h-120));
    $b = 128+127*cos(deg2rad($h+120));
    return [max(30,min(240,(int)$r)),max(30,min(240,(int)$g)),max(30,min(240,(int)$b))];
}

function rfBinColor(float $rf): array {
    if ($rf >= 90) return [40,160,80];
    if ($rf >= 80) return [100,180,60];
    if ($rf >= 70) return [210,170,40];
    return [210,60,50];
}

// ── TM30PDF class ─────────────────────────────────────────────────────────────
class TM30PDF extends FPDF {

    // Draw circle using bezier curves
    function Circle(float $x, float $y, float $r, string $style='D'): void {
        $op  = $style==='F'?'f':($style==='FD'||$style==='DF'?'B':'S');
        $k   = $this->k; $h = $this->h;
        $lx  = 4/3*(M_SQRT2-1)*$r;
        $this->_out(sprintf('%.2f %.2f m',($x+$r)*$k,($h-$y)*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',($x+$r)*$k,($h-($y-$lx))*$k,($x+$lx)*$k,($h-($y-$r))*$k,$x*$k,($h-($y-$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',($x-$lx)*$k,($h-($y-$r))*$k,($x-$r)*$k,($h-($y-$lx))*$k,($x-$r)*$k,($h-$y)*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',($x-$r)*$k,($h-($y+$lx))*$k,($x-$lx)*$k,($h-($y+$r))*$k,$x*$k,($h-($y+$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c %s',($x+$lx)*$k,($h-($y+$r))*$k,($x+$r)*$k,($h-($y+$lx))*$k,($x+$r)*$k,($h-$y)*$k,$op));
    }

    // Draw a wedge/pie slice
    function Wedge(float $cx, float $cy, float $r, float $a1deg, float $a2deg, array $fill): void {
        $this->SetFillColor(...$fill);
        $steps = max(3, (int)ceil(abs($a2deg-$a1deg)/5));
        $pts   = [[$cx, $cy]];
        for ($i=0;$i<=$steps;$i++) {
            $a   = deg2rad($a1deg + ($a2deg-$a1deg)*$i/$steps);
            $pts[] = [$cx + $r*cos($a), $cy - $r*sin($a)];
        }
        $pStr = '';
        foreach ($pts as $i=>[$px,$py]) {
            $pStr .= sprintf('%.2f %.2f '.($i===0?'m':'L '), $px*$this->k, ($this->h-$py)*$this->k);
        }
        $this->_out($pStr.'f');
    }

    // Draw line at angle
    function LineAngle(float $cx, float $cy, float $r1, float $r2, float $adeg): void {
        $a = deg2rad($adeg);
        $this->Line($cx+$r1*cos($a), $cy-$r1*sin($a), $cx+$r2*cos($a), $cy-$r2*sin($a));
    }
}


// ── Main PDF builder — returns TM30PDF object ready for Output() ─────────────
function build_tm30_pdf(array $row, array $rfBins, ?array $wls, ?array $vals): TM30PDF {
    $pdf = new TM30PDF('P','mm','A4');
    $pdf->title = mb_substr($row['label'], 0, 40);
    $pdf->SetMargins(10,10,10);
    $pdf->SetAutoPageBreak(false);
    $pdf->AddPage();

    $Rf   = $row['rf']    !== null ? (int)$row['rf']    : null;
    $Rg   = $row['rg']    !== null ? (int)$row['rg']    : null;
    $cct  = $row['cct']   !== null ? (int)$row['cct']   : null;
    $duv  = $row['duv']   !== null ? (float)$row['duv'] : null;
    $cx   = $row['cie_x'] !== null ? (float)$row['cie_x'] : null;
    $cy2  = $row['cie_y'] !== null ? (float)$row['cie_y'] : null;
    $meta = json_decode($row['meta'] ?: '{}', true) ?? [];
    $Ra   = $meta['ra']   ?? null;
    $R9   = $meta['r9']   ?? null;



    return $pdf;
}