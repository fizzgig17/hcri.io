<?php
declare(strict_types=1);
require_once __DIR__ . '/../_core/response.php';
require_once __DIR__ . '/../_core/db.php';
require_once __DIR__ . '/../_core/auth.php';

cors_headers();
$user = require_auth();
$db   = get_db();

$id = (int)basename(dirname(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)));
if (!$id) json_error('Invalid ID', 400);

$s = $db->prepare('SELECT * FROM reports WHERE id=? AND user_id=?');
$s->execute([$id, $user['id']]);
$row = $s->fetch();
if (!$row) json_error('Report not found', 404);

$meta   = json_decode($row['meta'] ?? '{}', true) ?? [];
$rfBins = $meta['rfBins'] ?? array_fill(0, 16, 75.0);
$wls = $vals = null;
if (!empty($row['spd_data'])) {
    $pairs = json_decode($row['spd_data'], true);
    $wls   = array_column($pairs, 0);
    $vals  = array_column($pairs, 1);
}

// FPDF — path relative to this file
define('FPDF_FONTPATH', __DIR__ . '/../../vendor/fpdf/font/');
require_once __DIR__ . '/../../vendor/fpdf/fpdf.php';

class TM30 extends FPDF {
    public string $title = '';

    function Header() {
        $this->SetFillColor(18,26,40);
        $this->Rect(0,0,210,20,'F');
        $this->SetFont('Arial','B',13);
        $this->SetTextColor(220,235,255);
        $this->SetXY(10,5);
        $this->Cell(130,10,'TM-30 Spectral Report',0,0);
        $this->SetFont('Arial','',9);
        $this->SetTextColor(100,150,180);
        $this->SetXY(140,5);
        $this->Cell(60,10,$this->title,0,0,'R');
        $this->SetTextColor(30,30,30);
        $this->Ln(22);
    }

    function Footer() {
        $this->SetY(-12);
        $this->SetFont('Arial','I',8);
        $this->SetTextColor(150,150,150);
        $this->Cell(0,10,'Generated '.date('Y-m-d H:i').'  |  Page '.$this->PageNo(),0,0,'C');
    }

    function SectionHead(string $t): void {
        $this->SetFont('Arial','B',10);
        $this->SetFillColor(230,241,251);
        $this->SetTextColor(12,68,124);
        $this->Cell(0,7,'  '.$t,0,1,'L',true);
        $this->SetTextColor(30,30,30);
        $this->Ln(2);
    }

    function Badge(float $x,float $y,string $lbl,string $val,array $rgb=[24,95,165]): void {
        $this->SetFillColor(230,241,251);
        $this->SetDrawColor(180,210,240);
        $this->RRect($x,$y,38,16,2,'DF');
        $this->SetFont('Arial','',7);
        $this->SetTextColor(80,120,160);
        $this->SetXY($x,$y+2);
        $this->Cell(38,5,$lbl,0,2,'C');
        $this->SetFont('Arial','B',13);
        $this->SetTextColor(...$rgb);
        $this->SetXY($x,$y+7);
        $this->Cell(38,7,$val,0,0,'C');
        $this->SetTextColor(30,30,30);
        $this->SetDrawColor(0,0,0);
    }

    function RRect(float $x,float $y,float $w,float $h,float $r,string $s=''): void {
        $op=$s==='F'?'f':($s==='FD'||$s==='DF'?'B':'S');
        $a=4/3*(sqrt(2)-1);
        $k=$this->k;$hp=$this->h;
        $this->_out(sprintf('%.2f %.2f m',($x+$r)*$k,($hp-$y)*$k));
        $this->_out(sprintf('%.2f %.2f l',(($x+$w-$r))*$k,($hp-$y)*$k));
        $this->Arc2($x+$w-$r,$y+$r,$r,-M_PI/2,0);
        $this->_out(sprintf('%.2f %.2f l',($x+$w)*$k,($hp-($y+$h-$r))*$k));
        $this->Arc2($x+$w-$r,$y+$h-$r,$r,0,M_PI/2);
        $this->_out(sprintf('%.2f %.2f l',($x+$r)*$k,($hp-($y+$h))*$k));
        $this->Arc2($x+$r,$y+$h-$r,$r,M_PI/2,M_PI);
        $this->_out(sprintf('%.2f %.2f l',$x*$k,($hp-($y+$r))*$k));
        $this->Arc2($x+$r,$y+$r,$r,M_PI,3*M_PI/2);
        $this->_out($op);
    }

    function Arc2(float $cx,float $cy,float $r,float $a1,float $a2): void {
        $n=max(2,(int)ceil(abs($a2-$a1)*4/M_PI));
        $step=($a2-$a1)/$n;$k=$this->k;$h=$this->h;
        for($i=1;$i<=$n;$i++){
            $a=$a1+$i*$step;$prev=$a1+($i-1)*$step;
            $c=4/3*tan(($a-$prev)/4);
            $x1=$cx+cos($prev)*$r;$y1=$cy+sin($prev)*$r;
            $x2=$cx+cos($a)*$r;$y2=$cy+sin($a)*$r;
            $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
                ($x1-$c*sin($prev)*$r)*$k,($h-($y1+$c*cos($prev)*$r))*$k,
                ($x2+$c*sin($a)*$r)*$k,($h-($y2-$c*cos($a)*$r))*$k,
                $x2*$k,($h-$y2)*$k));
        }
    }

    function Circle(float $x,float $y,float $r,string $s='D'): void {
        $op=$s==='F'?'f':($s==='FD'||$s==='DF'?'B':'S');
        $lx=4/3*(M_SQRT2-1)*$r;$k=$this->k;$h=$this->h;
        $this->_out(sprintf('%.2f %.2f m %.2f %.2f %.2f %.2f %.2f %.2f c',
            ($x+$r)*$k,($h-$y)*$k,($x+$r)*$k,($h-($y-$lx))*$k,($x+$lx)*$k,($h-($y-$r))*$k,$x*$k,($h-($y-$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
            ($x-$lx)*$k,($h-($y-$r))*$k,($x-$r)*$k,($h-($y-$lx))*$k,($x-$r)*$k,($h-$y)*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c',
            ($x-$r)*$k,($h-($y+$lx))*$k,($x-$lx)*$k,($h-($y+$r))*$k,$x*$k,($h-($y+$r))*$k));
        $this->_out(sprintf('%.2f %.2f %.2f %.2f %.2f %.2f c %s',
            ($x+$lx)*$k,($h-($y+$r))*$k,($x+$r)*$k,($h-($y+$lx))*$k,($x+$r)*$k,($h-$y)*$k,$op));
    }
}

// ── Build PDF ─────────────────────────────────────────────────────────────────
$pdf = new TM30('P','mm','A4');
$pdf->title = mb_substr($row['label'], 0, 40);
$pdf->SetMargins(10,10,10);
$pdf->SetAutoPageBreak(true,15);
$pdf->AddPage();

// Metric values
$Rf  = $row['rf']    !== null ? (int)$row['rf']    : null;
$Rg  = $row['rg']    !== null ? (int)$row['rg']    : null;
$cct = $row['cct']   !== null ? (int)$row['cct']   : null;
$duv = $row['duv']   !== null ? (float)$row['duv'] : null;
$cx  = $row['cie_x'] !== null ? (float)$row['cie_x'] : null;
$cy2 = $row['cie_y'] !== null ? (float)$row['cie_y'] : null;

$rfRgb = $Rf===null?[24,95,165]:($Rf>=85?[59,109,17]:($Rf>=70?[186,117,23]:[163,45,45]));

// ── 1. Metrics badges ─────────────────────────────────────────────────────────
$pdf->SectionHead('Photometric Summary');
$by = $pdf->GetY();
$badges = [
    ['Rf (Fidelity)',  $Rf!==null?(string)$Rf:'—',   $rfRgb],
    ['Rg (Gamut)',     $Rg!==null?(string)$Rg:'—',   [83,58,183]],
    ['CCT',            $cct!==null?$cct.'K':'—',      [24,95,165]],
    ['Duv',            $duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'—', [15,110,86]],
    ['CIE x',          $cx!==null?number_format($cx,4):'—',  [95,94,90]],
    ['CIE y',          $cy2!==null?number_format($cy2,4):'—',[95,94,90]],
];
foreach ($badges as $i => [$lbl,$val,$rgb]) $pdf->Badge(10+$i*41, $by, $lbl, $val, $rgb);
$pdf->Ln(22);

// ── 2. SPD chart ──────────────────────────────────────────────────────────────
$pdf->SectionHead('Spectral Power Distribution (380–780 nm)');
$cY=$pdf->GetY(); $cX=10; $cW=190; $cH=48;
$pdf->SetFillColor(245,248,252); $pdf->SetDrawColor(200,215,230);
$pdf->Rect($cX,$cY,$cW,$cH,'DF');

if ($wls && $vals) {
    $maxV=max($vals); $minWl=min($wls); $span=max(1,max($wls)-$minWl);
    // grid
    $pdf->SetDrawColor(220,228,238); $pdf->SetLineWidth(0.2);
    foreach([400,450,500,550,600,650,700,750] as $wl){
        $gx=$cX+(($wl-$minWl)/$span)*$cW;
        $pdf->Line($gx,$cY,$gx,$cY+$cH);
        $pdf->SetFont('Arial','',6); $pdf->SetTextColor(140,155,170);
        $pdf->SetXY($gx-4,$cY+$cH+0.5); $pdf->Cell(8,4,(string)$wl,0,0,'C');
    }
    // coloured slices
    foreach($wls as $i=>$wl){
        if($i===0)continue;
        $x1=$cX+(($wls[$i-1]-$minWl)/$span)*$cW;
        $x2=$cX+(($wl-$minWl)/$span)*$cW;
        $ah=(($vals[$i-1]+$vals[$i])/2/$maxV)*$cH*0.92;
        [$r,$g,$b]=wl2rgb((int)(($wl+$wls[$i-1])/2));
        $lr=min(255,(int)(200+($r-200)*0.4)); $lg=min(255,(int)(200+($g-200)*0.4)); $lb=min(255,(int)(200+($b-200)*0.4));
        $pdf->SetFillColor(max(0,$lr),max(0,$lg),max(0,$lb));
        $pdf->Rect($x1,$cY+$cH-$ah,max(0.1,$x2-$x1),$ah,'F');
    }
    // curve
    $pdf->SetDrawColor(40,60,100); $pdf->SetLineWidth(0.5);
    $first=true;
    foreach($wls as $i=>$wl){
        $px=$cX+(($wl-$minWl)/$span)*$cW;
        $py=$cY+$cH-($vals[$i]/$maxV)*$cH*0.92;
        $pdf->_out(sprintf($first?'%.2f %.2f m':'%.2f %.2f l',$px*$pdf->k,($pdf->h-$py)*$pdf->k));
        $first=false;
    }
    $pdf->_out('S');
    $pdf->SetLineWidth(0.2);
}
$pdf->SetXY(10,$cY+$cH+8); $pdf->Ln(2);

// ── 3. CVG ────────────────────────────────────────────────────────────────────
$pdf->SectionHead('Color Vector Graphic (CVG)');
$vY=$pdf->GetY(); $vcx=52.0; $vcy=$vY+44; $rRef=34.0; $rIn=17.0;

$pdf->SetFillColor(248,250,252); $pdf->SetDrawColor(200,215,230);
$pdf->Circle($vcx,$vcy,$rRef+6,'DF');
$pdf->SetDrawColor(160,185,210); $pdf->SetLineWidth(0.3);
foreach([50,75,100,125] as $pct){
    $pdf->SetDrawColor($pct===100?[24,95,165]:[180,200,220]);
    $pdf->SetLineWidth($pct===100?0.5:0.2);
    $pdf->Circle($vcx,$vcy,$rRef*$pct/100,'D');
}
// radials
$pdf->SetDrawColor(220,228,238); $pdf->SetLineWidth(0.2);
for($a=0;$a<360;$a+=22.5){
    $rad=deg2rad($a);
    $pdf->Line($vcx+$rIn*cos($rad),$vcy-$rIn*sin($rad),$vcx+($rRef+5)*cos($rad),$vcy-($rRef+5)*sin($rad));
}
// vectors
$pdf->SetLineWidth(0.8);
for($h=0;$h<16;$h++){
    $rb=$rfBins[$h]??75;
    $binR=$rRef*($rb/100);
    $ang=deg2rad(90-$h*22.5);
    $tx=$vcx+$binR*cos($ang); $ty=$vcy-$binR*sin($ang);
    [$r,$g,$b]=hue2rgb($h*22.5);
    $pdf->SetDrawColor($r,$g,$b); $pdf->SetFillColor($r,$g,$b);
    $pdf->Line($vcx,$vcy,$tx,$ty);
    $pdf->Circle($tx,$ty,1.0,'F');
}
// centre
$pdf->SetFillColor(80,100,140); $pdf->Circle($vcx,$vcy,1.2,'F');
// Rg label
$pdf->SetFont('Arial','B',9); $pdf->SetTextColor(83,58,183);
$pdf->SetXY($vcx-15,$vY+1); $pdf->Cell(30,6,'Rg = '.($Rg??'—'),0,0,'C');

// bins table (right side)
$lx=108; $ly=$vY+4;
$pdf->SetFont('Arial','B',8); $pdf->SetTextColor(50,80,110);
$pdf->SetXY($lx,$ly); $pdf->Cell(0,5,'Per-hue Rf bins',0,1);
$pdf->SetFont('Arial','B',7); $pdf->SetFillColor(230,241,251);
$pdf->Cell(17,5,'Hue',1,0,'C',true); $pdf->Cell(10,5,'Rf',1,1,'C',true);
$pdf->SetFont('Arial','',7);
for($h=0;$h<16;$h++){
    $rb=round($rfBins[$h]??75);
    [$r,$g,$b]=$rb>=85?[59,109,17]:($rb>=70?[186,117,23]:[163,45,45]);
    $pdf->SetTextColor($r,$g,$b);
    $pdf->SetXY($lx,$pdf->GetY());
    $pdf->Cell(17,4.2,($h*22.5).'°–'.(($h+1)*22.5).'°',1,0,'C');
    $pdf->Cell(10,4.2,(string)$rb,1,1,'C');
}
$pdf->SetTextColor(30,30,30);
$pdf->SetY(max($pdf->GetY(),$vY+95));

// ── 4. Source info ────────────────────────────────────────────────────────────
$pdf->SectionHead('Source Information');
$pdf->SetFont('Arial','',8); $pdf->SetTextColor(50,70,90);
foreach([
    ['Label',       $row['label']],
    ['Type',        strtoupper($row['source_type'])],
    ['File',        $row['file_name']??'—'],
    ['Analyzed',    $row['created_at']],
    ['CCT',         $cct!==null?$cct.'K':'—'],
    ['Duv',         $duv!==null?(($duv>=0?'+':'').number_format($duv,4)):'—'],
    ['x, y',        ($cx!==null?number_format($cx,4):'—').', '.($cy2!==null?number_format($cy2,4):'—')],
] as [$k,$v]){
    $pdf->SetFont('Arial','B',8); $pdf->Cell(25,5,$k.':',0);
    $pdf->SetFont('Arial','',8); $pdf->Cell(0,5,$v,0,1);
}

// ── Output ────────────────────────────────────────────────────────────────────
$fname = preg_replace('/[^a-zA-Z0-9_-]/','_',$row['label']).'_TM30.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="'.$fname.'"');
header('Cache-Control: private, max-age=0');
$pdf->Output('I');

// ── Helpers ───────────────────────────────────────────────────────────────────
function wl2rgb(int $w): array {
    if($w<440)return[max(0,(int)(80+($w-380)*1.2)),0,min(255,(int)(120+($w-380)*1.8))];
    if($w<490)return[0,(int)(205*(($w-440)/50)),255];
    if($w<510)return[0,205,(int)(255*(1-($w-490)/20))];
    if($w<580)return[(int)(255*(($w-510)/70)),(int)(200+55*(1-($w-510)/70)),0];
    if($w<645)return[255,(int)(200*(1-($w-580)/65)),0];
    return[(int)(255*(1-($w-645)/135*0.3)),0,0];
}
function hue2rgb(float $h): array {
    return[max(20,min(235,(int)(140+sin(deg2rad($h))*90))),max(20,min(235,(int)(140+sin(deg2rad($h+120))*90))),max(20,min(235,(int)(140+sin(deg2rad($h+240))*90)))];
}
