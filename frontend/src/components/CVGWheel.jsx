import { useEffect, useRef } from 'react';

function hueRGB(h) {
  return [
    Math.max(20,Math.min(235,Math.round(140+Math.sin(h*Math.PI/180)*90))),
    Math.max(20,Math.min(235,Math.round(140+Math.sin((h+120)*Math.PI/180)*90))),
    Math.max(20,Math.min(235,Math.round(140+Math.sin((h+240)*Math.PI/180)*90))),
  ];
}

export default function CVGWheel({ rfBins=[], rcsBins=[], rhsBins=[], cvgTest=[], Rg=100, Rf=80, size=260 }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current; if(!canvas) return;
    const dpr = devicePixelRatio||1;
    canvas.width = size*dpr; canvas.height = size*dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr);
    const cx=size/2, cy=size/2, rRef=size*0.36, rIn=size*0.14;

    // Background
    ctx.fillStyle='rgba(0,0,0,0.04)';
    ctx.beginPath(); ctx.arc(cx,cy,rRef+size*.07,0,Math.PI*2); ctx.fill();

    // Reference rings
    [50,75,100,125].forEach(pct=>{
      ctx.beginPath(); ctx.arc(cx,cy,rRef*(pct/100),0,Math.PI*2);
      ctx.strokeStyle = pct===100?'rgba(24,95,165,0.55)':'rgba(150,175,200,0.2)';
      ctx.lineWidth = pct===100?1.5:0.7;
      ctx.setLineDash(pct===100?[]:[3,3]); ctx.stroke(); ctx.setLineDash([]);
    });

    // Radials
    ctx.strokeStyle='rgba(150,175,200,0.15)'; ctx.lineWidth=0.5;
    for(let a=0;a<16;a++){
      const ang=(90-a*22.5)*Math.PI/180;
      ctx.beginPath();
      ctx.moveTo(cx+rIn*Math.cos(ang),cy-rIn*Math.sin(ang));
      ctx.lineTo(cx+(rRef+size*.06)*Math.cos(ang),cy-(rRef+size*.06)*Math.sin(ang));
      ctx.stroke();
    }

    // Vectors
    // TM-30-18 CVG radii: chroma ratio C_test/C_ref (== 1 + Rcs,hj), scaled
    // to a percentage so the existing r = bins[i]/100 maths still applies.
    const cvg = cvgTest.length===16
      ? cvgTest.map(p=>Math.hypot(p[0],p[1]))
      : (rcsBins.length===16 ? rcsBins.map(v=>1+Number(v||0)) : null);
    const bins=(cvg||Array(16).fill(1)).map(r=>r*100);
    bins.forEach((v,h)=>{
      const t=v/100, binR=rRef*t;
      const ang=(90-h*22.5)*Math.PI/180;
      const tx=cx+binR*Math.cos(ang), ty=cy-binR*Math.sin(ang);
      const [r,g,b]=hueRGB(h*22.5);
      const col=`rgb(${r},${g},${b})`;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(tx,ty);
      ctx.strokeStyle=col; ctx.lineWidth=2.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(tx,ty,3.5,0,Math.PI*2);
      ctx.fillStyle=col; ctx.fill();
      // Bin value label
      const lr=rRef+size*0.11;
      ctx.font=`${Math.round(size*.037)}px monospace`;
      ctx.fillStyle=col; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(Math.round(v), cx+lr*Math.cos(ang), cy-lr*Math.sin(ang));
    });

    // Centre
    ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2);
    ctx.fillStyle='rgba(80,100,140,0.7)'; ctx.fill();

    // Rg label
    ctx.font=`bold ${Math.round(size*.072)}px monospace`;
    ctx.fillStyle='rgba(83,58,183,0.85)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(`Rg ${Math.round(Rg)}`,cx,cy-rIn*.4);

    // Ring label
    ctx.font=`${Math.round(size*.034)}px monospace`;
    ctx.fillStyle='rgba(24,95,165,0.6)'; ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillText('100',cx+rRef+2,cy);
  }, [rfBins,Rg,Rf,size]);

  return <canvas ref={ref} style={{width:size,height:size,display:'block'}} />;
}
