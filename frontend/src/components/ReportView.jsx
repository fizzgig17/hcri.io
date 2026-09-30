// frontend/src/components/ReportView.jsx
import { useState, useEffect, useRef } from 'react';
import { getToken } from '../lib/api';
import { useTheme } from '../lib/ThemeContext.jsx';
import * as THREE from 'three';

// ── Colour helpers ────────────────────────────────────────────────────────────
function wlToRGB(wl) {
  if (wl < 380) return [80,0,130];
  if (wl < 440) { const t=(wl-380)/60; return [0,0,Math.min(255,Math.round(130+125*t))]; }
  if (wl < 490) { const t=(wl-440)/50; return [0,Math.round(255*t),255]; }
  if (wl < 510) { const t=(wl-490)/20; return [0,255,Math.round(255*(1-t))]; }
  if (wl < 580) { const t=(wl-510)/70; return [Math.round(255*t),Math.round(255*(1-t*0.2)),0]; }
  if (wl < 645) { const t=(wl-580)/65; return [255,Math.round(180*(1-t)),0]; }
  if (wl<=780)  { const t=(wl-645)/135; return [Math.round(255*(1-t*0.3)),0,0]; }
  return [80,0,0];
}

function hueToRGB(h) {
  return [
    Math.max(30,Math.min(240,Math.round(128+127*Math.cos(h*Math.PI/180)))),
    Math.max(30,Math.min(240,Math.round(128+127*Math.cos((h-120)*Math.PI/180)))),
    Math.max(30,Math.min(240,Math.round(128+127*Math.cos((h+120)*Math.PI/180)))),
  ];
}

function hueCSS(h,alpha=1) {
  const [r,g,b]=hueToRGB(h);
  return `rgba(${r},${g},${b},${alpha})`;
}

// C is set dynamically per render from theme — see useTheme() below
let C = {};

function rfColor(rf) {
  if(rf==null)return C.text;
  return rf>=85?C.good:rf>=70?C.warn:C.bad;
}

// ── SPD Chart ─────────────────────────────────────────────────────────────────
function SPDChart({ wls, vals, theme: T = {} }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current; if(!canvas||!wls?.length)return;
    const dpr=devicePixelRatio||1;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const pL=42,pR=12,pT=10,pB=32,cW=W-pL-pR,cH=H-pT-pB;
    const maxV=Math.max(...vals),minWl=Math.min(...wls),span=Math.max(1,Math.max(...wls)-minWl);
    // Background
    ctx.fillStyle=T.chartBg||'rgba(0,0,0,0.2)'; ctx.fillRect(pL,pT,cW,cH);
    // Grid
    ctx.strokeStyle=T.gridLine||'rgba(255,255,255,0.07)'; ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const gy=pT+cH-(i/4)*cH;ctx.beginPath();ctx.moveTo(pL,gy);ctx.lineTo(pL+cW,gy);ctx.stroke();}
    [400,450,500,550,600,650,700,750].forEach(wl=>{
      const gx=pL+((wl-minWl)/span)*cW;
      if(gx<pL||gx>pL+cW)return;
      ctx.beginPath();ctx.moveTo(gx,pT);ctx.lineTo(gx,pT+cH);ctx.stroke();
    });
    // Coloured fill
    wls.forEach((wl,i)=>{
      if(i===0)return;
      const mid=(wl+wls[i-1])/2;
      const [r,g,b]=wlToRGB(Math.round(mid));
      const x1=pL+((wls[i-1]-minWl)/span)*cW, x2=pL+((wl-minWl)/span)*cW;
      const avgH=((vals[i-1]+vals[i])/2/maxV)*cH*0.95;
      ctx.fillStyle=`rgba(${Math.min(255,Math.round(180+(r-180)*0.55))},${Math.min(255,Math.round(180+(g-180)*0.55))},${Math.min(255,Math.round(180+(b-180)*0.55))},0.9)`;
      ctx.fillRect(x1,pT+cH-avgH,Math.max(0.5,x2-x1),avgH);
    });
    // Red curve
    ctx.beginPath();
    wls.forEach((wl,i)=>{
      const px=pL+((wl-minWl)/span)*cW, py=pT+cH-(vals[i]/maxV)*cH*0.95;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    });
    ctx.strokeStyle=T.spdCurve||'rgba(220,40,40,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
    // Reference line (flat normalized)
    ctx.beginPath(); ctx.moveTo(pL,pT+cH*0.05); ctx.lineTo(pL+cW,pT+cH*0.05);
    ctx.strokeStyle='rgba(180,180,180,0.5)'; ctx.lineWidth=0.8; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
    // Axis
    ctx.strokeStyle=T.axisBorder||'rgba(100,140,180,0.4)'; ctx.lineWidth=0.8; ctx.strokeRect(pL,pT,cW,cH);
    ctx.font='12px monospace'; ctx.fillStyle=T.axisLabel||'rgba(160,200,230,0.9)'; ctx.textAlign='center';
    [400,450,500,550,600,650,700,750].forEach(wl=>{
      const gx=pL+((wl-minWl)/span)*cW;
      if(gx<pL||gx>pL+cW)return;
      ctx.fillText(wl,gx,pT+cH+14);
    });
    ctx.fillStyle=T.dim||'#7aaccc'; ctx.font='11px monospace';
    ctx.fillText('Wavelength (nm)',pL+cW/2,H-4);
    ctx.textAlign='right'; ctx.font='11px monospace'; ['0','0.5','1.0'].forEach((l,i)=>ctx.fillText(l,pL-4,pT+cH-(i/2)*cH+3));
    // Legend
    ctx.font='bold 12px monospace'; ctx.textAlign='left';
    ctx.strokeStyle='rgba(220,40,40,0.9)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(pL+8,pT+8); ctx.lineTo(pL+22,pT+8); ctx.stroke();
    ctx.fillStyle='#e8f4ff'; ctx.fillText('Test',pL+26,pT+12);
    ctx.strokeStyle='rgba(180,180,180,0.6)'; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(pL+55,pT+8); ctx.lineTo(pL+69,pT+8); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle=T.spdDimText||'#7aaccc'; ctx.fillText('Reference',pL+73,pT+12);
  },[wls,vals]);
  return <canvas ref={ref} style={{width:'100%',height:160,display:'block'}}/>;
}

// ── Bar chart (chroma/hue/fidelity) ──────────────────────────────────────────
function BinBarChart({ title, rfBins, mode, theme: T = {} }) {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const dpr=devicePixelRatio||1;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const pL=36,pR=8,pT=8,pB=20,cW=W-pL-pR,cH=H-pT-pB;
    ctx.fillStyle=T.chartBg||'rgba(0,0,0,0.2)'; ctx.fillRect(pL,pT,cW,cH);
    const bw=cW/16;

    if(mode==='fidelity'){
      // Rfhj bars 0-100
      ctx.strokeStyle=T.gridLine||'rgba(255,255,255,0.07)'; ctx.lineWidth=0.5;
      [25,50,75,100].forEach(v=>{
        const gy=pT+cH-(v/100)*cH;
        ctx.beginPath();ctx.moveTo(pL,gy);ctx.lineTo(pL+cW,gy);ctx.stroke();
      });
      rfBins.forEach((v,h)=>{
        const bh=(v/100)*cH*0.95;
        const [r,g,b]=hueToRGB(h*22.5+11.25);
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillRect(pL+h*bw+1,pT+cH-bh,bw-2,bh);
        // Value label
        ctx.font=`bold ${11}px monospace`; ctx.fillStyle=T.text||'#e8f4ff'; ctx.textAlign='center';
        ctx.fillText(Math.round(v),pL+h*bw+bw/2,pT+cH-bh-2);
        // Bin number
        ctx.fillStyle='#7aaccc';
        ctx.fillText(h+1,pL+h*bw+bw/2,pT+cH+14);
      });
      ctx.font='11px monospace'; ctx.fillStyle=T.dim||'#7aaccc'; ctx.textAlign='center';
      ctx.fillText('Hue-Angle Bin (j)',pL+cW/2,H-2);
      ctx.textAlign='right'; ctx.font='11px monospace'; ctx.fillStyle=T.dim||'#7aaccc';
      ['100','75','50','25'].forEach((l,i)=>{
        ctx.fillText(l,pL-3,pT+(i/4)*cH+4);
      });
    } else {
      // Chroma/Hue shift — centre-zero bars
      const zeroY=pT+cH/2;
      ctx.strokeStyle='rgba(100,140,180,0.5)'; ctx.lineWidth=0.8;
      ctx.beginPath();ctx.moveTo(pL,zeroY);ctx.lineTo(pL+cW,zeroY);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=0.5;
      [-0.5,-0.25,0.25,0.5].forEach(v=>{
        const gy=zeroY-v*(cH/2)*0.9;
        ctx.beginPath();ctx.moveTo(pL,gy);ctx.lineTo(pL+cW,gy);ctx.stroke();
      });
      rfBins.forEach((v,h)=>{
        // Approximate shift from rfBin deviation from 100
        const shift = mode==='chroma' ? (v-85)/300 : (85-v)/2000;
        const barH2=Math.abs(shift)*(cH/2)*0.9;
        const [r,g,b]=hueToRGB(h*22.5+11.25);
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        if(shift>=0) ctx.fillRect(pL+h*bw+1,zeroY-barH2,bw-2,barH2);
        else         ctx.fillRect(pL+h*bw+1,zeroY,bw-2,barH2);
        // Label
        ctx.font='bold 10px monospace'; ctx.fillStyle='#e8f4ff'; ctx.textAlign='center';
        const labelY=shift>=0?zeroY-barH2-2:zeroY+barH2+7;
        const pct=mode==='chroma'?Math.round(shift*100)+'%':shift.toFixed(2);
        ctx.fillText(pct,pL+h*bw+bw/2,labelY);
        // Bin num
        ctx.fillStyle=T.dim||'#7aaccc'; ctx.font='10px monospace';
        ctx.fillText(h+1,pL+h*bw+bw/2,pT+cH+14);
      });
      const scale=mode==='chroma'?['40%','0%','-40%']:['0.50','0','-0.50'];
      ctx.textAlign='right'; ctx.font='11px monospace'; ctx.fillStyle=T.dim||'#7aaccc';
      scale.forEach((l,i)=>ctx.fillText(l,pL-3,pT+(i/2)*cH+4));
    }
    // Border
    ctx.strokeStyle=T.axisBorder||'rgba(80,140,200,0.2)'; ctx.lineWidth=0.5; ctx.strokeRect(pL,pT,cW,cH);
  },[rfBins,mode]);
  return (
    <div>
      <div style={{fontSize:12,color:C.dim,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6,fontWeight:700}}>{title}</div>
      <canvas ref={ref} style={{width:'100%',height:70,display:'block'}}/>
    </div>
  );
}

// ── CES 99 Color bars ─────────────────────────────────────────────────────────
function CESBars({ rfBins, theme: T = {} }) {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const dpr=devicePixelRatio||1;
    const W=canvas.offsetWidth, H=canvas.offsetHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const pL=36,pR=8,pT=8,pB=20,cW=W-pL-pR,cH=H-pT-pB;
    ctx.fillStyle=T.chartBg||'rgba(0,0,0,0.2)'; ctx.fillRect(pL,pT,cW,cH);
    const n=99, bw=cW/n;
    // Grid
    ctx.strokeStyle=T.gridLine||'rgba(255,255,255,0.07)'; ctx.lineWidth=0.5;
    [25,50,75,100].forEach(v=>{
      const gy=pT+cH-(v/100)*cH;
      ctx.beginPath();ctx.moveTo(pL,gy);ctx.lineTo(pL+cW,gy);ctx.stroke();
    });
    for(let i=0;i<n;i++){
      const binIdx=(i/n)*16;
      const b0=Math.floor(binIdx), b1=Math.min(15,b0+1);
      const frac=binIdx-b0;
      const rv=Math.min(100,Math.max(0,(rfBins[b0]??75)*(1-frac)+(rfBins[b1]??75)*frac));
      const bh=(rv/100)*cH*0.95;
      const hue=(i/n)*360;
      const [r,g,b]=hueToRGB(hue);
      ctx.fillStyle=`rgb(${r},${g},${b})`;
      ctx.fillRect(pL+i*bw,pT+cH-bh,Math.max(0.5,bw),bh);
    }
    // X labels
    ctx.font='11px monospace'; ctx.fillStyle=T.dim||'#7aaccc'; ctx.textAlign='center';
    [1,5,9,13,17,21,25,29,33,37,41,45,49,53,57,61,65,69,73,77,81,85,89,93,97].forEach(n2=>{
      const bx=pL+(n2-1)*bw+bw/2;
      ctx.fillText(n2,bx,pT+cH+12);
    });
    ctx.fillStyle=T.dim||'#7aaccc'; ctx.fillText('CES Color',pL+cW/2,H-1);
    ctx.textAlign='right'; ctx.font='11px monospace'; ctx.fillStyle=T.dim||'#7aaccc';
    ['100','50','0'].forEach((l,i)=>ctx.fillText(l,pL-3,pT+(i/2)*cH+4));
    ctx.strokeStyle=T.axisBorder||'rgba(80,140,200,0.2)'; ctx.lineWidth=0.5; ctx.strokeRect(pL,pT,cW,cH);
  },[rfBins]);
  return (
    <div>
      <div style={{fontSize:12,color:C.dim,textTransform:'uppercase',letterSpacing:1.5,marginBottom:6,fontWeight:700}}>Color Sample Fidelity, R<sub>f,CES</sub></div>
      <canvas ref={ref} style={{width:'100%',height:80,display:'block'}}/>
    </div>
  );
}

// ── CVG Wheel ─────────────────────────────────────────────────────────────────
function CVGWheel({ rfBins, Rg, Rf, cct, duv, size=280, theme: T = {} }) {
  const ref = useRef();
  const pad = Math.round(size * 0.14); // padding for labels outside wheel
  const total = size + pad*2;
  const cx = total/2, cy = total/2;
  const rRef = size * 0.36;
  const rIn  = size * 0.05;

  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const dpr=devicePixelRatio||1;
    canvas.width=total*dpr; canvas.height=total*dpr;
    const ctx=canvas.getContext('2d'); ctx.scale(dpr,dpr);

    // Hue sector background (outside rRef)
    for(let h=0;h<16;h++){
      const a1=(90-h*22.5)*Math.PI/180;
      const a2=(90-(h+1)*22.5)*Math.PI/180;
      const [r,g,b]=hueToRGB(h*22.5+11.25);
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.arc(cx,cy,rRef+size*0.055,a2,a1);
      ctx.closePath();
      ctx.fillStyle=`rgb(${Math.min(255,Math.round(160+(r-160)*0.4))},${Math.min(255,Math.round(160+(g-160)*0.4))},${Math.min(255,Math.round(160+(b-160)*0.4))})`;
      ctx.fill();
    }

    // White inner area
    ctx.beginPath(); ctx.arc(cx,cy,rRef,0,Math.PI*2);
    ctx.fillStyle=T.cvgInner||'rgb(240,244,250)'; ctx.fill();

    // Reference rings
    [0.25,0.5,0.75,1.0].forEach(f=>{
      ctx.beginPath(); ctx.arc(cx,cy,rRef*f,0,Math.PI*2);
      ctx.strokeStyle=f===1?'rgba(0,0,0,0.55)':'rgba(0,0,0,0.12)';
      ctx.lineWidth=f===1?1.2:0.5; ctx.stroke();
    });

    // Radial guides
    ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=0.4;
    for(let a=0;a<16;a++){
      const ang=(90-a*22.5)*Math.PI/180;
      ctx.beginPath();
      ctx.moveTo(cx+rIn*Math.cos(ang),cy-rIn*Math.sin(ang));
      ctx.lineTo(cx+(rRef)*Math.cos(ang),cy-(rRef)*Math.sin(ang));
      ctx.stroke();
    }

    // Test polygon
    const bins=rfBins.length===16?rfBins:Array(16).fill(Rf||75);
    const polyPts=bins.map((v,h)=>{
      // TM-30-18 CVG: radius is the chroma ratio C_test/C_ref, not Rf,hj.
      const cp=(report?.cvgTest&&report.cvgTest.length===16)?report.cvgTest[i]:null;
      const rcs=(report?.rcsBins&&report.rcsBins.length===16)?report.rcsBins[i]:null;
      const t=Math.max(0.05,Math.min(1.45,cp?Math.hypot(cp[0],cp[1]):(rcs!==null?1+Number(rcs||0):1)));
      const a=(90-h*22.5)*Math.PI/180;
      return[cx+rRef*t*Math.cos(a), cy-rRef*t*Math.sin(a)];
    });
    ctx.beginPath(); ctx.moveTo(...polyPts[0]);
    polyPts.slice(1).forEach(p=>ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle='rgba(200,30,30,0.12)'; ctx.fill();
    ctx.strokeStyle='rgba(190,25,25,0.9)'; ctx.lineWidth=1.6; ctx.stroke();

    // Dots
    polyPts.forEach(([px,py])=>{
      ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
      ctx.fillStyle='rgba(170,15,15,0.9)'; ctx.fill();
    });

    // Bold reference circle
    ctx.beginPath(); ctx.arc(cx,cy,rRef,0,Math.PI*2);
    ctx.strokeStyle='rgba(0,0,0,0.65)'; ctx.lineWidth=1.3; ctx.stroke();

    // Bin numbers — outside the hue ring, clearly readable
    ctx.font=`bold ${Math.round(size*0.044)}px monospace`;
    ctx.fillStyle='rgba(20,20,20,0.9)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    for(let h=0;h<16;h++){
      const a=(90-h*22.5)*Math.PI/180;
      const lr=rRef+size*0.115;  // pushed further out
      ctx.fillText(h+1, cx+lr*Math.cos(a), cy-lr*Math.sin(a));
    }

    // Rf top-left corner (drawn on canvas so it's always aligned)
    const rfVal = Rf != null ? String(Rf) : '—';
    const rgVal = Rg != null ? String(Rg) : '—';
    const rfColor2 = Rf==null?'#6a9ab8':Rf>=85?'#4fffb0':Rf>=70?'#ffcc44':'#ff5577';
    const rgColor2 = Rg==null?'#6a9ab8':Math.abs(Rg-100)<=8?'#4fffb0':'#ffcc44';

    // Rf — top left
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.font=`900 ${Math.round(size*0.115)}px monospace`;
    ctx.fillStyle=rfColor2;
    ctx.fillText(rfVal, pad*0.12, pad*0.08);
    ctx.font=`${Math.round(size*0.05)}px monospace`;
    ctx.fillStyle='#6a9ab8';
    ctx.fillText('Rf', pad*0.12, pad*0.08 + Math.round(size*0.115) + 2);

    // Rg — top right
    ctx.textAlign='right'; ctx.textBaseline='top';
    ctx.font=`900 ${Math.round(size*0.115)}px monospace`;
    ctx.fillStyle=rgColor2;
    ctx.fillText(rgVal, total - pad*0.12, pad*0.08);
    ctx.font=`${Math.round(size*0.05)}px monospace`;
    ctx.fillStyle='#6a9ab8';
    ctx.fillText('Rg', total - pad*0.12, pad*0.08 + Math.round(size*0.115) + 2);

    // CCT bottom-left (inside wheel) — positioned well inside lower arc
    const bY = cy + rRef*0.62;
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.font=`bold ${Math.round(size*0.042)}px monospace`;
    ctx.fillStyle=T.cvgSubText||'rgba(30,30,30,0.55)';
    ctx.fillText('CCT', cx-rRef*0.78, bY);
    ctx.font=`bold ${Math.round(size*0.058)}px monospace`;
    ctx.fillStyle=T.cvgText||'rgba(10,10,10,0.85)';
    ctx.fillText(cct?cct+' K':'—', cx-rRef*0.78, bY+size*0.065);

    // Duv bottom-right
    ctx.textAlign='right';
    ctx.font=`bold ${Math.round(size*0.042)}px monospace`;
    ctx.fillStyle=T.cvgSubText||'rgba(30,30,30,0.55)';
    ctx.fillText('Duv', cx+rRef*0.78, bY);
    ctx.font=`bold ${Math.round(size*0.058)}px monospace`;
    ctx.fillStyle=T.cvgText||'rgba(10,10,10,0.85)';
    ctx.fillText(duv!=null?(duv>=0?'+':'')+duv.toFixed(4):'—', cx+rRef*0.78, bY+size*0.065);

  },[rfBins,Rg,Rf,cct,duv,size]);

  return (
    <div style={{flexShrink:0}}>
      <canvas ref={ref} style={{width:total,height:total,display:'block'}}/>
    </div>
  );
}

// ── 3D Viewer ─────────────────────────────────────────────────────────────────
function ThreeViewer({ reports, activeId, minRf, viewCmd }) {
  const canvasRef=useRef(); const st=useRef({});
  function rfCol3(rf){const t=(rf??0)/100;if(t<.5)return new THREE.Color(.8+.2*t*2,.2+.4*t*2,.1);return new THREE.Color(.8-.6*(t-.5)*2,.7,.1+.7*(t-.5)*2);}
  function cctXy(T){if(T<1667||T>25000)return null;const x=T<=4000?-0.2661239e9/T**3-0.2343580e6/T**2+0.8776956e3/T+0.179910:-3.0258469e9/T**3+2.1070379e6/T**2+0.2226347e3/T+0.240390;const y=T<=2222?-1.1063814*x**3-1.34811020*x**2+2.18555832*x-0.20219683:T<=4000?-0.9549476*x**3-1.37418593*x**2+2.09137015*x-0.16748867:3.0817580*x**3-5.87338670*x**2+3.75112997*x-0.37001483;return{x,y};}
  function p3(x,y,cri){return new THREE.Vector3(x/.8,cri/100,y/.9);}
  const LOCUS=[[.1741,.005],[.174,.005],[.1736,.0049],[.173,.0048],[.1726,.0048],[.1714,.0051],[.1689,.0069],[.1644,.0138],[.1566,.0177],[.144,.0297],[.1241,.0578],[.0913,.1327],[.0454,.295],[.0082,.5384],[.0139,.695],[.0743,.8338],[.1547,.8059],[.2296,.7543],[.3016,.6923],[.3731,.6245],[.4441,.5547],[.5125,.4866],[.5752,.4242],[.627,.3725],[.6658,.334],[.6915,.3083],[.7079,.292],[.714,.2859]];
  const REFS=[{x:.4476,y:.4074,Rf:100,label:'CIE A'},{x:.3127,y:.329,Rf:100,label:'D65'},{x:.3818,y:.3797,Rf:80,label:'LED 3000K'},{x:.3447,y:.3553,Rf:80,label:'LED 4000K'},{x:.38,y:.35,Rf:24,label:'HPS'}];

  useEffect(()=>{
    const canvas=canvasRef.current;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setClearColor(0x060a0f);
    const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2(0x060a0f,.13);
    const camera=new THREE.PerspectiveCamera(50,1,.01,100);
    let sph={theta:.9,phi:.85,r:4},pan=new THREE.Vector3(.5,.5,.5);
    function camUpdate(){camera.position.set(sph.r*Math.sin(sph.phi)*Math.sin(sph.theta)+pan.x,sph.r*Math.cos(sph.phi)+pan.y,sph.r*Math.sin(sph.phi)*Math.cos(sph.theta)+pan.z);camera.lookAt(pan);}
    let drag=false,right=false,prev={x:0,y:0};
    canvas.addEventListener('mousedown',e=>{drag=true;right=e.button===2;prev={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    const onMove=e=>{if(!drag)return;const dx=(e.clientX-prev.x)*.007,dy=(e.clientY-prev.y)*.007;prev={x:e.clientX,y:e.clientY};if(right){const r=new THREE.Vector3();camera.getWorldDirection(r);r.cross(camera.up).normalize();pan.addScaledVector(r,-dx*.4);pan.addScaledVector(camera.up,dy*.4);}else{sph.theta-=dx;sph.phi=Math.max(.05,Math.min(Math.PI-.05,sph.phi+dy));}camUpdate();};
    window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',()=>drag=false);
    canvas.addEventListener('wheel',e=>{sph.r=Math.max(.5,Math.min(12,sph.r+e.deltaY*.003));camUpdate();});
    // Static
    const grid=new THREE.GridHelper(1.3,13,0x0e2838,0x091820);grid.position.set(.5,0,.5);scene.add(grid);
    [[new THREE.Vector3(0,0,0),new THREE.Vector3(1.15,0,0),0xff5555],[new THREE.Vector3(0,0,0),new THREE.Vector3(0,1.15,0),0x55aaff],[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,1.15),0x55ff99]].forEach(([a,b,c])=>scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.55}))));
    const lp=LOCUS.map(([x,y])=>p3(x,y,0));lp.push(lp[0].clone());scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.1})));
    const ccts=[];for(let T=1500;T<=12000;T+=60)ccts.push(T);
    [0,50,100].forEach((cri,i)=>{const pts=ccts.map(T=>{const p=cctXy(T);return p?p3(p.x,p.y,cri):null;}).filter(Boolean);scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffd580,transparent:true,opacity:i===0?.3:.08})));});
    const seg=[];ccts.forEach(T=>{const p=cctXy(T);if(!p)return;seg.push(p3(p.x,p.y,0));seg.push(p3(p.x,p.y,100));});
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg),new THREE.LineBasicMaterial({color:0xffd580,transparent:true,opacity:.05})));
    const allMeshes=[];
    REFS.forEach(s=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.013,10,7),new THREE.MeshBasicMaterial({color:rfCol3(s.Rf),transparent:true,opacity:.35}));m.position.copy(p3(s.x,s.y,s.Rf));m.userData={...s,isRef:true};scene.add(m);allMeshes.push(m);});
    function resize(){const vp=canvas.parentElement;renderer.setSize(vp.clientWidth,vp.clientHeight);camera.aspect=vp.clientWidth/vp.clientHeight;camera.updateProjectionMatrix();}
    window.addEventListener('resize',resize);resize();
    let raf;function animate(){raf=requestAnimationFrame(animate);scene.children.forEach(c=>{if(c.userData?.isRing)c.lookAt(camera.position);});renderer.render(scene,camera);}
    animate();camUpdate();
    st.current={scene,camera,renderer,allMeshes,sph,pan,camUpdate};
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('mousemove',onMove);window.removeEventListener('resize',resize);renderer.dispose();};
  },[]);

  useEffect(()=>{
    const{scene,allMeshes}=st.current;if(!scene)return;
    scene.children.filter(c=>c.userData?.isUser||c.userData?.isRing||c.userData?.isDrop||c.userData?.isDot).forEach(c=>scene.remove(c));
    allMeshes.length=0;scene.children.filter(c=>c.userData?.isRef).forEach(m=>allMeshes.push(m));
    reports.forEach(r=>{if(!r.x||!r.y)return;const pos=p3(r.x,r.y,r.Rf||0),col=rfCol3(r.Rf);
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.021,14,9),new THREE.MeshBasicMaterial({color:col}));
      mesh.position.copy(pos);mesh.userData={...r,isUser:true};scene.add(mesh);allMeshes.push(mesh);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.025,.033,16),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:THREE.DoubleSide}));ring.position.copy(pos);ring.userData={isRing:true};scene.add(ring);
      const drop=new THREE.Line(new THREE.BufferGeometry().setFromPoints([pos.clone(),new THREE.Vector3(pos.x,0,pos.z)]),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.3}));drop.userData={isDrop:true};scene.add(drop);
      const dot=new THREE.Mesh(new THREE.CircleGeometry(.013,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}));dot.rotation.x=-Math.PI/2;dot.position.set(pos.x,.002,pos.z);dot.userData={isDot:true};scene.add(dot);
    });
  },[reports]);

  useEffect(()=>{
    if(!viewCmd||!st.current.camUpdate)return;
    const{sph:s,pan:p,camUpdate}=st.current;
    if(viewCmd==='persp'){s.theta=.9;s.phi=.85;s.r=4;p.set(.5,.5,.5);}
    else if(viewCmd==='top'){s.theta=0;s.phi=.04;s.r=3;p.set(.5,0,.5);}
    else if(viewCmd.startsWith('focus:')){const[,x,y,rf]=viewCmd.split(':').map(Number);const pos=p3(x,y,rf||0);p.set(pos.x,pos.y,pos.z);s.r=1.6;}
    camUpdate();
  },[viewCmd]);

  return <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}}/>;
}


// ── Shared button style ───────────────────────────────────────────────────────
const Sb = {background:'rgba(0,212,255,0.1)',border:`1px solid rgba(0,212,255,0.35)`,color:'#00d4ff',borderRadius:5,padding:'5px 12px',fontSize:12,cursor:'pointer',fontFamily:'monospace',fontWeight:600};

const iStyle = {background:'rgba(0,0,0,0.3)',border:`1px solid rgba(80,160,220,0.25)`,borderRadius:5,padding:'7px 10px',color:'#e8f4ff',fontSize:13,outline:'none',fontFamily:'monospace',width:'100%'};
const lStyle = {fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'#7aaccc',fontWeight:700,display:'block',marginBottom:4};

// ── Metadata editor ───────────────────────────────────────────────────────────
function MetaEditor({ report, isGuest, onSave }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [label,   setLabel]   = useState(report.label        || '');
  const [model,   setModel]   = useState(report.model        || '');
  const [mfr,     setMfr]     = useState(report.manufacturer || '');
  const [led,     setLed]     = useState(report.ledDetails   || '');
  const [notes,   setNotes]   = useState(report.notes        || '');

  // Sync fields when switching to a different report
  const prevId = useRef(report.id);
  if (prevId.current !== report.id) {
    prevId.current = report.id;
    setLabel(report.label        || '');
    setModel(report.model        || '');
    setMfr  (report.manufacturer || '');
    setLed  (report.ledDetails   || '');
    setNotes(report.notes        || '');
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    try {
      await onSave({ label, model, manufacturer: mfr, ledDetails: led, notes });
      setEditing(false);
    } catch(e) { alert('Save failed: ' + e.message); }
    finally { setSaving(false); }
  }

  return (
    <div style={{padding:'14px 22px',borderBottom:`1px solid rgba(80,160,220,0.25)`}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:editing?14:0}}>
        <div style={{fontSize:12,textTransform:'uppercase',letterSpacing:1.5,color:'#7aaccc',fontWeight:700}}>Source Details</div>
        {!isGuest && (editing
          ? <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setEditing(false)} style={{...Sb,background:'none',color:'#7aaccc',border:'1px solid rgba(80,160,220,0.25)'}}>Cancel</button>
              <button onClick={save} disabled={saving} style={{...Sb,opacity:saving?.6:1}}>{saving?'Saving...':'Save'}</button>
            </div>
          : <button onClick={()=>setEditing(true)} style={{...Sb,background:'none',color:'#00d4ff',border:'1px solid rgba(0,212,255,0.3)'}}>Edit</button>
        )}
        {isGuest && <span style={{fontSize:11,color:'#7aaccc',fontStyle:'italic'}}>Sign in to save details</span>}
      </div>

      {editing ? (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div><label style={lStyle}>Label / Source</label><input style={iStyle} value={label} onChange={e=>setLabel(e.target.value)} placeholder="Source name"/></div>
          <div><label style={lStyle}>Model</label><input style={iStyle} value={model} onChange={e=>setModel(e.target.value)} placeholder="e.g. Sc13C"/></div>
          <div><label style={lStyle}>Manufacturer</label><input style={iStyle} value={mfr} onChange={e=>setMfr(e.target.value)} placeholder="e.g. Sofirn"/></div>
          <div><label style={lStyle}>LED Details</label><input style={iStyle} value={led} onChange={e=>setLed(e.target.value)} placeholder="e.g. SFT40 3000K"/></div>
          <div style={{gridColumn:'1/-1'}}>
            <label style={lStyle}>Notes</label>
            <textarea style={{...iStyle,resize:'vertical'}} value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Any additional notes..."/>
          </div>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:8}}>
          {[['Source',label],['Model',model||'-'],['Manufacturer',mfr||'-'],['LED',led||'-']].map(([k,v])=>(
            <div key={k} style={{background:'#0a1628',border:'1px solid rgba(80,160,220,0.2)',borderRadius:4,padding:'6px 10px'}}>
              <div style={{fontSize:10,color:'#7aaccc',textTransform:'uppercase',letterSpacing:1,marginBottom:2,fontWeight:700}}>{k}</div>
              <div style={{fontSize:13,color:'#e8f4ff',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v}</div>
            </div>
          ))}
          {notes && (
            <div style={{gridColumn:'1/-1',background:'#0a1628',border:'1px solid rgba(80,160,220,0.2)',borderRadius:4,padding:'6px 10px'}}>
              <div style={{fontSize:10,color:'#7aaccc',textTransform:'uppercase',letterSpacing:1,marginBottom:2,fontWeight:700}}>Notes</div>
              <div style={{fontSize:13,color:'#e8f4ff'}}>{notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CRI R1–R15 bar chart ──────────────────────────────────────────────────────
const TCS_COLORS = {
  1:'#c08878', 2:'#b09858', 3:'#8a9a60', 4:'#4a7848', 5:'#60989a',
  6:'#6890b8', 7:'#8878a8', 8:'#c07898', 9:'#cc2828', 10:'#d4b424',
  11:'#3e8850', 12:'#1e3ea8', 13:'#d49878', 14:'#4e6030', 15:'#c08868',
};

function CRIBars({ ri, C }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!W || !H) return;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const items = [];
    for (let i = 1; i <= 15; i++) {
      const v = ri['r' + i];
      if (v == null || isNaN(v)) continue;
      items.push({ i, v: +v });
    }
    if (!items.length) return;

    // Font is capped so it can't outgrow the gutters (the original bug:
    // W*0.026 made ~20px+ text while margins stayed tiny → everything clipped).
    const fs = Math.max(11, Math.min(13, Math.round(W * 0.018)));
    const ML = Math.round(fs * 3) + 8;   // left gutter: fits "R15"
    const MR = 8;                        // right gutter
    const MT = fs + 12;                  // top gutter: fits axis labels
    const MB = 6;
    const chartW = W - ML - MR;
    const chartH = H - MT - MB;

    const lo = Math.min(0, ...items.map(d => d.v)); // 0 unless an R-value is negative
    const hi = 100;
    const xOf = v => ML + ((v - lo) / (hi - lo)) * chartW;

    const txt = C.dim || 'rgba(150,160,175,0.85)';

    // Grid + axis labels, kept inside the top gutter so they don't clip
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    ctx.font = `${fs - 1}px monospace`;
    for (let t = Math.ceil(lo / 20) * 20; t <= hi; t += 20) {
      const gx = xOf(t);
      ctx.strokeStyle = 'rgba(128,128,128,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gx, MT); ctx.lineTo(gx, MT + chartH); ctx.stroke();
      ctx.fillStyle = txt;
      ctx.fillText(String(t), gx, MT - 5);
    }

    const pill = (px, py, pw, ph, pr) => {
      pr = Math.min(pr, ph / 2, pw / 2);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, pr);
      else {
        ctx.moveTo(px + pr, py);
        ctx.arcTo(px + pw, py, px + pw, py + ph, pr);
        ctx.arcTo(px + pw, py + ph, px, py + ph, pr);
        ctx.arcTo(px, py + ph, px, py, pr);
        ctx.arcTo(px, py, px + pw, py, pr);
        ctx.closePath();
      }
    };
    const readableOn = hex => {
      const m = hex.replace('#', '');
      const r = parseInt(m.slice(0,2),16), g = parseInt(m.slice(2,4),16), b = parseInt(m.slice(4,6),16);
      return (0.299*r + 0.587*g + 0.114*b) / 255 > 0.6 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.96)';
    };

    const rowH = chartH / items.length;
    const barH = Math.min(rowH * 0.62, 16);

    items.forEach((d, idx) => {
      const cy  = MT + rowH * (idx + 0.5);
      const by  = cy - barH / 2;
      const x0  = xOf(lo);
      const bw  = Math.max(barH, xOf(d.v) - x0);
      const col = TCS_COLORS[d.i] || '#888';

      ctx.fillStyle = col;
      pill(x0, by, bw, barH, barH / 2);
      ctx.fill();

      ctx.fillStyle = txt;
      ctx.font = `bold ${fs}px monospace`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('R' + d.i, ML - 6, cy);

      // Value inside the bar end when it fits (never overflows the canvas),
      // otherwise just outside to the right.
      const lab = String(Math.round(d.v));
      const tw  = ctx.measureText(lab).width;
      if (bw > tw + 16) {
        ctx.fillStyle = readableOn(col);
        ctx.textAlign = 'right';
        ctx.fillText(lab, x0 + bw - 9, cy);
      } else {
        ctx.fillStyle = C.text || 'rgba(230,240,255,0.95)';
        ctx.textAlign = 'left';
        ctx.fillText(lab, x0 + bw + 6, cy);
      }
    });
  }, [ri, C]);

  const rows = Object.keys(ri).filter(k => /^r\d+$/.test(k)).length || 15;
  const h = Math.max(220, rows * 22 + 28);

  return (
    <div style={{marginTop:12,maxWidth:480}}>
      <div style={{fontSize:11,color:C.dim,textTransform:'uppercase',letterSpacing:1,fontWeight:700,marginBottom:4}}>CRI R1–R15</div>
      <canvas ref={canvasRef} style={{width:'100%',height:h,display:'block'}}/>
    </div>
  );
}

// ── Main ReportView ───────────────────────────────────────────────────────────
export default function ReportView({ report, allReports=[], isGuest=false, onMetaSave }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  // Rebuild C from theme on every render
  C = {
    bg:      T.bg,
    surface: T.surface,
    surface2:T.surface2,
    border:  T.border,
    text:    T.text,
    dim:     T.dim,
    accent:  T.accent,
    good:    T.good,
    warn:    T.warn,
    bad:     T.bad,
    red:     T.bad,
  };
  const [tab,setTab]=useState('report');
  const [downloading,setDL]=useState(false);

  if (!report) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:C.dim,fontSize:13,gap:6,background:C.bg}}>
      <div style={{fontSize:48,opacity:.15}}>📊</div>
      <div>Select a report from the list to view it</div>
    </div>
  );

  const rfBins = report.rfBins || Array(16).fill(report.Rf||75);
  const meta   = report;

  async function saveMetadata(fields) {
    if (!report.id) return;
    await fetch(`./index.php/api/reports/${report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${getToken()}` },
      body: JSON.stringify(fields),
    }).then(r => { if(!r.ok) throw new Error('Save failed'); });
    if (onMetaSave) onMetaSave({ ...report, ...fields });
  }

  async function downloadPDF() {
    setDL(true);
    try {
      let res;
      // Match the PDF to whatever the user is looking at on screen. Saved
      // reports take it as a query param, guest reports in the POST body.
      const pdfTheme = themeName === 'dark' ? 'dark' : 'light';
      if (report.id) {
        // Saved report — use authenticated endpoint
        res = await fetch(`./index.php/api/reports/${report.id}/pdf?theme=${pdfTheme}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
      } else {
        // Guest report — POST the data directly
        res = await fetch('./index.php/api/guest_pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...report, theme: pdfTheme }),
        });
      }
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = (report.label||'report').replace(/[^a-zA-Z0-9_-]/g,'_') + '_TM30.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) { alert('PDF error: ' + e.message); }
    finally { setDL(false); }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.bg,fontFamily:'monospace',overflow:'hidden'}}>

      {/* Header */}
      <div style={{padding:'14px 22px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexShrink:0,background:C.surface2}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:'#ffffff',marginBottom:4}}>{report.label}</div>
          <div style={{fontSize:13,color:C.dim,fontWeight:500}}>{report.sourceType?.toUpperCase()} · {new Date(report.createdAt.replace(' ','T')).toLocaleString()}</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
            {['report','3d'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?'rgba(0,212,255,0.14)':'none',border:'none',padding:'8px 16px',fontSize:13,textTransform:'uppercase',letterSpacing:1,color:tab===t?C.accent:C.dim,cursor:'pointer',fontFamily:'monospace',fontWeight:tab===t?700:400}}>
                {t==='report'?'Report':'3D Plot'}
              </button>
            ))}
          </div>
          {/* PDF download hidden for now */}
          <button onClick={toggleTheme} title={themeName==='dark'?'Light mode':'Dark mode'}
            style={{background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'7px 12px',fontSize:16,cursor:'pointer'}}>
            {themeName==='dark'?'☀':'🌙'}
          </button>
        </div>
      </div>

      {tab==='report' ? (
        <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>

          {/* Row 1: Source metadata editor */}
          <MetaEditor report={report} isGuest={isGuest} onSave={saveMetadata}/>

          {/* Row 2: SPD (left) + 3 bar charts (right) */}
          <div style={{padding:'16px 22px',borderBottom:`1px solid ${C.border}`,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={S.sHead}>Spectral Power Distribution</div>
              {report.wls&&report.vals
                ? <SPDChart wls={report.wls} vals={report.vals} theme={T}/>
                : <div style={{height:160,background:C.surface,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',color:C.dim,fontSize:11}}>No spectral data</div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <BinBarChart title="Local Chroma Shift (Rcs,hj)" rfBins={rfBins} mode="chroma" theme={T}/>
              <BinBarChart title="Local Hue Shift (Rhs,hj)"    rfBins={rfBins} mode="hue" theme={T}/>
              <BinBarChart title="Local Color Fidelity (Rf,hj)" rfBins={rfBins} mode="fidelity" theme={T}/>
            </div>
          </div>

          {/* Row 3: CVG (left) + Metrics + Interpretation (right) */}
          <div style={{padding:'16px 22px',borderBottom:`1px solid ${C.border}`,display:'grid',gridTemplateColumns:'auto 1fr',gap:24}}>
            <CVGWheel rfBins={rfBins} Rg={report.Rg||100} Rf={report.Rf||80} cct={report.cct} duv={report.duv} size={260} theme={T}/>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                <Metric label="CIE x"    value={report.x?.toFixed(4)} />
                <Metric label="CIE y"    value={report.y?.toFixed(4)} />
                <Metric label="CCT"      value={report.cct?report.cct+'K':null} color={C.accent} />
                <Metric label="Duv"      value={report.duv!=null?(report.duv>=0?'+':'')+report.duv.toFixed(4):null} color={Math.abs(report.duv??1)<.006?C.good:Math.abs(report.duv??1)<.012?C.warn:C.bad} />
                <Metric label="Ra (CRI)" value={report.ra!=null?Math.round(report.ra):null} />
                <Metric label="R9"       value={report.r9!=null?Math.round(report.r9):null} />
              </div>
              {report.ri && Object.keys(report.ri).length > 0 && <CRIBars ri={report.ri} C={C}/>}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:'10px 14px'}}>
                <div style={S.sHead}>Interpretation</div>
                {[
                  [report.Rf!=null?`Rf ${report.Rf}`:'Rf -', interpRf(report.Rf)],
                  [report.Rg!=null?`Rg ${report.Rg}`:'Rg -', interpRg(report.Rg)],
                  [report.duv!=null?`Duv ${(report.duv>=0?'+':'')+report.duv.toFixed(4)}`:'Duv -', interpDuv(report.duv)],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.accent,minWidth:90,flexShrink:0}}>{k}</div>
                    <div style={{fontSize:13,color:C.text,lineHeight:1.7}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,color:C.dim,textAlign:'center',fontStyle:'italic'}}>
                Colors are for visual orientation purposes only.
              </div>
            </div>
          </div>

          {/* Row 4: CES 99 color bars */}
          <div style={{padding:'16px 22px 32px'}}>
            <CESBars rfBins={rfBins} theme={T}/>
          </div>

        </div>
      ) : (
        <div style={{flex:1,position:'relative'}}>
          <ThreeViewer reports={allReports.filter(r=>r.x&&r.y)} activeId={report.id} minRf={0}
            viewCmd={`focus:${report.x||.33}:${report.y||.33}:${report.Rf||50}`}/>
          <div style={{position:'absolute',bottom:12,left:14,fontSize:11,color:C.dim,pointerEvents:'none',lineHeight:2}}>
            drag rotate · scroll zoom · right-drag pan
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({label,value,color}){
  return(
    <div style={{background:'rgba(0,0,0,0.3)',border:`1px solid rgba(80,160,220,0.2)`,borderRadius:6,padding:'10px 12px'}}>
      <div style={{fontSize:11,textTransform:'uppercase',letterSpacing:1,color:'#7aaccc',marginBottom:5,fontWeight:700}}>{label}</div>
      <div style={{fontSize:24,fontWeight:700,color:color||'#e8f4ff'}}>{value??'—'}</div>
    </div>
  );
}

function interpRf(rf){if(rf==null)return'No data.';if(rf>=90)return'Excellent fidelity. Colors appear nearly identical to a reference illuminant.';if(rf>=80)return'Good fidelity. Minor color differences under close comparison.';if(rf>=70)return'Moderate fidelity. Noticeable shifts in some hues.';return'Low fidelity. Significant color distortion likely.';}
function interpRg(rg){if(rg==null)return'No data.';if(rg>110)return'Gamut significantly expanded — colors appear more vivid/saturated.';if(rg>102)return'Slightly expanded gamut. Objects may appear marginally more vivid.';if(rg>=98)return'Gamut closely matches the reference — natural color saturation.';if(rg>=90)return'Slightly reduced gamut. Colors may appear less saturated.';return'Gamut significantly reduced — colors appear notably desaturated.';}
function interpDuv(d){if(d==null)return'No data.';const dir=d>0?'above BBL (slight green tint)':'below BBL (slight pink tint)';const abs=Math.abs(d);if(abs<.002)return'Extremely close to the Planckian locus.';if(abs<.006)return`Very close (${dir}). Within acceptable limits.`;if(abs<.012)return`Moderate deviation ${dir}.`;return`Large deviation ${dir}.`;}

const S={
  sHead:{fontSize:12,textTransform:'uppercase',letterSpacing:1.5,color:'#7aaccc',marginBottom:10,fontWeight:700},
};