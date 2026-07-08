import { useEffect, useRef } from 'react';

function wlToRGB(wl) {
  if (wl < 440) return [Math.max(0,Math.round(80+(wl-380)*1.2)), 0, Math.min(255,Math.round(120+(wl-380)*1.8))];
  if (wl < 490) return [0, Math.round(205*((wl-440)/50)), 255];
  if (wl < 510) return [0, 205, Math.round(255*(1-(wl-490)/20))];
  if (wl < 580) return [Math.round(255*((wl-510)/70)), Math.round(200+55*(1-(wl-510)/70)), 0];
  if (wl < 645) return [255, Math.round(200*(1-(wl-580)/65)), 0];
  return [Math.round(255*(1-(wl-645)/135*0.3)), 0, 0];
}

export default function SPDChart({ wls, vals, height = 140 }) {
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !wls?.length) return;
    const dpr = devicePixelRatio || 1;
    const W = canvas.offsetWidth, H = height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pL=36, pR=12, pT=10, pB=28;
    const cW=W-pL-pR, cH=H-pT-pB;
    const maxV=Math.max(...vals), minWl=Math.min(...wls), span=Math.max(1,Math.max(...wls)-minWl);

    ctx.fillStyle='rgba(0,0,0,0.04)'; ctx.fillRect(pL,pT,cW,cH);

    // Grid
    ctx.strokeStyle='rgba(150,175,200,0.2)'; ctx.lineWidth=0.5;
    for(let i=0;i<=4;i++){const gy=pT+cH-(i/4)*cH;ctx.beginPath();ctx.moveTo(pL,gy);ctx.lineTo(pL+cW,gy);ctx.stroke();}
    [400,450,500,550,600,650,700,750].forEach(wl=>{
      const gx=pL+((wl-minWl)/span)*cW;
      if(gx<pL||gx>pL+cW)return;
      ctx.beginPath();ctx.moveTo(gx,pT);ctx.lineTo(gx,pT+cH);ctx.stroke();
    });

    // Coloured slices
    wls.forEach((wl,i)=>{
      if(i===0)return;
      const mid=(wl+wls[i-1])/2;
      const [r,g,b]=wlToRGB(Math.round(mid));
      const x1=pL+((wls[i-1]-minWl)/span)*cW, x2=pL+((wl-minWl)/span)*cW;
      const avgH=((vals[i-1]+vals[i])/2/maxV)*cH*0.95;
      const lr=Math.min(255,Math.round(210+(r-210)*0.45)), lg=Math.min(255,Math.round(210+(g-210)*0.45)), lb=Math.min(255,Math.round(210+(b-210)*0.45));
      ctx.fillStyle=`rgb(${Math.max(0,lr)},${Math.max(0,lg)},${Math.max(0,lb)})`;
      ctx.fillRect(x1,pT+cH-avgH,Math.max(0.5,x2-x1),avgH);
    });

    // Curve
    ctx.beginPath();
    wls.forEach((wl,i)=>{
      const px=pL+((wl-minWl)/span)*cW, py=pT+cH-(vals[i]/maxV)*cH*0.95;
      i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
    });
    ctx.strokeStyle='rgba(30,60,100,0.75)'; ctx.lineWidth=1.5; ctx.stroke();

    // Border
    ctx.strokeStyle='rgba(100,130,160,0.4)'; ctx.lineWidth=0.8; ctx.strokeRect(pL,pT,cW,cH);

    // Labels
    ctx.font='9px monospace'; ctx.fillStyle='rgba(80,110,140,0.8)'; ctx.textAlign='center';
    [400,450,500,550,600,650,700,750].forEach(wl=>{
      const gx=pL+((wl-minWl)/span)*cW;
      if(gx<pL||gx>pL+cW)return;
      ctx.fillText(wl,gx,pT+cH+14);
    });
    ctx.textAlign='right';
    ['0','0.5','1.0'].forEach((l,i)=>ctx.fillText(l,pL-3,pT+cH-(i/2)*cH+3));
    ctx.textAlign='center';
    ctx.fillText('Wavelength (nm)',pL+cW/2,H-4);
  }, [wls, vals, height]);

  return <canvas ref={ref} style={{width:'100%',height,display:'block',borderRadius:4}} />;
}
