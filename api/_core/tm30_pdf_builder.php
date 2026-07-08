<?php
/**
 * Shared TM-30 PDF builder — used by both reports_pdf.php and guest_pdf.php
 * Produces a full IES TM-30-18 layout matching the on-screen report.
 *
 * Usage:
 *   require_once __DIR__ . '/tm30_pdf_builder.php';
 *   $pdf = build_tm30_report($row, $rfBins, $wls, $vals);
 *   $pdf->Output('I');
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

function tm30_hue2rgb(float $h): array {
    $r=128+127*cos(deg2rad($h)); $g=128+127*cos(deg2rad($h-120)); $b=128+127*cos(deg2rad($h+120));
    return [max(30,min(240,(int)$r)),max(30,min(240,(int)$g)),max(30,min(240,(int)$b))];
}

// ── PDF class ───────────────────────────────────────────────────────────────────
class TM30ReportPDF extends FPDF {
    public string $reportTitle = '';

    // Public wrappers for protected FPDF internals
    public function out(string $s): void   { $this->_out($s); }
    public function getK(): float          { return $this->k; }
    public function getH(): float          { return $this->h; }

    function Header(): void {
        $this->SetFillColor(12,20,36);
        $this->Rect(0,0,210,16,'F');
        $this->SetFont('Arial','B',11);
        $this->SetTextColor(200,230,255);
        $this->SetXY(8,3);
        $this->Cell(130,10,'IES TM-30-18 Color Rendition Report',0,0,'L');
        $this->SetFont('Arial','',8);
        $this->SetTextColor(80,140,180);
        $this->SetXY(130,3);
        $this->Cell(72,10,mb_substr($this->reportTitle,0,38),0,0,'R');
        $this->SetTextColor(0,0,0);
        $this->Ln(18);
    }

    function Footer(): void {
        $this->SetY(-10);
        $this->SetFont('Arial','I',7);
        $this->SetTextColor(160,160,160);
        $this->Cell(0,8,'Generated '.date('Y-m-d H:i').' · hCRI.io · Colors are for visual orientation purposes only.',0,0,'C');
    }

    function SHead(string $t): void {
        $this->SetFont('Arial','B',8);
        $this->SetFillColor(224,236,248);
        $this->SetTextColor(20,60,110);
        $this->Cell(0,5,'  '.$t,0,1,'L',true);
        $this->SetTextColor(0,0,0);
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
function build_tm30_report(array $row, array $rfBins, ?array $wls, ?array $vals): TM30ReportPDF {

    $pdf = new TM30ReportPDF('P','mm','A4');
    $pdf->reportTitle = pdf_str($row['label'] ?? '');
    $pdf->SetMargins(8,8,8);
    $pdf->SetAutoPageBreak(true, 12);
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

    // ── 1. SOURCE INFO BAR ────────────────────────────────────────────────────
    $infoY = $pdf->GetY();
    $pdf->SetDrawColor(180,200,220); $pdf->SetLineWidth(0.2);
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
        $pdf->SetFillColor(230,238,248);
        $pdf->Rect($x, $infoY, $cw, 10, 'DF');
        $pdf->SetFont('Arial','B',6.5); $pdf->SetTextColor(60,100,140);
        $pdf->SetXY($x+1, $infoY+1);   $pdf->Cell($cw-2,4,pdf_str(strtoupper((string)$k)),0,0,'L');
        $pdf->SetFont('Arial','',8);   $pdf->SetTextColor(10,10,10);
        $pdf->SetXY($x+1, $infoY+5.5); $pdf->Cell($cw-2,4,pdf_str($v),0,0,'L');
    }
    $pdf->SetXY(8, $infoY+12);

    // ── 2. SPD CHART (left) + 3 bar charts (right) ───────────────────────────
    $secY = $pdf->GetY();
    $lW=96; $rX=108; $rW=94;

    // SPD chart
    $pdf->SHead('Spectral Power Distribution');
    $cY=$pdf->GetY(); $cH=38;
    $pdf->SetFillColor(248,250,252); $pdf->SetDrawColor(190,210,225);
    $pdf->Rect(8,$cY,$lW,$cH,'DF');

    if($wls && $vals){
        $maxV=max($vals); $minWl=min($wls); $span=max(1,max($wls)-$minWl);
        $pL=8+7; $pR=8+$lW-2; $pT=$cY+2; $pB=$cY+$cH-5;
        $cW2=$pR-$pL; $cH2=$pB-$pT;
        // Grid
        $pdf->SetDrawColor(215,225,235); $pdf->SetLineWidth(0.15);
        foreach([400,450,500,550,600,650,700,750] as $wl){
            $gx=$pL+(($wl-$minWl)/$span)*$cW2;
            if($gx<$pL||$gx>$pR) continue;
            $pdf->Line($gx,$pT,$gx,$pB);
            $pdf->SetFont('Arial','',5.5); $pdf->SetTextColor(130,150,165);
            $pdf->SetXY($gx-4,$pB+0.5); $pdf->Cell(8,3,(string)$wl,0,0,'C');
        }
        // Fill
        foreach($wls as $i=>$wl){
            if($i===0) continue;
            $x1=$pL+(($wls[$i-1]-$minWl)/$span)*$cW2;
            $x2=$pL+(($wl-$minWl)/$span)*$cW2;
            $ah=(($vals[$i-1]+$vals[$i])/2/$maxV)*$cH2*0.9;
            [$r,$g,$b]=tm30_wl2rgb((int)(($wl+$wls[$i-1])/2));
            $lr=min(255,(int)(185+($r-185)*0.5)); $lg=min(255,(int)(185+($g-185)*0.5)); $lb=min(255,(int)(185+($b-185)*0.5));
            $pdf->SetFillColor(max(0,$lr),max(0,$lg),max(0,$lb));
            $pdf->Rect($x1,$pB-$ah,max(0.1,$x2-$x1),$ah,'F');
        }
        // Red test curve
        $pdf->SetDrawColor(200,30,30); $pdf->SetLineWidth(0.5);
        $first=true;
        foreach($wls as $i=>$wl){
            $px=$pL+(($wl-$minWl)/$span)*$cW2;
            $py=$pB-($vals[$i]/$maxV)*$cH2*0.9;
            $pdf->out(sprintf($first?'%.2f %.2f m':'%.2f %.2f l',$px*$pdf->getK(),($pdf->getH()-$py)*$pdf->getK()));
            $first=false;
        }
        $pdf->out('S');
        // Reference line
        $pdf->SetDrawColor(140,140,140); $pdf->SetLineWidth(0.3);
        $pdf->Line($pL,$pT+$cH2*0.1,$pR,$pT+$cH2*0.1);
        // Legend
        $pdf->SetFont('Arial','',6); $pdf->SetTextColor(200,30,30);
        $pdf->SetXY($pL+3,$pT+1); $pdf->Cell(16,3,'- Test',0,0,'L');
        $pdf->SetTextColor(100,100,100);
        $pdf->SetXY($pL+20,$pT+1); $pdf->Cell(20,3,'--- Reference',0,0,'L');
        // X axis label
        $pdf->SetTextColor(100,120,140); $pdf->SetFont('Arial','',6);
        $pdf->SetXY(8+1,$cY+$cH-3); $pdf->Cell($lW-2,3,'Wavelength (nm)',0,0,'C');
        $pdf->SetLineWidth(0.2);
    }

    // 3 right-side bar charts
    $barH = 11; $bw=$rW/16;
    $chartDefs = [
        ['LOCAL CHROMA SHIFT (Rcs,hj)', 'chroma',   ['−40%','0%','+40%']],
        ['LOCAL HUE SHIFT (Rhs,hj)',    'hue',      ['−0.50','0','0.50']],
        ['LOCAL COLOR FIDELITY (Rf,hj)','fidelity', ['0','50','100']],
    ];
    $bY = $secY;
    foreach($chartDefs as [$title,$mode,$ylabels]){
        $pdf->SetXY($rX,$bY);
        $pdf->SetFont('Arial','B',6.5); $pdf->SetTextColor(30,60,100);
        $pdf->Cell($rW,4,$title,0,1,'L');
        $bY2=$pdf->GetY();
        $pdf->SetDrawColor(190,210,225); $pdf->SetLineWidth(0.15);
        $pdf->Rect($rX,$bY2,$rW,$barH,'D');
        $zeroY=$bY2+$barH/2;

        if($mode==='fidelity'){
            // Grid lines
            foreach([25,50,75,100] as $pct){
                $gy=$bY2+$barH-(($pct/100)*$barH);
                $pdf->SetDrawColor(215,225,235);$pdf->Line($rX,$gy,$rX+$rW,$gy);
            }
            for($h=0;$h<16;$h++){
                $rb=min(100,max(0,(float)($rfBins[$h]??75)));
                $bh=($rb/100)*$barH*0.92;
                [$r,$g,$b]=tm30_hue2rgb($h*22.5+11.25);
                $pdf->SetFillColor($r,$g,$b);
                $pdf->Rect($rX+$h*$bw+0.3,$bY2+$barH-$bh,$bw-0.6,$bh,'F');
                $pdf->SetFont('Arial','',4.5); $pdf->SetTextColor(10,10,10);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH-$bh-2.8);
                $pdf->Cell($bw,2.5,(string)(int)round($rb),0,0,'C');
                $pdf->SetTextColor(80,100,120);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH+0.3);
                $pdf->Cell($bw,2,(string)($h+1),0,0,'C');
            }
        } else {
            // Zero line
            $pdf->SetDrawColor(100,120,140); $pdf->SetLineWidth(0.4);
            $pdf->Line($rX,$zeroY,$rX+$rW,$zeroY); $pdf->SetLineWidth(0.15);
            for($h=0;$h<16;$h++){
                $rb=(float)($rfBins[$h]??75);
                $shift=$mode==='chroma'?($rb-85)/300:($rb-85)/2500;
                $barPx=min($barH*0.45,abs($shift)*($barH*0.9));
                [$r,$g,$b]=tm30_hue2rgb($h*22.5+11.25);
                $pdf->SetFillColor($r,$g,$b);
                if($shift>=0) $pdf->Rect($rX+$h*$bw+0.3,$zeroY-$barPx,$bw-0.6,$barPx,'F');
                else           $pdf->Rect($rX+$h*$bw+0.3,$zeroY,$bw-0.6,$barPx,'F');
                $lbl=$mode==='chroma'?round($shift*100).'%':number_format($shift,2);
                $pdf->SetFont('Arial','',4); $pdf->SetTextColor(10,10,10);
                $lY=$shift>=0?$zeroY-$barPx-2.5:$zeroY+$barPx+0.2;
                $pdf->SetXY($rX+$h*$bw,$lY); $pdf->Cell($bw,2.5,$lbl,0,0,'C');
                $pdf->SetTextColor(80,100,120);
                $pdf->SetXY($rX+$h*$bw,$bY2+$barH+0.3);
                $pdf->SetFont('Arial','',4); $pdf->Cell($bw,2,(string)($h+1),0,0,'C');
            }
        }
        // Y labels
        $pdf->SetFont('Arial','',5); $pdf->SetTextColor(80,100,120);
        foreach($ylabels as $j=>$lbl){
            $gy=$mode==='fidelity'?$bY2+$barH-(($j/2)*$barH):$bY2+(($j/2)*$barH);
            $pdf->SetXY($rX-9,$gy-1.5); $pdf->Cell(8,3,$lbl,0,0,'R');
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
        [$r,$g,$b]=tm30_hue2rgb($h*22.5+11.25);
        $lr=min(255,(int)(170+($r-170)*0.45)); $lg=min(255,(int)(170+($g-170)*0.45)); $lb=min(255,(int)(170+($b-170)*0.45));
        $pdf->Wedge($vcx,$vcy,$rRef+5,$a2,$a1,[$lr,$lg,$lb]);
    }
    // White inner
    $pdf->SetFillColor(248,249,252); $pdf->Circ($vcx,$vcy,$rRef,'F');
    // Rings
    foreach([0.25,0.5,0.75,1.0] as $f){
        $pdf->SetDrawColor($f===1.0?30:180,$f===1.0?30:190,$f===1.0?30:210);
        $pdf->SetLineWidth($f===1.0?0.7:0.25);
        $pdf->Circ($vcx,$vcy,$rRef*$f,'D');
    }
    // Radials
    $pdf->SetDrawColor(200,210,220); $pdf->SetLineWidth(0.15);
    for($a=0;$a<16;$a++){
        $ang=deg2rad(90-$a*22.5);
        $pdf->Line($vcx+5*cos($ang),$vcy-5*sin($ang),$vcx+$rRef*cos($ang),$vcy-$rRef*sin($ang));
    }
    // Test polygon
    $polyPts=[];
    for($h=0;$h<16;$h++){
        $t=max(0.05,min(1.45,($rfBins[$h]??75)/100));
        $a=deg2rad(90-$h*22.5);
        $polyPts[]=[$vcx+$rRef*$t*cos($a),$vcy-$rRef*$t*sin($a)];
    }
    // Fill
    $pStr='';
    foreach($polyPts as $i=>[$px,$py]) $pStr.=sprintf('%.2f %.2f '.($i===0?'m':'L '),$px*$pdf->getK(),($pdf->getH()-$py)*$pdf->getK());
    $pdf->SetFillColor(220,50,50,30); $pdf->out($pStr.'f');
    // Outline
    $pdf->SetDrawColor(190,25,25); $pdf->SetLineWidth(0.8);
    $pStr2='';
    foreach($polyPts as $i=>[$px,$py]) $pStr2.=sprintf('%.2f %.2f '.($i===0?'m':'L '),$px*$pdf->getK(),($pdf->getH()-$py)*$pdf->getK());
    $pdf->out($pStr2.'s');
    // Dots
    $pdf->SetFillColor(170,15,15);
    foreach($polyPts as [$px,$py]) $pdf->Circ($px,$py,0.9,'F');
    // Bold reference ring
    $pdf->SetDrawColor(20,20,20); $pdf->SetLineWidth(0.6);
    $pdf->Circ($vcx,$vcy,$rRef,'D');
    // Bin numbers
    $pdf->SetFont('Arial','B',5.5); $pdf->SetTextColor(20,20,20);
    for($h=0;$h<16;$h++){
        $a=deg2rad(90-$h*22.5); $lr=$rRef+8;
        $pdf->SetXY($vcx+$lr*cos($a)-3,$vcy-$lr*sin($a)-2);
        $pdf->Cell(6,4,(string)($h+1),0,0,'C');
    }
    // Rf top-left
    $rfC=$Rf===null?[24,95,165]:($Rf>=85?[40,140,60]:($Rf>=70?[180,120,20]:[160,40,40]));
    $pdf->SetFont('Arial','B',18); $pdf->SetTextColor(...$rfC);
    $pdf->SetXY(8,$cvgSecY+1); $pdf->Cell(20,10,pdf_str($Rf!==null?(string)$Rf:'-'),0,0,'L');
    $pdf->SetFont('Arial','',7); $pdf->SetTextColor(60,80,110);
    $pdf->SetXY(8,$cvgSecY+10); $pdf->Cell(10,5,'Rf',0,0,'L');
    // Rg top-right
    $rgC=$Rg===null?[83,58,183]:(abs($Rg-100)<=8?[40,140,60]:[180,120,20]);
    $pdf->SetFont('Arial','B',18); $pdf->SetTextColor(...$rgC);
    $pdf->SetXY(74,$cvgSecY+1); $pdf->Cell(20,10,pdf_str($Rg!==null?(string)$Rg:'-'),0,0,'R');
    $pdf->SetFont('Arial','',7); $pdf->SetTextColor(60,80,110);
    $pdf->SetXY(84,$cvgSecY+10); $pdf->Cell(10,5,'Rg',0,0,'R');
    // CCT + Duv inside wheel
    $pdf->SetFont('Arial','',6); $pdf->SetTextColor(50,50,50);
    $pdf->SetXY($vcx-$rRef*0.88,$vcy+$rRef*0.60); $pdf->Cell(22,3,'CCT',0,0,'L');
    $pdf->SetFont('Arial','B',8); $pdf->SetTextColor(10,10,10);
    $pdf->SetXY($vcx-$rRef*0.88,$vcy+$rRef*0.60+3); $pdf->Cell(25,4,pdf_str($cct!==null?$cct.' K':'-'),0,0,'L');
    $pdf->SetFont('Arial','',6); $pdf->SetTextColor(50,50,50);
    $pdf->SetXY($vcx+$rRef*0.50,$vcy+$rRef*0.60); $pdf->Cell(22,3,'Duv',0,0,'L');
    $pdf->SetFont('Arial','B',8); $pdf->SetTextColor(10,10,10);
    $pdf->SetXY($vcx+$rRef*0.50,$vcy+$rRef*0.60+3); $pdf->Cell(25,4,pdf_str($duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'-'),0,0,'L');

    // Metrics grid (right of CVG)
    $mx=100; $mW=50; $mY=$cvgSecY;
    $metrics=[['CIE x',$cx!==null?number_format($cx,4):'-'],['CIE y',$cy2!==null?number_format($cy2,4):'-'],['CCT',$cct!==null?$cct.' K':'-'],['Duv',$duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'-'],['Ra (CRI)',$Ra!==null?(string)(int)$Ra:'-'],['R9',$R9!==null?(string)(int)$R9:'-']];
    foreach($metrics as $i=>[$lbl,$val]){
        $row2=$i%3; $col=(int)($i/3);
        $mx2=$mx+$col*$mW; $my2=$mY+$row2*14;
        $pdf->SetFillColor(235,242,252); $pdf->SetDrawColor(190,210,230);
        $pdf->Rect($mx2,$my2,$mW-2,13,'DF');
        $pdf->SetFont('Arial','B',6); $pdf->SetTextColor(50,90,140);
        $pdf->SetXY($mx2+1,$my2+1.5); $pdf->Cell($mW-4,4,pdf_str(strtoupper((string)$lbl)),0,0,'L');
        $pdf->SetFont('Arial','B',11); $pdf->SetTextColor(10,10,10);
        $pdf->SetXY($mx2+1,$my2+5.5); $pdf->Cell($mW-4,6,pdf_str((string)($val??'-')),0,0,'L');
    }

    // ── 4. CES 99 COLOR BARS ──────────────────────────────────────────────────
    $pdf->SetXY(8, $cvgSecY+90);
    $pdf->SHead('Color Sample Fidelity, Rf,CES');
    $cesY=$pdf->GetY(); $cesW=194; $cesH=18; $n=99; $cbw=$cesW/$n;
    $pdf->SetDrawColor(190,210,225); $pdf->SetLineWidth(0.15);
    $pdf->Rect(8,$cesY,$cesW,$cesH,'D');
    // Grid
    foreach([25,50,75] as $pct){
        $gy=$cesY+$cesH-(($pct/100)*$cesH);
        $pdf->SetDrawColor(215,225,235); $pdf->Line(8,$gy,8+$cesW,$gy);
    }
    for($i=0;$i<$n;$i++){
        $binIdx=($i/$n)*16; $b0=(int)$binIdx; $b1=min(15,$b0+1); $frac=$binIdx-$b0;
        $rv=min(100,max(0,($rfBins[$b0]??75)*(1-$frac)+($rfBins[$b1]??75)*$frac));
        $bh=($rv/100)*$cesH*0.94;
        $hue=($i/$n)*360;
        [$r,$g,$b]=tm30_hue2rgb($hue);
        $pdf->SetFillColor($r,$g,$b);
        $pdf->Rect(8+$i*$cbw,$cesY+$cesH-$bh,max(0.3,$cbw),$bh,'F');
    }
    // X labels
    $pdf->SetFont('Arial','',5); $pdf->SetTextColor(80,100,120);
    foreach([1,10,20,30,40,50,60,70,80,90,99] as $n2){
        $bx=8+($n2-1)*$cbw;
        $pdf->SetXY($bx-2,$cesY+$cesH+0.5); $pdf->Cell(6,3,(string)$n2,0,0,'C');
    }
    $pdf->SetXY(8,$cesY+$cesH+4); $pdf->Cell($cesW,3,'CES Color',0,0,'C');
    // Y labels
    $pdf->SetFont('Arial','',5); $pdf->SetTextColor(80,100,120);
    foreach(['100'=>0,'75'=>0.25,'50'=>0.5,'25'=>0.75] as $lbl=>$frac){
        $gy=$cesY+$cesH*$frac;
        $pdf->SetXY(0,$gy-1.5); $pdf->Cell(7,3,$lbl,0,0,'R');
    }

    // ── 5. BOTTOM INFO ────────────────────────────────────────────────────────
    $botY=$cesY+$cesH+10;
    $pdf->SetFont('Arial','B',7); $pdf->SetTextColor(30,50,80);
    $pdf->SetXY(8,$botY); $pdf->Cell(15,4,'Notes:',0,0,'L');
    $pdf->SetFont('Arial','',7);
    $notesText = trim((string)($row['notes'] ?? ''));
    $pdf->Cell(85,4,pdf_str($notesText ?: '-'),0,0,'L');

    // x,y,u',v' box
    $pdf->SetDrawColor(170,195,220); $pdf->SetLineWidth(0.3);
    $pdf->Rect(100,$botY,52,20);
    $pdf->SetFont('Arial','',7.5);
    foreach([['x',$cx!==null?number_format($cx,4):'-'],['y',$cy2!==null?number_format($cy2,4):'-']] as $k2=>[$lk,$lv]){
        $pdf->SetFont('Arial','B',7.5); $pdf->SetXY(102,$botY+1+$k2*5); $pdf->Cell(7,4,$lk,0,0,'L');
        $pdf->SetFont('Arial','',7.5); $pdf->Cell(25,4,$lv,0,0,'L');
    }

    // CRI box
    $pdf->Rect(155,$botY,47,20);
    $pdf->SetFont('Arial','B',7); $pdf->SetXY(157,$botY+1); $pdf->Cell(43,4,'CIE 13.3-1995 (CRI)',0,1,'C');
    $pdf->SetFont('Arial','',7.5); $pdf->SetXY(157,$botY+6);
    $pdf->Cell(15,4,'Ra',0,0,'L'); $pdf->SetFont('Arial','B',9); $pdf->Cell(20,4,pdf_str($Ra!==null?(string)(int)$Ra:'-'),0,1,'L');
    $pdf->SetFont('Arial','',7.5); $pdf->SetXY(157,$botY+12);
    $pdf->Cell(15,4,'R9',0,0,'L'); $pdf->SetFont('Arial','B',9); $pdf->Cell(20,4,pdf_str($R9!==null?(string)(int)$R9:'-'),0,1,'L');

    return $pdf;
}