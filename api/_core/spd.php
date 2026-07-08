<?php

// api/_core/spd.php

declare(strict_types=1);

const CMF_X=[0.001368,0.002236,0.004243,0.007650,0.014310,0.023190,0.043510,0.077630,0.134380,0.214770,0.283900,0.328500,0.348280,0.348060,0.336200,0.318700,0.290800,0.251100,0.195360,0.142100,0.095640,0.057950,0.032010,0.014700,0.004900,0.002400,0.009300,0.029100,0.063270,0.109600,0.165500,0.225750,0.290400,0.359700,0.433450,0.512050,0.594500,0.678400,0.762100,0.842500,0.916300,0.978600,1.026300,1.056700,1.062200,1.045600,1.002600,0.938400,0.854450,0.751400,0.642400,0.541900,0.447900,0.360800,0.283500,0.218700,0.164900,0.121200,0.087400,0.063600,0.046770,0.032900,0.022700,0.015840,0.011359,0.008111,0.005790,0.004109,0.002899,0.002049,0.001440,0.001000,0.000690,0.000476,0.000332,0.000235,0.000166,0.000117,0.000083,0.000059,0.000042];

const CMF_Y=[0.000039,0.000064,0.000120,0.000217,0.000396,0.000640,0.001210,0.002180,0.004000,0.007300,0.011600,0.016840,0.023000,0.029800,0.038000,0.048000,0.060000,0.073900,0.090980,0.112600,0.139020,0.169300,0.208020,0.258600,0.323000,0.407300,0.503000,0.608200,0.710000,0.793200,0.862000,0.914850,0.954000,0.980300,0.994950,1.000000,0.995000,0.978600,0.952000,0.915400,0.870000,0.816300,0.757000,0.694900,0.631000,0.566800,0.503000,0.441200,0.381000,0.321000,0.265000,0.217000,0.175000,0.138200,0.107000,0.081600,0.061000,0.044580,0.032000,0.023200,0.017000,0.011920,0.008210,0.005723,0.004102,0.002929,0.002091,0.001484,0.001047,0.000740,0.000520,0.000361,0.000249,0.000172,0.000120,0.000085,0.000060,0.000042,0.000030,0.000021,0.000015];

const CMF_Z=[0.006450,0.010550,0.020050,0.036210,0.067850,0.110200,0.207400,0.371300,0.645600,1.039050,1.385600,1.622960,1.747060,1.782600,1.772110,1.744100,1.669200,1.528100,1.287640,1.041900,0.812950,0.616200,0.465180,0.353300,0.272000,0.212300,0.158200,0.111700,0.078250,0.057250,0.042160,0.029840,0.020300,0.013400,0.008750,0.005750,0.003900,0.002750,0.002100,0.001800,0.001650,0.001400,0.001100,0.001000,0.000800,0.000600,0.000340,0.000240,0.000190,0.000100,0.000050,0.000030,0.000020,0.000010,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000,0.000000];

const ROBERTSON=[[0,0.18006,0.26352,-0.24341],[10,0.18066,0.26589,-0.25479],[20,0.18133,0.26846,-0.26876],[30,0.18208,0.27119,-0.28539],[40,0.18293,0.27407,-0.30470],[50,0.18388,0.27709,-0.32675],[60,0.18494,0.28021,-0.35156],[70,0.18611,0.28342,-0.37915],[80,0.18740,0.28668,-0.40955],[90,0.18880,0.28997,-0.44278],[100,0.19032,0.29326,-0.47888],[125,0.19462,0.30141,-0.58204],[150,0.19962,0.30921,-0.70471],[175,0.20525,0.31647,-0.84901],[200,0.21142,0.32312,-1.0182],[225,0.21807,0.32909,-1.2168],[250,0.22511,0.33439,-1.4512],[275,0.23247,0.33904,-1.7298],[300,0.24010,0.34308,-2.0637],[325,0.24792,0.34655,-2.4681],[350,0.25591,0.34951,-2.9641],[375,0.26400,0.35200,-3.5814],[400,0.27218,0.35407,-4.3633],[425,0.28039,0.35577,-5.3762],[450,0.28863,0.35714,-6.7262],[475,0.29685,0.35823,-8.5955],[500,0.30505,0.35907,-11.324],[525,0.31320,0.35968,-15.628],[550,0.32129,0.36011,-23.325],[575,0.32931,0.36038,-40.770],[600,0.33724,0.36051,-116.45]];

function interpolate_spd(array $wls, array $vals): array {

    $out=[];

    for($w=380;$w<=780;$w+=5){

        $lo=-1;

        for($i=0;$i<count($wls)-1;$i++){if($wls[$i]<=$w&&$wls[$i+1]>=$w){$lo=$i;break;}}

        if($lo===-1){$out[]=0.0;continue;}

        $t=($w-$wls[$lo])/($wls[$lo+1]-$wls[$lo]);

        $out[]=$vals[$lo]*(1-$t)+$vals[$lo+1]*$t;

    }

    return $out;

}

function spd_to_xyz(array $spd): array {

    $X=$Y=$Z=0.0;

    for($i=0;$i<81;$i++){$X+=$spd[$i]*CMF_X[$i];$Y+=$spd[$i]*CMF_Y[$i];$Z+=$spd[$i]*CMF_Z[$i];}

    return['X'=>$X,'Y'=>$Y,'Z'=>$Z];

}

function xyz_to_xy(array $xyz): array {

    $s=$xyz['X']+$xyz['Y']+$xyz['Z'];

    if($s==0)return['x'=>0.3333,'y'=>0.3333];

    return['x'=>$xyz['X']/$s,'y'=>$xyz['Y']/$s];

}

function xy_to_uv(float $x,float $y): array {

    $d=-2*$x+12*$y+3;

    return['u'=>4*$x/$d,'v'=>6*$y/$d];

}

function calc_cct(float $x,float $y): float {

    ['u'=>$u,'v'=>$v]=xy_to_uv($x,$y);

    $r=ROBERTSON;

    // Robertson 1968 correct formula: di = (v - v_i) - t_i*(u - u_i)

    for($i=1;$i<count($r);$i++){

        $di=($v-$r[$i][2])-$r[$i][3]*($u-$r[$i][1]);

        $pi=($v-$r[$i-1][2])-$r[$i-1][3]*($u-$r[$i-1][1]);

        if($pi*$di<=0||$i===count($r)-1){

            $f=$pi/($pi-$di);

            return 1e6/($r[$i-1][0]+$f*($r[$i][0]-$r[$i-1][0]));

        }

    }

    return 6504.0;

}

function cct_to_xy(float $T): ?array {

    if($T<1667||$T>25000)return null;

    $x=$T<=4000?-0.2661239e9/$T**3-0.2343580e6/$T**2+0.8776956e3/$T+0.179910:-3.0258469e9/$T**3+2.1070379e6/$T**2+0.2226347e3/$T+0.240390;

    $y=$T<=2222?-1.1063814*$x**3-1.34811020*$x**2+2.18555832*$x-0.20219683:($T<=4000?-0.9549476*$x**3-1.37418593*$x**2+2.09137015*$x-0.16748867:3.0817580*$x**3-5.87338670*$x**2+3.75112997*$x-0.37001483);

    return compact('x','y');

}

function calc_duv(float $x,float $y): float {

    ['u'=>$u,'v'=>$v]=xy_to_uv($x,$y);

    $cct=calc_cct($x,$y);

    $bb=cct_to_xy(max(1667.0,min(25000.0,$cct)));

    if(!$bb)return 0.0;

    ['u'=>$bu,'v'=>$bv]=xy_to_uv($bb['x'],$bb['y']);

    $dist=sqrt(($u-$bu)**2+($v-$bv)**2);

    return($v-$bv)>=0?$dist:-$dist;

}

function blackbody_spd(float $T): array {

    $h=6.626e-34;$c=3e8;$k=1.381e-23;

    return array_map(fn($i)=>(2*$h*$c*$c/((380+$i*5)*1e-9)**5)/(exp($h*$c/((380+$i*5)*1e-9*$k*$T))-1),range(0,80));

}

function xyz_to_lab(array $xyz,array $ref): array {

    $f=fn($t)=>$t>0.008856?$t**(1/3):7.787*$t+16/116;

    return['L'=>116*$f($xyz['Y']/$ref['Y'])-16,'a'=>500*($f($xyz['X']/$ref['X'])-$f($xyz['Y']/$ref['Y'])),'b'=>200*($f($xyz['Y']/$ref['Y'])-$f($xyz['Z']/$ref['Z']))];

}

function calc_rf_rg(array $spd, float $cct, array $instrumentMeta=[]): array {

    // ── TM-30-18 / CIE 2017 correct implementation ───────────────────────────

    // Uses: 99 CES reflectances, CIE 1964 10-degree CMFs,

    //       CIECAM02 → CAM02-UCS (Jp,ap,bp), area-based Rg.

    if (!function_exists('get_ces99')) require_once __DIR__ . '/ces_data.php';

    $ces = get_ces99();            // 99 × 81 reflectances

    $X10 = CMF10_X;

    $Y10 = CMF10_Y;

    $Z10 = CMF10_Z;

    // ── Build reference illuminant SPD ────────────────────────────────────────

    $__Tr = max(1667.0, min(25000.0, $cct));

    // TM-30 / CIE reference: Planckian <=4000K, CIE daylight >=5000K, blend between (each normalised to 1 at 560nm before blending).

    if ($__Tr <= 4000.0) { $ref = blackbody_spd($__Tr); }

    elseif ($__Tr >= 5000.0) { $ref = daylight_spd($__Tr); }

    else {

        $__p = blackbody_spd($__Tr); $__d = daylight_spd($__Tr); $__i560 = 36;

        $__pn = $__p[$__i560] > 0 ? array_map(fn($v) => $v / $__p[$__i560], $__p) : $__p;

        $__dn = $__d[$__i560] > 0 ? array_map(fn($v) => $v / $__d[$__i560], $__d) : $__d;

        $__w = ($__Tr - 4000.0) / 1000.0; $ref = [];

        for ($k = 0; $k < 81; $k++) $ref[$k] = (1.0 - $__w) * $__pn[$k] + $__w * $__dn[$k];

    }

    // ── Normalise SPDs so white Y=100 ────────────────────────────────────────

    // test

    $tYw = 0.0;

    for ($i=0;$i<81;$i++) $tYw += $spd[$i]*$Y10[$i];

    $tK  = $tYw > 0 ? 100.0/$tYw : 1.0;

    $spd_n = array_map(fn($v) => $v*$tK, $spd);

    // reference

    $rYw = 0.0;

    for ($i=0;$i<81;$i++) $rYw += $ref[$i]*$Y10[$i];

    $rK  = $rYw > 0 ? 100.0/$rYw : 1.0;

    $ref_n = array_map(fn($v) => $v*$rK, $ref);

    // ── White XYZ ─────────────────────────────────────────────────────────────

    $tWh = [0.0,0.0,0.0]; $rWh = [0.0,0.0,0.0];

    for ($i=0;$i<81;$i++) {

        $tWh[0]+=$spd_n[$i]*$X10[$i]; $tWh[1]+=$spd_n[$i]*$Y10[$i]; $tWh[2]+=$spd_n[$i]*$Z10[$i];

        $rWh[0]+=$ref_n[$i]*$X10[$i]; $rWh[1]+=$ref_n[$i]*$Y10[$i]; $rWh[2]+=$ref_n[$i]*$Z10[$i];

    }

    // ── CIECAM02 helper (Average surround, L_A=100, Y_b=20, D=1) ─────────────

    // Returns [J, M, h]

    $cam02 = function(array $XYZ, array $XYZ_w): array {

        // CIECAM02 implementation matching colour-science library exactly.

        // Ref: CIE 159:2004, Luo2013 (negative value handling)

        static $M_CAT02 = [

            [ 0.7328, 0.4296,-0.1624],

            [-0.7036, 1.6975, 0.0061],

            [ 0.0030, 0.0136, 0.9834],

        ];

        // M_HPE_x_CAT02_inv combined matrix (RGB_to_rgb shortcut)

        static $M_CAT02_INV = null;

        static $M_HPE = [

            [ 0.38971, 0.68898,-0.07868],

            [-0.22981, 1.18340, 0.04641],

            [ 0.00000, 0.00000, 1.00000],

        ];

        $mat3 = function(array $m, array $v): array {

            return [

                $m[0][0]*$v[0]+$m[0][1]*$v[1]+$m[0][2]*$v[2],

                $m[1][0]*$v[0]+$m[1][1]*$v[1]+$m[1][2]*$v[2],

                $m[2][0]*$v[0]+$m[2][1]*$v[1]+$m[2][2]*$v[2],

            ];

        };

        if ($M_CAT02_INV === null) {

            $m = $M_CAT02;

            $det = $m[0][0]*($m[1][1]*$m[2][2]-$m[1][2]*$m[2][1])

                  -$m[0][1]*($m[1][0]*$m[2][2]-$m[1][2]*$m[2][0])

                  +$m[0][2]*($m[1][0]*$m[2][1]-$m[1][1]*$m[2][0]);

            $i = 1.0/$det;

            $M_CAT02_INV = [

                [($m[1][1]*$m[2][2]-$m[1][2]*$m[2][1])*$i, ($m[0][2]*$m[2][1]-$m[0][1]*$m[2][2])*$i, ($m[0][1]*$m[1][2]-$m[0][2]*$m[1][1])*$i],

                [($m[1][2]*$m[2][0]-$m[1][0]*$m[2][2])*$i, ($m[0][0]*$m[2][2]-$m[0][2]*$m[2][0])*$i, ($m[0][2]*$m[1][0]-$m[0][0]*$m[1][2])*$i],

                [($m[1][0]*$m[2][1]-$m[1][1]*$m[2][0])*$i, ($m[0][1]*$m[2][0]-$m[0][0]*$m[2][1])*$i, ($m[0][0]*$m[1][1]-$m[0][1]*$m[1][0])*$i],

            ];

        }

        $L_A = 100.0; $Y_b = 20.0; $c = 0.69; $Nc = 1.0;

        $Y_w = $XYZ_w[1];

        // Viewing condition dependent parameters

        $k   = 1.0/(5.0*$L_A+1.0);

        $FL  = 0.2*$k**4*(5.0*$L_A)+0.1*(1.0-$k**4)**2*(5.0*$L_A)**(1.0/3.0);

        $n   = $Y_b/$Y_w;

        $z   = 1.48 + sqrt($n);                    // CORRECT: sqrt(n), not sqrt(50*n)

        $Nbb = 0.725*(1.0/$n)**0.2;

        $Ncb = $Nbb;

        // post-adaptation non-linear response compression (Luo2013 sign handling)

        $adapt = function(float $v) use ($FL): float {

            $sign = $v >= 0.0 ? 1.0 : -1.0;

            $vF   = abs($v) * $FL / 100.0;

            $vF42 = $vF ** 0.42;

            return $sign * 400.0 * $vF42 / ($vF42 + 27.13) + 0.1;

        };

        // Chromatic adaptation: D=1 (discount_illuminant=True)

        $RGB_w = $mat3($M_CAT02, $XYZ_w);

        $Dr = $Y_w/$RGB_w[0]; $Dg = $Y_w/$RGB_w[1]; $Db = $Y_w/$RGB_w[2];

        // White: RGB_to_rgb(RGBwc) where RGBwc = [Y_w, Y_w, Y_w]

        $RGBwc = [$Y_w, $Y_w, $Y_w];

        $XYZwc = $mat3($M_CAT02_INV, $RGBwc);

        $RGB_pw = $mat3($M_HPE, $XYZwc);

        $Ra_w=$adapt($RGB_pw[0]); $Ga_w=$adapt($RGB_pw[1]); $Ba_w=$adapt($RGB_pw[2]);

        $A_w = $Nbb*(2.0*$Ra_w + $Ga_w + 0.05*$Ba_w - 0.305);

        // Sample

        $RGB  = $mat3($M_CAT02, $XYZ);

        $RGBc = [$Dr*$RGB[0], $Dg*$RGB[1], $Db*$RGB[2]];

        $XYZc = $mat3($M_CAT02_INV, $RGBc);

        $RGB_p = $mat3($M_HPE, $XYZc);

        $Ra=$adapt($RGB_p[0]); $Ga=$adapt($RGB_p[1]); $Ba=$adapt($RGB_p[2]);

        // Opponent channels

        $a = $Ra - 12.0*$Ga/11.0 + $Ba/11.0;

        $b = ($Ra + $Ga - 2.0*$Ba)/9.0;

        $h = fmod(rad2deg(atan2($b, $a)) + 360.0, 360.0);

        // Eccentricity factor e_t (CIECAM02 eq. 16)

        $e_t = 0.25*(cos(deg2rad($h) + 2.0) + 3.8);

        // Achromatic response and J

        $A = $Nbb*(2.0*$Ra + $Ga + 0.05*$Ba - 0.305);

        $J = 100.0 * ($A/$A_w)**($c*$z);

        // t (temporary magnitude), Chroma C, Colourfulness M

        $t_den = $Ra + $Ga + 21.0/20.0*$Ba;

        $t = $t_den > 0

            ? (50000.0/13.0 * $Nc * $Ncb * $e_t * sqrt($a**2+$b**2)) / $t_den

            : 0.0;

        $C = $t**0.9 * sqrt($J/100.0) * (1.64 - 0.29**$n)**0.73;

        $M = $C * $FL**0.25;

        return [$J, $M, $h];

    };

    // ── CAM02-UCS conversion ──────────────────────────────────────────────────

    $to_Jpapbp = function(array $JMh): array {

        [$J, $M, $h] = $JMh;

        $Jp = (1.0 + 100.0*0.007) * $J / (1.0 + 0.007*$J);

        $Mp = (1.0/0.0228) * log(1.0 + 0.0228*$M);

        $h_r = deg2rad($h);

        return [$Jp, $Mp*cos($h_r), $Mp*sin($h_r)];

    };

    // ── Compute Jp,ap,bp for all 99 CES ──────────────────────────────────────

    $test_Jpapbp = []; $ref_Jpapbp = [];

    $dEs = []; $ref_hues = [];

    foreach ($ces as $ces_r) {

        // XYZ for test × CES

        $tX=0;$tY=0;$tZ=0; $rX=0;$rY=0;$rZ=0;

        for ($i=0;$i<81;$i++) {

            $tc=$spd_n[$i]*$ces_r[$i]; $rc=$ref_n[$i]*$ces_r[$i];

            $tX+=$tc*$X10[$i]; $tY+=$tc*$Y10[$i]; $tZ+=$tc*$Z10[$i];

            $rX+=$rc*$X10[$i]; $rY+=$rc*$Y10[$i]; $rZ+=$rc*$Z10[$i];

        }

        $tJpapbp = $to_Jpapbp($cam02([$tX,$tY,$tZ], $tWh));

        $rJpapbp = $to_Jpapbp($cam02([$rX,$rY,$rZ], $rWh));

        $test_Jpapbp[] = $tJpapbp; $test_XYZ[] = [$tX,$tY,$tZ];

        $ref_Jpapbp[]  = $rJpapbp; $ref_XYZ[] = [$rX,$rY,$rZ];

        $dE = sqrt(($tJpapbp[0]-$rJpapbp[0])**2+($tJpapbp[1]-$rJpapbp[1])**2+($tJpapbp[2]-$rJpapbp[2])**2);

        $dEs[] = $dE;

        // Reference hue angle for bin assignment

        $ref_hues[] = fmod(rad2deg(atan2($rJpapbp[2],$rJpapbp[1]))+360.0, 360.0);

    }

    // ── Overall Rf ────────────────────────────────────────────────────────────

    $meanDE = array_sum($dEs) / 99.0;

    $Rf = (int)round(min(100.0, 10.0*log(exp((100.0-6.73*$meanDE)/10.0)+1.0)));

    // ── Bin assignments (by reference hue angle) ──────────────────────────────

    $bins = array_map(fn($h) => (int)floor($h/22.5)%16, $ref_hues);

    // ── Per-bin averages of ap,bp ─────────────────────────────────────────────

    $test_avg = array_fill(0, 16, [0.0, 0.0]);

    $ref_avg  = array_fill(0, 16, [0.0, 0.0]);

    $bin_counts = array_fill(0, 16, 0); $test_avgJ = array_fill(0, 16, 0.0); $ref_avgJ = array_fill(0, 16, 0.0); $txyz = array_fill(0,16,[0.0,0.0,0.0]); $rxyz = array_fill(0,16,[0.0,0.0,0.0]);

    foreach ($bins as $idx => $b) {

        $test_avg[$b][0] += $test_Jpapbp[$idx][1];

        $test_avg[$b][1] += $test_Jpapbp[$idx][2];

        $ref_avg[$b][0]  += $ref_Jpapbp[$idx][1];

        $ref_avg[$b][1]  += $ref_Jpapbp[$idx][2]; $test_avgJ[$b] += $test_Jpapbp[$idx][0]; $ref_avgJ[$b] += $ref_Jpapbp[$idx][0]; $txyz[$b][0]+=$test_XYZ[$idx][0];$txyz[$b][1]+=$test_XYZ[$idx][1];$txyz[$b][2]+=$test_XYZ[$idx][2];$rxyz[$b][0]+=$ref_XYZ[$idx][0];$rxyz[$b][1]+=$ref_XYZ[$idx][1];$rxyz[$b][2]+=$ref_XYZ[$idx][2];

        $bin_counts[$b]++;

    }

    for ($b=0;$b<16;$b++) {

        if ($bin_counts[$b]>0) {

            $test_avg[$b][0]/=$bin_counts[$b]; $test_avg[$b][1]/=$bin_counts[$b];

            $ref_avg[$b][0]/=$bin_counts[$b];  $ref_avg[$b][1]/=$bin_counts[$b]; $test_avgJ[$b]/=$bin_counts[$b]; $ref_avgJ[$b]/=$bin_counts[$b]; $txyz[$b][0]/=$bin_counts[$b];$txyz[$b][1]/=$bin_counts[$b];$txyz[$b][2]/=$bin_counts[$b];$rxyz[$b][0]/=$bin_counts[$b];$rxyz[$b][1]/=$bin_counts[$b];$rxyz[$b][2]/=$bin_counts[$b];

        }

    }

    // ── Rg = area ratio ───────────────────────────────────────────────────────

    $poly_area = function(array $pts): float {

        $n=count($pts); $area=0.0;

        for ($i=0;$i<$n;$i++) {

            $j=($i+1)%$n;

            $area+=$pts[$i][0]*$pts[$j][1]-$pts[$j][0]*$pts[$i][1];

        }

        return abs($area)/2.0;

    };

    $tArea = $poly_area($test_avg);

    $rArea = $poly_area($ref_avg);

    $Rg = $rArea > 0 ? (int)round(min(130.0, max(60.0, 100.0*$tArea/$rArea))) : 100;

    // ── Per-bin Rf (rfBins) ───────────────────────────────────────────────────

    $rfBins = []; $rcsBins = []; $rhsBins = []; $rlsBins = []; $binRgb=[]; $binRgbRef=[]; $D65=[0.95047,1.0,1.08883]; $xyz2rgb=function($XYZ,$Wh)use($D65){ $wx=$Wh[0]>1e-6?$Wh[0]:1.0;$wy=$Wh[1]>1e-6?$Wh[1]:1.0;$wz=$Wh[2]>1e-6?$Wh[2]:1.0; $ex=1.25; $X=$XYZ[0]/$wx*$D65[0]*$ex; $Y=$XYZ[1]/$wy*$D65[1]*$ex; $Z=$XYZ[2]/$wz*$D65[2]*$ex; $r=3.2406*$X-1.5372*$Y-0.4986*$Z; $g=-0.9689*$X+1.8758*$Y+0.0415*$Z; $b=0.0557*$X-0.2040*$Y+1.0570*$Z; $gm=function($c){$c=max(0.0,min(1.0,$c));return $c<=0.0031308?12.92*$c:1.055*pow($c,1/2.4)-0.055;}; return sprintf('rgb(%d,%d,%d)',(int)round($gm($r)*255),(int)round($gm($g)*255),(int)round($gm($b)*255)); };

    $bin_dEs = array_fill(0, 16, []); $bin_cnts = array_fill(0, 16, 0);

    foreach ($bins as $idx => $b) { $bin_dEs[$b][] = $dEs[$idx]; }

    for ($b=0;$b<16;$b++) {

        $bDE = count($bin_dEs[$b])>0 ? array_sum($bin_dEs[$b])/count($bin_dEs[$b]) : $meanDE;

        $rfBins[] = max(0.0, min(100.0, 10.0*log(exp((100.0-6.73*$bDE)/10.0)+1.0)));

        // Chroma and hue shifts per bin from avg ap,bp

        $tC = sqrt($test_avg[$b][0]**2+$test_avg[$b][1]**2);

        $rC = sqrt($ref_avg[$b][0]**2+$ref_avg[$b][1]**2);

        $rcsBins[] = $rC > 0.5 ? round(($tC-$rC)/$rC, 4) : 0.0;

        $tH = atan2($test_avg[$b][1], $test_avg[$b][0]);

        $rH = atan2($ref_avg[$b][1],  $ref_avg[$b][0]);

        $dH = $tH - $rH;

        if ($dH >  M_PI) $dH -= 2*M_PI;

        if ($dH < -M_PI) $dH += 2*M_PI;

        $rhsBins[] = round(rad2deg($dH), 3); $rlsBins[] = round($test_avgJ[$b] - $ref_avgJ[$b], 3); $binRgb[] = $bin_counts[$b]>0 ? $xyz2rgb($txyz[$b],$tWh) : 'rgb(120,120,120)'; $binRgbRef[] = $bin_counts[$b]>0 ? $xyz2rgb($rxyz[$b],$rWh) : 'rgb(120,120,120)';

    }

    // ── Per-sample Rf (99 CES) for detailed drill-down view ────────────────────

    $rfSamples = []; $sampleHues = [];

    foreach ($dEs as $idx => $dE) {

        $rfSamples[] = max(0.0, min(100.0, 10.0*log(exp((100.0-6.73*$dE)/10.0)+1.0)));

        $sampleHues[] = $ref_hues[$idx];

    }

    return [

        'Rf'      => $Rf,

        'Rg'      => $Rg,

        'rfBins'  => array_values($rfBins  ?? []),

        'rcsBins' => array_values($rcsBins ?? []),

        'rhsBins' => array_values($rhsBins ?? []), 'rlsBins' => array_values($rlsBins ?? []), 'binRgb' => array_values($binRgb ?? []), 'binRgbRef' => array_values($binRgbRef ?? []), 'rfSamples' => array_values($rfSamples ?? []), 'sampleHues' => array_values($sampleHues ?? []),

    ];

}

/**

 * Parse JSON SPD format (e.g. open-source spectrometer output).

 * Handles formats with:

 *   - "spd": {"wavelength": value, ...}

 *   - "metrics": {"cct": ..., "duv": ..., "ra": ..., "r9": ...}

 *   - "wavelengths_raw" + "spd_raw" arrays

 */

/**

 * Parse Argyll CMS CGATS .sp spectral format.

 * Used by ArgyllCMS, ArgyllPRO ColorMeter, and compatible tools.

 */

function parse_cgats_sp(string $text): array {

    $lines = preg_split('/\r?\n/', $text);

    $wls   = [];

    $vals  = [];

    $meta  = [];

    $inDataFormat = false;

    $inData       = false;

    $headers      = [];

    // Extract metadata fields

    foreach ($lines as $line) {

        $line = trim($line);

        if (preg_match('/^(\w+)\s+"?([^"]+)"?$/', $line, $m)) {

            $key = strtolower($m[1]);

            $val = trim($m[2], '"');

            $meta['cgats_' . $key] = $val;

        }

        if ($line === 'BEGIN_DATA_FORMAT') { $inDataFormat = true; continue; }

        if ($line === 'END_DATA_FORMAT')   { $inDataFormat = false; continue; }

        if ($line === 'BEGIN_DATA')        { $inData = true; continue; }

        if ($line === 'END_DATA')          { $inData = false; continue; }

        if ($inDataFormat && !empty($line)) {

            $headers = preg_split('/\s+/', $line);

        }

        if ($inData && !empty($line) && !empty($headers)) {

            $values = preg_split('/\s+/', trim($line));

            foreach ($headers as $i => $hdr) {

                if (preg_match('/^SPEC_(\d+(?:\.\d+)?)$/', $hdr, $m)) {

                    $wl = (float)$m[1];

                    $v  = isset($values[$i]) ? (float)$values[$i] : 0.0;

                    if ($wl >= 350 && $wl <= 850) {

                        $wls[]  = $wl;

                        $vals[] = $v;

                    }

                }

            }

        }

    }

    if (count($wls) < 10) {

        throw new \RuntimeException('Could not parse CGATS .sp file — no SPEC_xxx wavelength columns found.');

    }

    // Extract instrument metadata if available

    $instMeta = [];

    if (!empty($meta['cgats_descriptor'])) {

        $instMeta['descriptor'] = $meta['cgats_descriptor'];

        $instMeta['instrument_model'] = $meta['cgats_descriptor'];

    }

    // Store all CGATS header fields as raw_headers

    $rawHeaders = [];

    foreach ($meta as $k => $v) {

        $label = str_replace('cgats_', '', $k);

        $rawHeaders[$label] = $v;

    }

    if (!empty($rawHeaders)) $instMeta['raw_headers'] = $rawHeaders;

    return ['wls' => $wls, 'vals' => $vals, 'instrument_meta' => $instMeta];

}

function parse_json_spd(string $text): array {

    $data = json_decode($text, true);

    if (!$data) throw new \RuntimeException('Invalid JSON file');

    $wls  = [];

    $vals = [];

    $meta = [];

    // Format 1: "spd" object with wavelength keys

    if (isset($data['spd']) && is_array($data['spd'])) {

        foreach ($data['spd'] as $wl => $val) {

            $w = (float)$wl;

            if ($w >= 350 && $w <= 850) {

                $wls[]  = $w;

                $vals[] = (float)$val;

            }

        }

    }

    // Format 2: parallel arrays wavelengths_raw + spd_raw

    elseif (isset($data['wavelengths_raw']) && isset($data['spd_raw'])) {

        foreach ($data['wavelengths_raw'] as $i => $wl) {

            $w = (float)$wl;

            if ($w >= 350 && $w <= 850) {

                $wls[]  = $w;

                $vals[] = (float)($data['spd_raw'][$i] ?? 0);

            }

        }

    }

    // Format 3: flat array of [wavelength, value] pairs

    elseif (isset($data[0]) && is_array($data[0]) && count($data[0]) === 2) {

        foreach ($data as [$wl, $val]) {

            $w = (float)$wl;

            if ($w >= 350 && $w <= 850) {

                $wls[]  = $w;

                $vals[] = (float)$val;

            }

        }

    }

    if (count($wls) < 10) {

        throw new \RuntimeException('Could not find SPD data in JSON. Need wavelength/value pairs 350-850nm.');

    }

    // Extract metrics if present

    $m = $data['metrics'] ?? [];

    if (isset($m['cct']) && is_numeric($m['cct']) && $m['cct'] > 500 && $m['cct'] < 25000) {

        $meta['instrument_cct'] = (int)$m['cct'];

    }

    if (isset($m['duv']) && is_numeric($m['duv'])) {

        $meta['instrument_duv'] = (float)$m['duv'];

    }

    if (isset($m['ra']) && is_numeric($m['ra'])) {

        $meta['ra'] = (float)$m['ra'];

    }

    if (isset($m['r9']) && is_numeric($m['r9'])) {

        $meta['r9'] = (float)$m['r9'];

    }

    // Also check top-level fields some devices use

    if (empty($meta['instrument_cct']) && isset($data['cct']) && is_numeric($data['cct']) && $data['cct'] > 500 && $data['cct'] < 25000) {

        $meta['instrument_cct'] = (int)$data['cct'];

    }

    // Store all non-SPD top-level fields as raw_headers

    $skipKeys = ['spd', 'wavelengths_raw', 'spd_raw', 'metrics'];

    $rawHeaders = [];

    foreach ($data as $k => $v) {

        if (!in_array($k, $skipKeys) && !is_array($v)) {

            $rawHeaders[(string)$k] = (string)$v;

        }

    }

    // Include metrics fields too

    foreach ($m as $k => $v) {

        $rawHeaders['metrics.' . $k] = (string)$v;

    }

    if (!empty($rawHeaders)) $meta['raw_headers'] = $rawHeaders;

    // Extract model/device info

    foreach (['model','device','instrument','meter','make','manufacturer'] as $field) {

        if (!empty($data[$field])) { $meta['instrument_model'] = (string)$data[$field]; break; }

        if (!empty($data['metrics'][$field])) { $meta['instrument_model'] = (string)$data['metrics'][$field]; break; }

    }

    return ['wls' => $wls, 'vals' => $vals, 'instrument_meta' => $meta];

}

function strip_trailing_blocks(array $wls, array $vals): array {

    // Remove any reset/duplicate blocks appearing after the spectrum's maximum

    // wavelength (e.g. trailing zero padding from multi-scan exports). Keeps only

    // the first contiguous ascending-wavelength block.

    $n = count($wls);

    for ($i = 1; $i < $n; $i++) {

        if ((float)$wls[$i] < (float)$wls[$i - 1]) {

            return [array_slice($wls, 0, $i), array_slice($vals, 0, $i)];

        }

    }

    return [$wls, $vals];

}

function parse_csv(string $text): array {

    // ── Detect JSON format ────────────────────────────────────────────────────

    $trimmed = trim($text);

    if (str_starts_with($trimmed, '{') || str_starts_with($trimmed, '[')) {

        return parse_json_spd($text);

    }

    // ── Detect Argyll CGATS .sp format ───────────────────────────────────────

    if (str_contains($trimmed, 'BEGIN_DATA_FORMAT') || str_contains($trimmed, 'SPECTRAL_BANDS')) {

        return parse_cgats_sp($text);

    }

    $lines = preg_split('/\r?\n/', $trimmed);

    $wls   = [];

    $vals  = [];

    $meta  = [];  // pre-computed metrics from instrument header

    $rawHeaders = [];

    foreach ($lines as $line) {

        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) continue;

        $parts = preg_split('/[\t,]+/', $line, 3);

        if (count($parts) < 2) continue;

        $col0 = trim($parts[0]);

        $col1 = trim($parts[1]);

        // Check if first column is a pure number (wavelength)

        if (is_numeric($col0) && is_numeric($col1)) {

            $w = (float)$col0;

            $v = (float)$col1;

            if ($w >= 350 && $w <= 850) {

                $wls[]  = $w;

                $vals[] = $v;

            }

            continue;

        }

        // Otherwise treat as metadata key,value

        if ($col0 !== '') $rawHeaders[$col0] = $col1;  // store raw

        $key = strtolower(preg_replace('/[^a-z0-9]/i', '', $col0));

        $val = $col1;

        // Extract known metrics from instrument headers

        // Match loosely — strip everything except letters and digits, lowercase

        // CCT(K) -> cctk, Duv -> duv, Ra -> ra, R9 -> r9, x -> x, y -> y

        switch (true) {

            case preg_match('/^cct/', $key):

                // Matches: cct, cctk, cctK

                if (is_numeric($val)) $meta['instrument_cct'] = (int)$val;

                break;

            case $key === 'duv':

                if (is_numeric($val)) $meta['instrument_duv'] = (float)$val;

                break;

            case $key === 'x':

                // Only CIE x chromaticity (0.1–0.6 range, not u/v which can be similar)

                if (is_numeric($val) && (float)$val >= 0.1 && (float)$val <= 0.6)

                    $meta['instrument_x'] = (float)$val;

                break;

            case $key === 'y':

                // Only CIE y chromaticity

                if (is_numeric($val) && (float)$val >= 0.1 && (float)$val <= 0.6)

                    $meta['instrument_y'] = (float)$val;

                break;

            // Skip u, v, u', v' — they get normalized to 'u'/'v' and conflict with x/y

            case $key === 'u':

            case $key === 'v':

                break;

            case $key === 'ra':

                if (is_numeric($val)) $meta['ra'] = (float)$val;

                break;

            case $key === 'r9':

                if (is_numeric($val)) $meta['r9'] = (float)$val;

                break;

            case preg_match('/^r(\d+)$/', $key, $rm):

                // R1–R15 individual CRI values

                if (is_numeric($val)) $meta['r' . $rm[1]] = (float)$val;

                break;

            case $key === 'model':

                // Instrument model e.g. "HPCS-330-1298258"

                if ($val !== '') $meta['instrument_model'] = $val;

                break;

            case $key === 'version':

                // Firmware/software version

                if ($val !== '') $meta['instrument_version'] = $val;

                break;

            case in_array($key, ['make','manufacturer','brand','device','instrument','meter']):

                if ($val !== '') $meta['instrument_make'] = $val;

                break;

        }

    }

    // Store ALL raw header key-value pairs for display

    $meta['raw_headers'] = $rawHeaders;

    [$wls, $vals] = strip_trailing_blocks($wls, $vals);

    if (count($wls) < 10) {

        throw new \RuntimeException('Need ≥10 wavelength/value pairs (350–830 nm). Found ' . count($wls) . ' spectral data points.');

    }

    return ['wls' => $wls, 'vals' => $vals, 'instrument_meta' => $meta];

}

// ── CIE 13.3 CRI helpers ────────────────────────────────────────────────────

function cri_xyz_to_uv(array $xyz): array {

    $d = $xyz['X'] + 15*$xyz['Y'] + 3*$xyz['Z'];

    if ($d == 0) return ['u'=>0.2009,'v'=>0.3220];

    return ['u'=>4*$xyz['X']/$d, 'v'=>6*$xyz['Y']/$d];

}

// CIE 13.3 Von Kries chromatic adaptation in CIE 1960 UCS

// Adapts XYZ measured under test illuminant to reference illuminant white point

function cri_adapt_xyz(array $xyz, array $testWhiteUV, array $refWhiteUV): array {

    $tw_u=$testWhiteUV['u']; $tw_v=$testWhiteUV['v'];

    $rw_u=$refWhiteUV['u'];  $rw_v=$refWhiteUV['v'];

    // Convert XYZ to uv

    $d = $xyz['X'] + 15*$xyz['Y'] + 3*$xyz['Z'];

    if ($d == 0) return $xyz;

    $u = 4*$xyz['X']/$d;

    $v = 6*$xyz['Y']/$d;

    // CIE 13.3 adaptation coefficients

    $c  = fn($u,$v) => $tw_v > 0 ? (4.0 - $u - 10.0*$v) / $v : 0.0;

    $d_ = fn($u,$v) => $tw_v > 0 ? (1.708*$v + 0.404 - 1.481*$u) / $v : 0.0;

    $c_t  = ($tw_v > 0) ? (4.0 - $tw_u - 10.0*$tw_v) / $tw_v : 0.0;

    $d_t  = ($tw_v > 0) ? (1.708*$tw_v + 0.404 - 1.481*$tw_u) / $tw_v : 0.0;

    $c_r  = ($rw_v > 0) ? (4.0 - $rw_u - 10.0*$rw_v) / $rw_v : 0.0;

    $d_r  = ($rw_v > 0) ? (1.708*$rw_v + 0.404 - 1.481*$rw_u) / $rw_v : 0.0;

    $c_s  = ($v > 0) ? (4.0 - $u - 10.0*$v) / $v : 0.0;

    $d_s  = ($v > 0) ? (1.708*$v + 0.404 - 1.481*$u) / $v : 0.0;

    // Adapted uv

    $u_a_num = 10.872 + 0.404 * ($c_r/$c_t) * $c_s - 4.0 * ($d_r/$d_t) * $d_s;

    $u_a_den = 16.518 + 1.481 * ($c_r/$c_t) * $c_s - ($d_r/$d_t) * $d_s;

    $u_a = ($u_a_den != 0) ? $u_a_num / $u_a_den : $u;

    $v_a_num = 5.520;

    $v_a_den = 16.518 + 1.481 * ($c_r/$c_t) * $c_s - ($d_r/$d_t) * $d_s;

    $v_a = ($v_a_den != 0) ? $v_a_num / $v_a_den : $v;

    // Back to XYZ

    $Y = $xyz['Y'];

    if ($v_a == 0) return $xyz;

    $X = $Y * 9.0 * $u_a / (4.0 * $v_a);

    $Z = $Y * (12.0 - 3.0*$u_a - 20.0*$v_a) / (4.0 * $v_a);

    return ['X'=>max(0.0,$X), 'Y'=>max(0.0,$Y), 'Z'=>max(0.0,$Z)];

}

// CIE 1964 W*U*V* uniform color space

function cri_xyz_to_wuv(array $xyz, array $white): array {

    $d0 = $white['X'] + 15*$white['Y'] + 3*$white['Z'];

    if ($d0 == 0) return ['W'=>0,'U'=>0,'V'=>0];

    $u0 = 4*$white['X']/$d0;

    $v0 = 6*$white['Y']/$d0;

    $d  = $xyz['X'] + 15*$xyz['Y'] + 3*$xyz['Z'];

    if ($d == 0) return ['W'=>0,'U'=>0,'V'=>0];

    $u = 4*$xyz['X']/$d;

    $v = 6*$xyz['Y']/$d;

    // W* requires Y normalised to 0-100 (Y_white = 100)

    $Yn = max(1e-6, $white['Y']);

    $W = 25.0 * pow(max(0.0, $xyz['Y'] / $Yn * 100.0), 1.0/3.0) - 17.0;

    $U = 13.0 * $W * ($u - $u0);

    $V = 13.0 * $W * ($v - $v0);

    return compact('W','U','V');

}

/**

 * CIE 13.3 TCS reflectances (9 samples, 81 values each at 5nm 380-780nm).

 */

function get_tcs_reflectances(): array {

    // Exact CIE 13.3-1995 TCS reflectances, 5nm steps, 380-780nm (81 values each)

    return [

        1 => [0.2190,0.2390,0.2520,0.2560,0.2560,0.2540,0.2520,0.2480,0.2440,0.2400,0.2370,0.2320,0.2300,0.2260,0.2250,0.2220,0.2200,0.2180,0.2160,0.2140,0.2140,0.2140,0.2160,0.2180,0.2230,0.2250,0.2260,0.2260,0.2250,0.2250,0.2270,0.2300,0.2360,0.2450,0.2530,0.2620,0.2720,0.2830,0.2980,0.3180,0.3410,0.3670,0.3900,0.4090,0.4240,0.4350,0.4420,0.4480,0.4500,0.4510,0.4510,0.4510,0.4510,0.4510,0.4500,0.4500,0.4510,0.4510,0.4530,0.4540,0.4550,0.4570,0.4580,0.4600,0.4620,0.4630,0.4640,0.4650,0.4660,0.4660,0.4660,0.4660,0.4670,0.4670,0.4670,0.4670,0.4670,0.4670,0.4670,0.4670,0.4670],

        2 => [0.0700,0.0790,0.0890,0.1010,0.1110,0.1160,0.1180,0.1200,0.1210,0.1220,0.1220,0.1220,0.1230,0.1240,0.1270,0.1280,0.1310,0.1340,0.1380,0.1430,0.1500,0.1590,0.1740,0.1900,0.2070,0.2250,0.2420,0.2530,0.2600,0.2640,0.2670,0.2690,0.2720,0.2760,0.2820,0.2890,0.2990,0.3090,0.3220,0.3290,0.3350,0.3390,0.3410,0.3410,0.3420,0.3420,0.3420,0.3410,0.3410,0.3390,0.3390,0.3380,0.3380,0.3370,0.3360,0.3350,0.3340,0.3320,0.3320,0.3310,0.3310,0.3300,0.3290,0.3280,0.3280,0.3270,0.3260,0.3250,0.3240,0.3240,0.3240,0.3230,0.3220,0.3210,0.3200,0.3180,0.3160,0.3150,0.3150,0.3140,0.3140],

        3 => [0.0650,0.0680,0.0700,0.0720,0.0730,0.0730,0.0740,0.0740,0.0740,0.0730,0.0730,0.0730,0.0730,0.0730,0.0740,0.0750,0.0770,0.0800,0.0850,0.0940,0.1090,0.1260,0.1480,0.1720,0.1980,0.2210,0.2410,0.2600,0.2780,0.3020,0.3390,0.3700,0.3920,0.3990,0.4000,0.3930,0.3800,0.3650,0.3490,0.3320,0.3150,0.2990,0.2850,0.2720,0.2640,0.2570,0.2520,0.2470,0.2410,0.2350,0.2290,0.2240,0.2200,0.2170,0.2160,0.2160,0.2190,0.2240,0.2300,0.2380,0.2510,0.2690,0.2880,0.3120,0.3400,0.3660,0.3900,0.4120,0.4310,0.4470,0.4600,0.4720,0.4810,0.4880,0.4930,0.4970,0.5000,0.5020,0.5050,0.5100,0.5160],

        4 => [0.0740,0.0830,0.0930,0.1050,0.1160,0.1210,0.1240,0.1260,0.1280,0.1310,0.1350,0.1390,0.1440,0.1510,0.1610,0.1720,0.1860,0.2050,0.2290,0.2540,0.2810,0.3080,0.3320,0.3520,0.3700,0.3830,0.3900,0.3940,0.3950,0.3920,0.3850,0.3770,0.3670,0.3540,0.3410,0.3270,0.3120,0.2960,0.2800,0.2630,0.2470,0.2290,0.2140,0.1980,0.1850,0.1750,0.1690,0.1640,0.1600,0.1560,0.1540,0.1520,0.1510,0.1490,0.1480,0.1480,0.1480,0.1490,0.1510,0.1540,0.1580,0.1620,0.1650,0.1680,0.1700,0.1710,0.1700,0.1680,0.1660,0.1640,0.1640,0.1650,0.1680,0.1720,0.1770,0.1810,0.1850,0.1890,0.1920,0.1940,0.1970],

        5 => [0.2950,0.3060,0.3100,0.3120,0.3130,0.3150,0.3190,0.3220,0.3260,0.3300,0.3340,0.3390,0.3460,0.3520,0.3600,0.3690,0.3810,0.3940,0.4030,0.4100,0.4150,0.4180,0.4190,0.4170,0.4130,0.4090,0.4030,0.3960,0.3890,0.3810,0.3720,0.3630,0.3530,0.3420,0.3310,0.3200,0.3080,0.2960,0.2840,0.2710,0.2600,0.2470,0.2320,0.2200,0.2100,0.2000,0.1940,0.1890,0.1850,0.1830,0.1800,0.1770,0.1760,0.1750,0.1750,0.1750,0.1750,0.1770,0.1800,0.1830,0.1860,0.1890,0.1920,0.1950,0.1990,0.2000,0.1990,0.1980,0.1960,0.1950,0.1950,0.1960,0.1970,0.2000,0.2030,0.2050,0.2080,0.2120,0.2150,0.2170,0.2190],

        6 => [0.1510,0.2030,0.2650,0.3390,0.4100,0.4640,0.4920,0.5080,0.5170,0.5240,0.5310,0.5380,0.5440,0.5510,0.5560,0.5560,0.5540,0.5490,0.5410,0.5310,0.5190,0.5040,0.4880,0.4690,0.4500,0.4310,0.4140,0.3950,0.3770,0.3580,0.3410,0.3250,0.3090,0.2930,0.2790,0.2650,0.2530,0.2410,0.2340,0.2270,0.2250,0.2220,0.2210,0.2200,0.2200,0.2200,0.2200,0.2200,0.2230,0.2270,0.2330,0.2390,0.2440,0.2510,0.2580,0.2630,0.2680,0.2730,0.2780,0.2810,0.2830,0.2860,0.2910,0.2960,0.3020,0.3130,0.3250,0.3380,0.3510,0.3640,0.3760,0.3890,0.4010,0.4130,0.4250,0.4360,0.4470,0.4580,0.4690,0.4770,0.4850],

        7 => [0.3780,0.4590,0.5240,0.5460,0.5510,0.5550,0.5590,0.5600,0.5610,0.5580,0.5560,0.5510,0.5440,0.5350,0.5220,0.5060,0.4880,0.4690,0.4480,0.4290,0.4080,0.3850,0.3630,0.3410,0.3240,0.3110,0.3010,0.2910,0.2830,0.2730,0.2650,0.2600,0.2570,0.2570,0.2590,0.2600,0.2600,0.2580,0.2560,0.2540,0.2540,0.2590,0.2700,0.2840,0.3020,0.3240,0.3440,0.3620,0.3770,0.3890,0.4000,0.4100,0.4200,0.4290,0.4380,0.4450,0.4520,0.4570,0.4620,0.4660,0.4680,0.4700,0.4730,0.4770,0.4830,0.4890,0.4960,0.5030,0.5110,0.5180,0.5250,0.5320,0.5390,0.5460,0.5530,0.5590,0.5650,0.5700,0.5750,0.5780,0.5810],

        8 => [0.1040,0.1290,0.1700,0.2400,0.3190,0.4160,0.4620,0.4820,0.4900,0.4880,0.4820,0.4730,0.4620,0.4500,0.4390,0.4260,0.4130,0.3970,0.3820,0.3660,0.3520,0.3370,0.3250,0.3100,0.2990,0.2890,0.2830,0.2760,0.2700,0.2620,0.2560,0.2510,0.2500,0.2510,0.2540,0.2580,0.2640,0.2690,0.2720,0.2740,0.2780,0.2840,0.2950,0.3160,0.3480,0.3840,0.4340,0.4820,0.5280,0.5680,0.6040,0.6290,0.6480,0.6630,0.6760,0.6850,0.6930,0.7000,0.7050,0.7090,0.7120,0.7150,0.7170,0.7190,0.7210,0.7200,0.7190,0.7220,0.7250,0.7270,0.7290,0.7300,0.7300,0.7300,0.7300,0.7300,0.7300,0.7300,0.7300,0.7300,0.7300],

        9 => [0.0660,0.0620,0.0580,0.0550,0.0520,0.0520,0.0510,0.0500,0.0500,0.0490,0.0480,0.0470,0.0460,0.0440,0.0420,0.0410,0.0380,0.0350,0.0330,0.0310,0.0300,0.0290,0.0280,0.0280,0.0280,0.0290,0.0300,0.0300,0.0310,0.0310,0.0320,0.0320,0.0330,0.0340,0.0350,0.0370,0.0410,0.0440,0.0480,0.0520,0.0600,0.0760,0.1020,0.1360,0.1900,0.2560,0.3360,0.4180,0.5050,0.5810,0.6410,0.6820,0.7170,0.7400,0.7580,0.7700,0.7810,0.7900,0.7970,0.8030,0.8090,0.8140,0.8190,0.8240,0.8280,0.8300,0.8310,0.8330,0.8350,0.8360,0.8360,0.8370,0.8380,0.8390,0.8390,0.8390,0.8390,0.8390,0.8390,0.8390,0.8390],

        // Special CRI samples R10-R15 (CIE 13.3-1995)

        10=> [0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.1840,0.2000,0.2140,0.3140,0.4560,0.5790,0.6580,0.7130,0.7570,0.7870,0.8100,0.8280,0.8450,0.8580,0.8680,0.8760,0.8840,0.8910,0.8970,0.9010,0.9040,0.9060,0.9080,0.9090,0.9100,0.9110,0.9110,0.9110,0.9120,0.9120,0.9120,0.9120,0.9120,0.9110,0.9100,0.9100,0.9090,0.9090,0.9090,0.9080,0.9070,0.9070,0.9060,0.9060,0.9050,0.9050,0.9050,0.9040,0.9040,0.9030,0.9030,0.9030,0.9020,0.9020,0.9020,0.9010,0.9010,0.9010,0.9010,0.9010,0.9000,0.9000],

        11=> [0.0710,0.0710,0.0710,0.0710,0.0720,0.0720,0.0720,0.0720,0.0720,0.0720,0.0720,0.0720,0.0720,0.0710,0.0710,0.0710,0.0700,0.0700,0.0690,0.0680,0.0680,0.0670,0.0660,0.0650,0.0640,0.0650,0.0680,0.0720,0.0790,0.0900,0.1080,0.1370,0.1820,0.2490,0.3360,0.4320,0.5180,0.5800,0.6230,0.6530,0.6770,0.6970,0.7130,0.7260,0.7380,0.7470,0.7540,0.7590,0.7620,0.7640,0.7660,0.7680,0.7700,0.7710,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7720,0.7710,0.7710,0.7710,0.7710,0.7710,0.7710,0.7700,0.7700,0.7700],

        12=> [0.1200,0.1030,0.0900,0.0820,0.0760,0.0680,0.0640,0.0650,0.0750,0.0930,0.1230,0.1600,0.2070,0.2560,0.3000,0.3310,0.3460,0.3470,0.3410,0.3280,0.3070,0.2820,0.2570,0.2300,0.2040,0.1780,0.1540,0.1290,0.1090,0.0900,0.0750,0.0620,0.0510,0.0410,0.0350,0.0290,0.0250,0.0220,0.0190,0.0170,0.0170,0.0170,0.0160,0.0160,0.0160,0.0160,0.0160,0.0160,0.0160,0.0160,0.0180,0.0180,0.0180,0.0180,0.0190,0.0200,0.0230,0.0240,0.0260,0.0300,0.0350,0.0430,0.0560,0.0740,0.0970,0.1280,0.1660,0.2100,0.2570,0.3050,0.3540,0.4010,0.4460,0.4850,0.5200,0.5510,0.5770,0.5990,0.6180,0.6330,0.6450],

        13=> [0.0500,0.0510,0.0510,0.0520,0.0530,0.0540,0.0560,0.0570,0.0590,0.0600,0.0620,0.0630,0.0650,0.0660,0.0680,0.0690,0.0710,0.0730,0.0760,0.0790,0.0840,0.0900,0.0980,0.1090,0.1230,0.1390,0.1570,0.1760,0.1960,0.2160,0.2350,0.2510,0.2660,0.2790,0.2900,0.2990,0.3070,0.3140,0.3200,0.3250,0.3290,0.3330,0.3360,0.3390,0.3410,0.3430,0.3450,0.3450,0.3460,0.3460,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3470,0.3480,0.3480,0.3490,0.3500,0.3510,0.3520,0.3530,0.3540,0.3550,0.3560,0.3570,0.3580,0.3590,0.3600,0.3610,0.3620,0.3630,0.3640],

        14=> [0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0600,0.0610,0.0620,0.0640,0.0680,0.0730,0.0820,0.1000,0.1340,0.1800,0.2360,0.2910,0.3380,0.3740,0.3990,0.4180,0.4320,0.4460,0.4580,0.4690,0.4790,0.4880,0.4950,0.5000,0.5030,0.5050,0.5060,0.5060,0.5060,0.5050,0.5040,0.5030,0.5010,0.4990,0.4970,0.4950,0.4930,0.4900,0.4880,0.4860,0.4830,0.4810,0.4780,0.4760,0.4740,0.4710,0.4690,0.4670,0.4650,0.4630,0.4610,0.4590,0.4580,0.4560,0.4550,0.4540,0.4520,0.4510,0.4500,0.4490,0.4480,0.4470,0.4460,0.4460,0.4450],

        15=> [0.0760,0.0800,0.0840,0.0900,0.0980,0.1070,0.1170,0.1290,0.1440,0.1610,0.1800,0.2000,0.2200,0.2380,0.2560,0.2710,0.2860,0.2980,0.3090,0.3190,0.3280,0.3360,0.3420,0.3470,0.3510,0.3540,0.3560,0.3580,0.3590,0.3600,0.3600,0.3600,0.3600,0.3590,0.3590,0.3580,0.3580,0.3570,0.3570,0.3560,0.3560,0.3550,0.3540,0.3540,0.3530,0.3520,0.3520,0.3510,0.3500,0.3500,0.3490,0.3490,0.3480,0.3480,0.3470,0.3470,0.3460,0.3460,0.3450,0.3450,0.3440,0.3440,0.3430,0.3430,0.3420,0.3420,0.3410,0.3410,0.3400,0.3400,0.3390,0.3390,0.3380,0.3380,0.3370,0.3370,0.3360,0.3360,0.3350,0.3350,0.3340],

    ];

}

// CIE daylight (D-series) illuminant reconstructed from CCT (S0+M1*S1+M2*S2).

// Returns 81 values (380-780nm, 5nm) to match blackbody_spd. CIE 13.3 uses this

// (not a Planckian) as the CRI reference for CCT >= 5000K.

function daylight_spd(float $cct): array {

    $T = max(4000.0, min(25000.0, $cct));

    if ($T <= 7000.0) {

        $xD = -4.6070e9/($T*$T*$T) + 2.9678e6/($T*$T) + 0.09911e3/$T + 0.244063;

    } else {

        $xD = -2.0064e9/($T*$T*$T) + 1.9018e6/($T*$T) + 0.24748e3/$T + 0.237040;

    }

    $yD = -3.000*$xD*$xD + 2.870*$xD - 0.275;

    $M  = 0.0241 + 0.2562*$xD - 0.7341*$yD;

    $M1 = (-1.3515 - 1.7703*$xD + 5.9114*$yD) / $M;

    $M2 = ( 0.0300 - 31.4424*$xD + 30.0717*$yD) / $M;

    $S0=[0.04,6.0,29.6,55.3,57.3,61.8,61.5,68.8,63.4,65.8,94.8,104.8,105.9,96.8,113.9,125.6,125.5,121.3,121.3,113.5,113.1,110.8,106.5,108.8,105.3,104.4,100.0,96.0,95.1,89.1,90.5,90.3,88.4,84.0,85.1,81.9,82.6,84.9,81.3,71.9,74.3,76.4,63.3,71.7,77.0,65.2,47.7,68.6,65.0,66.0,61.0,53.3,58.9,61.9];

    $S1=[0.02,4.5,22.4,42.0,40.6,41.6,38.0,42.4,38.5,35.0,43.4,46.3,43.9,37.1,36.7,35.9,32.6,27.9,24.3,20.1,16.2,13.2,8.6,6.1,4.2,1.9,0.0,-1.6,-3.5,-3.5,-5.8,-7.2,-8.6,-9.5,-10.9,-10.7,-12.0,-14.0,-13.6,-12.0,-13.3,-12.9,-10.6,-11.6,-12.2,-10.2,-7.8,-11.2,-10.4,-10.6,-9.7,-8.3,-9.3,-9.8];

    $S2=[0.0,2.0,4.0,8.5,7.8,6.7,5.3,6.1,2.0,1.2,-1.1,-0.5,-0.7,-1.2,-2.6,-2.9,-2.8,-2.6,-2.6,-1.8,-1.5,-1.3,-1.2,-1.0,-0.5,-0.3,0.0,0.2,0.5,2.1,3.2,4.1,4.7,5.1,6.7,7.3,8.6,9.8,10.2,8.3,9.6,8.5,7.0,7.6,8.0,6.7,5.2,7.4,6.8,7.0,6.4,5.5,6.1,6.5];

    $out = [];

    for ($w = 380; $w <= 780; $w += 5) {

        $idx = ($w - 300) / 10.0; $i = (int)floor($idx); $f = $idx - $i;

        $s0 = $S0[$i] + $f*($S0[$i+1]-$S0[$i]);

        $s1 = $S1[$i] + $f*($S1[$i+1]-$S1[$i]);

        $s2 = $S2[$i] + $f*($S2[$i+1]-$S2[$i]);

        $out[] = $s0 + $M1*$s1 + $M2*$s2;

    }

    return $out;

}

function calc_cri(array $spd, float $cct): array {

    $TCS = get_tcs_reflectances();

    $Tref = max(1667.0, min(25000.0, $cct));

    // CIE 13.3: Planckian reference below 5000K, CIE daylight at/above 5000K.

    $ref = $Tref >= 5000.0 ? daylight_spd($Tref) : blackbody_spd($Tref);

    $rMax = max($ref); if ($rMax > 0) $ref = array_map(fn($v) => $v/$rMax, $ref);

    // White points in CIE 1960 uv

    $tW = spd_to_xyz($spd); $rW = spd_to_xyz($ref);

    $tUV = cri_xyz_to_uv($tW); $rUV = cri_xyz_to_uv($rW);

    $u_t=$tUV['u']; $v_t=$tUV['v'];

    $u_r=$rUV['u']; $v_r=$rUV['v'];

    // k normalisation — scale Y so white = 100 (CIE 13.3 requirement for W*)

    $k_t = $tW['Y'] > 0 ? 100.0 / $tW['Y'] : 1.0;

    $k_r = $rW['Y'] > 0 ? 100.0 / $rW['Y'] : 1.0;

    // Chromatic adaptation coefficients for white points

    $c_t = $v_t > 0 ? (4.0-$u_t-10.0*$v_t)/$v_t : 0.0;

    $d_t = $v_t > 0 ? (1.708*$v_t+0.404-1.481*$u_t)/$v_t : 0.0;

    $c_r = $v_r > 0 ? (4.0-$u_r-10.0*$v_r)/$v_r : 0.0;

    $d_r = $v_r > 0 ? (1.708*$v_r+0.404-1.481*$u_r)/$v_r : 0.0;

    $Ri = [];

    for ($tcs = 1; $tcs <= 15; $tcs++) {

        $refl = $TCS[$tcs];

        // XYZ under test and reference

        $tXYZ = spd_to_xyz(array_map(fn($r,$s) => $r*$s, $refl, $spd));

        $rXYZ = spd_to_xyz(array_map(fn($r,$s) => $r*$s, $refl, $ref));

        // k-normalised Y (0-100 scale, white=100)

        $tY = $tXYZ['Y'] * $k_t;

        $rY = $rXYZ['Y'] * $k_r;

        // uv of TCS under test

        $tcsUV = cri_xyz_to_uv($tXYZ);

        $u_tcs=$tcsUV['u']; $v_tcs=$tcsUV['v'];

        // Chromatic adaptation (CIE 13.3 Von Kries)

        $c_tcs = $v_tcs > 0 ? (4.0-$u_tcs-10.0*$v_tcs)/$v_tcs : 0.0;

        $d_tcs = $v_tcs > 0 ? (1.708*$v_tcs+0.404-1.481*$u_tcs)/$v_tcs : 0.0;

        $denom = 16.518 + 1.481*($c_r/$c_t)*$c_tcs - ($d_r/$d_t)*$d_tcs;

        if (abs($denom) < 1e-10) { $u_a=$u_tcs; $v_a=$v_tcs; }

        else {

            $u_a = (10.872 + 0.404*($c_r/$c_t)*$c_tcs - 4.0*($d_r/$d_t)*$d_tcs) / $denom;

            $v_a = 5.52 / $denom;

        }

        // W*U*V* with k-normalised Y

        $W_t = 25.0*pow(max(0.001, $tY), 1.0/3.0)-17.0;

        $U_t = 13.0*$W_t*($u_a-$u_r);

        $V_t = 13.0*$W_t*($v_a-$v_r);

        $rcsUV = cri_xyz_to_uv($rXYZ);

        $W_r = 25.0*pow(max(0.001, $rY), 1.0/3.0)-17.0;

        $U_r = 13.0*$W_r*($rcsUV['u']-$u_r);

        $V_r = 13.0*$W_r*($rcsUV['v']-$v_r);

        $dE = sqrt(($W_t-$W_r)**2+($U_t-$U_r)**2+($V_t-$V_r)**2);

        $Ri[$tcs] = (int)round(100.0-4.6*$dE);

    }

    $Ra = (int)round(array_sum(array_slice($Ri,0,8,true))/8.0); // R1-R8 only (CIE 13.3)

    return ['ra'=>$Ra, 'r9'=>$Ri[9], 'ri'=>$Ri];

}

function planck_uv(float $T): array { $xy = xyz_to_xy(spd_to_xyz(blackbody_spd($T))); return xy_to_uv($xy['x'], $xy['y']); }

// Ohno-style CCT/Duv: closest point on the Planckian locus in CIE 1960 UCS, using spectrally-integrated Planckian chromaticities.

function calc_cct_duv(float $x, float $y): array {

    ['u'=>$u,'v'=>$v] = xy_to_uv($x, $y);

    $bestT = 6500.0; $bestD2 = INF;

    for ($T = 1000.0; $T <= 25000.0; $T += 25.0) { $pp = planck_uv($T); $d2 = ($u-$pp['u'])**2 + ($v-$pp['v'])**2; if ($d2 < $bestD2) { $bestD2 = $d2; $bestT = $T; } }

    $lo = max(1000.0, $bestT-30.0); $hi = min(25000.0, $bestT+30.0);

    for ($T = $lo; $T <= $hi; $T += 0.2) { $pp = planck_uv($T); $d2 = ($u-$pp['u'])**2 + ($v-$pp['v'])**2; if ($d2 < $bestD2) { $bestD2 = $d2; $bestT = $T; } }

    $pp = planck_uv($bestT); $duv = sqrt($bestD2); if (($v - $pp['v']) < 0) $duv = -$duv;

    return ['cct'=>$bestT, 'duv'=>$duv];

}

// High-resolution (1nm) chromaticity + Ohno CCT/Duv.

// Integrates at 1nm (CMF linearly interpolated from the 5nm tables) so 1nm source

// data is not lost to 5nm downsampling. Matches the IES TM-30 calculator.

function _cmf1nm(): array {

    static $c=null; if($c!==null) return $c;

    $ip=function(array $T,int $w){ if($w<=380)return $T[0]; if($w>=780)return $T[80]; $x=($w-380)/5.0;$k=(int)floor($x);$q=$x-$k; return $T[$k]*(1-$q)+$T[$k+1]*$q; };

    $X=[];$Y=[];$Z=[]; for($w=380;$w<=780;$w++){ $X[]=$ip(CMF_X,$w);$Y[]=$ip(CMF_Y,$w);$Z[]=$ip(CMF_Z,$w); }

    return $c=['X'=>$X,'Y'=>$Y,'Z'=>$Z];

}

function _spd_interp_at(array $wls, array $vals, float $w): float {

    $n=count($wls); if($n===0)return 0.0; if($w<=$wls[0])return $vals[0]; if($w>=$wls[$n-1])return $vals[$n-1];

    $lo=0;$hi=$n-1; while($hi-$lo>1){ $m=intdiv($lo+$hi,2); if($wls[$m]<=$w)$lo=$m; else $hi=$m; }

    $dx=$wls[$hi]-$wls[$lo]; if($dx==0)return $vals[$lo]; $t=($w-$wls[$lo])/$dx; return $vals[$lo]*(1-$t)+$vals[$hi]*$t;

}

function _xy_hires(array $wls, array $vals): array {

    $cm=_cmf1nm(); $X=0.0;$Y=0.0;$Z=0.0;

    for($i=0;$i<401;$i++){ $w=380+$i; $val=_spd_interp_at($wls,$vals,(float)$w); $X+=$val*$cm['X'][$i];$Y+=$val*$cm['Y'][$i];$Z+=$val*$cm['Z'][$i]; }

    $s=$X+$Y+$Z; if($s<=0)return['x'=>0.3333,'y'=>0.3333]; return['x'=>$X/$s,'y'=>$Y/$s];

}

function _planck_uv_hires(float $Tk): array {

    $cm=_cmf1nm(); $h=6.626e-34;$c=3e8;$k=1.381e-23; $X=0.0;$Y=0.0;$Z=0.0;

    for($i=0;$i<401;$i++){ $m=(380+$i)*1e-9; $val=(2*$h*$c*$c/$m**5)/(exp($h*$c/($m*$k*$Tk))-1); $X+=$val*$cm['X'][$i];$Y+=$val*$cm['Y'][$i];$Z+=$val*$cm['Z'][$i]; }

    $s=$X+$Y+$Z; $x=$X/$s;$y=$Y/$s; $d=-2*$x+12*$y+3; return['u'=>4*$x/$d,'v'=>6*$y/$d];

}

function calc_cct_duv_hires(array $wls, array $vals): array {

    $xy=_xy_hires($wls,$vals); $x=$xy['x'];$y=$xy['y']; $d=-2*$x+12*$y+3; $u=4*$x/$d;$v=6*$y/$d;

    $seed=calc_cct($x,$y); $seed=max(1100.0,min(24000.0,$seed)); $bestT=$seed;$bestD2=INF;

    for($T=max(1000.0,$seed-400.0);$T<=min(25000.0,$seed+400.0);$T+=10.0){ $pp=_planck_uv_hires($T); $dd=($u-$pp['u'])**2+($v-$pp['v'])**2; if($dd<$bestD2){$bestD2=$dd;$bestT=$T;} }

    $lo=max(1000.0,$bestT-12.0);$hi=min(25000.0,$bestT+12.0);

    for($T=$lo;$T<=$hi;$T+=0.1){ $pp=_planck_uv_hires($T); $dd=($u-$pp['u'])**2+($v-$pp['v'])**2; if($dd<$bestD2){$bestD2=$dd;$bestT=$T;} }

    $pp=_planck_uv_hires($bestT); $duv=sqrt($bestD2); if(($v-$pp['v'])<0)$duv=-$duv;

    return['x'=>$x,'y'=>$y,'cct'=>$bestT,'duv'=>$duv];

}

function _blackbody1nm(float $T): array { $h=6.626e-34;$c=3e8;$k=1.381e-23;$o=[]; for($i=0;$i<401;$i++){$m=(380+$i)*1e-9;$o[]=(2*$h*$c*$c/$m**5)/(exp($h*$c/($m*$k*$T))-1);} return $o; }

function _daylight1nm(float $cct): array {

    $T=max(4000.0,min(25000.0,$cct));

    $xD=$T<=7000.0? -4.6070e9/($T*$T*$T)+2.9678e6/($T*$T)+0.09911e3/$T+0.244063 : -2.0064e9/($T*$T*$T)+1.9018e6/($T*$T)+0.24748e3/$T+0.237040;

    $yD=-3.000*$xD*$xD+2.870*$xD-0.275; $M=0.0241+0.2562*$xD-0.7341*$yD;

    $M1=(-1.3515-1.7703*$xD+5.9114*$yD)/$M; $M2=(0.0300-31.4424*$xD+30.0717*$yD)/$M;

    $S0=[0.04,6.0,29.6,55.3,57.3,61.8,61.5,68.8,63.4,65.8,94.8,104.8,105.9,96.8,113.9,125.6,125.5,121.3,121.3,113.5,113.1,110.8,106.5,108.8,105.3,104.4,100.0,96.0,95.1,89.1,90.5,90.3,88.4,84.0,85.1,81.9,82.6,84.9,81.3,71.9,74.3,76.4,63.3,71.7,77.0,65.2,47.7,68.6,65.0,66.0,61.0,53.3,58.9,61.9]; $S1=[0.02,4.5,22.4,42.0,40.6,41.6,38.0,42.4,38.5,35.0,43.4,46.3,43.9,37.1,36.7,35.9,32.6,27.9,24.3,20.1,16.2,13.2,8.6,6.1,4.2,1.9,0.0,-1.6,-3.5,-3.5,-5.8,-7.2,-8.6,-9.5,-10.9,-10.7,-12.0,-14.0,-13.6,-12.0,-13.3,-12.9,-10.6,-11.6,-12.2,-10.2,-7.8,-11.2,-10.4,-10.6,-9.7,-8.3,-9.3,-9.8]; $S2=[0.0,2.0,4.0,8.5,7.8,6.7,5.3,6.1,2.0,1.2,-1.1,-0.5,-0.7,-1.2,-2.6,-2.9,-2.8,-2.6,-2.6,-1.8,-1.5,-1.3,-1.2,-1.0,-0.5,-0.3,0.0,0.2,0.5,2.1,3.2,4.1,4.7,5.1,6.7,7.3,8.6,9.8,10.2,8.3,9.6,8.5,7.0,7.6,8.0,6.7,5.2,7.4,6.8,7.0,6.4,5.5,6.1,6.5];

    $o=[]; for($i=0;$i<401;$i++){ $w=380+$i; $idx=($w-300)/10.0; $j=(int)floor($idx); $f=$idx-$j; if($j<0){$j=0;$f=0;} if($j>=53){$j=52;$f=1;}

        $o[]=($S0[$j]+$f*($S0[$j+1]-$S0[$j]))+$M1*($S1[$j]+$f*($S1[$j+1]-$S1[$j]))+$M2*($S2[$j]+$f*($S2[$j+1]-$S2[$j])); }

    return $o;

}

function _tcs1nm(): array {

    static $c=null; if($c!==null)return $c;

    $T5=get_tcs_reflectances(); $ip=function(array $a,int $w){ if($w<=380)return $a[0]; if($w>=780)return $a[80]; $x=($w-380)/5.0;$k=(int)floor($x);$q=$x-$k; return $a[$k]*(1-$q)+$a[$k+1]*$q; };

    $out=[]; foreach($T5 as $key=>$arr){ $r=[]; for($i=0;$i<401;$i++){$r[]=$ip($arr,380+$i);} $out[$key]=$r; } return $c=$out;

}

// CRI (CIE 13.3) computed at 1nm to match the IES TM-30 calculator's resolution.

function calc_cri_hires(array $wls, array $vals, float $cct): array {

    $cm=_cmf1nm();

    $xyz=function(array $v) use($cm){ $X=0.0;$Y=0.0;$Z=0.0; for($i=0;$i<401;$i++){$X+=$v[$i]*$cm['X'][$i];$Y+=$v[$i]*$cm['Y'][$i];$Z+=$v[$i]*$cm['Z'][$i];} return ['X'=>$X,'Y'=>$Y,'Z'=>$Z]; };

    $test=[]; for($i=0;$i<401;$i++){ $test[]=_spd_interp_at($wls,$vals,(float)(380+$i)); }

    $Tref=max(1667.0,min(25000.0,$cct));

    $ref=$Tref>=5000.0?_daylight1nm($Tref):_blackbody1nm($Tref);

    $rMax=max($ref); if($rMax>0)$ref=array_map(fn($v)=>$v/$rMax,$ref);

    $TCS=_tcs1nm();

    $tW=$xyz($test);$rW=$xyz($ref); $tUV=cri_xyz_to_uv($tW);$rUV=cri_xyz_to_uv($rW);

    $u_t=$tUV['u'];$v_t=$tUV['v'];$u_r=$rUV['u'];$v_r=$rUV['v'];

    $k_t=$tW['Y']>0?100.0/$tW['Y']:1.0; $k_r=$rW['Y']>0?100.0/$rW['Y']:1.0;

    $c_t=$v_t>0?(4.0-$u_t-10.0*$v_t)/$v_t:0.0; $d_t=$v_t>0?(1.708*$v_t+0.404-1.481*$u_t)/$v_t:0.0;

    $c_r=$v_r>0?(4.0-$u_r-10.0*$v_r)/$v_r:0.0; $d_r=$v_r>0?(1.708*$v_r+0.404-1.481*$u_r)/$v_r:0.0;

    $Ri=[];

    for($tcs=1;$tcs<=15;$tcs++){ $refl=$TCS[$tcs];

        $tXYZ=$xyz(array_map(fn($r,$s)=>$r*$s,$refl,$test)); $rXYZ=$xyz(array_map(fn($r,$s)=>$r*$s,$refl,$ref));

        $tY=$tXYZ['Y']*$k_t; $rY=$rXYZ['Y']*$k_r;

        $tcsUV=cri_xyz_to_uv($tXYZ); $u_tcs=$tcsUV['u'];$v_tcs=$tcsUV['v'];

        $c_tcs=$v_tcs>0?(4.0-$u_tcs-10.0*$v_tcs)/$v_tcs:0.0; $d_tcs=$v_tcs>0?(1.708*$v_tcs+0.404-1.481*$u_tcs)/$v_tcs:0.0;

        $denom=16.518+1.481*($c_r/$c_t)*$c_tcs-($d_r/$d_t)*$d_tcs;

        if(abs($denom)<1e-10){$u_a=$u_tcs;$v_a=$v_tcs;} else { $u_a=(10.872+0.404*($c_r/$c_t)*$c_tcs-4.0*($d_r/$d_t)*$d_tcs)/$denom; $v_a=5.52/$denom; }

        $W_t=25.0*pow(max(0.001,$tY),1.0/3.0)-17.0; $U_t=13.0*$W_t*($u_a-$u_r); $V_t=13.0*$W_t*($v_a-$v_r);

        $rcsUV=cri_xyz_to_uv($rXYZ); $W_r=25.0*pow(max(0.001,$rY),1.0/3.0)-17.0; $U_r=13.0*$W_r*($rcsUV['u']-$u_r); $V_r=13.0*$W_r*($rcsUV['v']-$v_r);

        $dE=sqrt(($W_t-$W_r)**2+($U_t-$U_r)**2+($V_t-$V_r)**2); $Ri[$tcs]=(int)round(100.0-4.6*$dE);

    }

    $Ra=(int)round(array_sum(array_slice($Ri,0,8,true))/8.0);

    return ['ra'=>$Ra,'r9'=>$Ri[9],'ri'=>$Ri];

}

function analyze_spd(array $wls, array $vals, array $instrumentMeta = [], bool $preferInstrument = false): array {

    // Normalize SPD to 0-1 range before any computation

    $maxVal = max($vals);

    if ($maxVal > 0) $vals = array_map(fn($v) => $v / $maxVal, $vals);

    $spd = interpolate_spd($wls, $vals);

    $__cd = calc_cct_duv_hires($wls, $vals); $xy = ['x'=>$__cd['x'], 'y'=>$__cd['y']];

    $cct = round($__cd['cct']);

    $duv = round($__cd['duv'], 5);

    ['Rf'=>$Rf,'Rg'=>$Rg,'rfBins'=>$rfBins,'rcsBins'=>$rcsBins,'rhsBins'=>$rhsBins,'rfSamples'=>$rfSamples,'sampleHues'=>$sampleHues] = calc_rf_rg($spd, (float)$cct, $instrumentMeta);

    // Use instrument-provided CCT/Duv/x/y if available (more accurate, measured directly)

    if ($preferInstrument && !empty($instrumentMeta['instrument_cct'])) $cct = $instrumentMeta['instrument_cct'];

    if ($preferInstrument && !empty($instrumentMeta['instrument_duv'])) $duv = $instrumentMeta['instrument_duv'];

    if ($preferInstrument && !empty($instrumentMeta['instrument_x']))   $xy['x'] = $instrumentMeta['instrument_x'];

    if ($preferInstrument && !empty($instrumentMeta['instrument_y']))   $xy['y'] = $instrumentMeta['instrument_y'];

    // CRI: always compute from the SPD; prefer instrument-reported values when present,

    // and fall back to the computed values for anything the instrument didn't provide.

    $cri = calc_cri_hires($wls, $vals, (float)$cct);

    $ra  = ($preferInstrument && isset($instrumentMeta['ra'])) ? $instrumentMeta['ra'] : $cri['ra'];

    $r9  = ($preferInstrument && isset($instrumentMeta['r9'])) ? $instrumentMeta['r9'] : $cri['r9'];

    // Individual R1-R15: computed baseline, overridden by instrument values where available.

    $ri = [];

    foreach (($cri['ri'] ?? []) as $k => $v) $ri['r'.$k] = (int)round($v);

    for ($i = 1; $i <= 15; $i++) {

        $key = 'r'.$i;

        if ($preferInstrument && isset($instrumentMeta[$key])) $ri[$key] = (int)$instrumentMeta[$key];

    }

    return [

        'x'       => round($xy['x'], 5),

        'y'       => round($xy['y'], 5),

        'cct'     => (int)$cct,

        'duv'     => $duv,

        'Rf'      => $Rf,

        'Rg'      => $Rg,

        'rfBins'  => $rfBins,

        'rcsBins' => $rcsBins ?? [],

        'rhsBins' => $rhsBins ?? [],

        'rfSamples' => $rfSamples ?? [],

        'sampleHues' => $sampleHues ?? [],

        'ra'      => $ra,

        'r9'      => $r9,

        'ri'      => $ri,

    ];

}

/**

 * Recompute the canonical report metrics purely from the stored SPD and write them

 * onto $row (cct,duv,cie_x,cie_y,rf,rg) and $meta (ra,r9,ri,rfBins,rcsBins,rhsBins),

 * overriding any instrument-reported values so every report renders through the same

 * SPD-based model. No-op when there is no usable SPD. Returns true if applied.

 */

function spd_recompute(array &$row, array &$meta): bool {

    if (empty($row['spd_data'])) return false;

    $pairs = json_decode($row['spd_data'], true);

    if (!is_array($pairs)) return false;

    $wls = array_column($pairs, 0); $vals = array_column($pairs, 1);

    if (!$wls || !$vals) return false;

    try {

        $res = analyze_spd($wls, $vals, $meta['instrumentMeta'] ?? [], false);

    } catch (\Throwable $e) { return false; }

    if (isset($res['rfBins']))  $meta['rfBins']  = $res['rfBins'];

    if (isset($res['rcsBins'])) $meta['rcsBins'] = $res['rcsBins'];

    if (isset($res['rhsBins'])) $meta['rhsBins'] = $res['rhsBins'];

    if (isset($res['rfSamples']))  $meta['rfSamples']  = $res['rfSamples'];

    if (isset($res['sampleHues'])) $meta['sampleHues'] = $res['sampleHues'];

    if (isset($res['ra']))      $meta['ra']      = $res['ra'];

    if (isset($res['r9']))      $meta['r9']      = $res['r9'];

    if (!empty($res['ri']))     $meta['ri']      = $res['ri'];

    if (isset($res['cct']))     $row['cct']      = $res['cct'];

    if (isset($res['duv']))     $row['duv']      = $res['duv'];

    if (isset($res['x']))       $row['cie_x']    = $res['x'];

    if (isset($res['y']))       $row['cie_y']    = $res['y'];

    if (isset($res['Rf']))      $row['rf']       = $res['Rf'];

    if (isset($res['Rg']))      $row['rg']       = $res['Rg'];

    return true;

}