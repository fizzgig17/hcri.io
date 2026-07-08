import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function rfCol3(rf) {
  const t=(rf??0)/100;
  if(t<.5)return new THREE.Color(.8+.2*t*2,.2+.4*t*2,.1);
  return new THREE.Color(.8-.6*(t-.5)*2,.7,.1+.7*(t-.5)*2);
}
function cctXy(T) {
  if(T<1667||T>25000)return null;
  const x=T<=4000?-0.2661239e9/T**3-0.2343580e6/T**2+0.8776956e3/T+0.179910:-3.0258469e9/T**3+2.1070379e6/T**2+0.2226347e3/T+0.240390;
  const y=T<=2222?-1.1063814*x**3-1.34811020*x**2+2.18555832*x-0.20219683:T<=4000?-0.9549476*x**3-1.37418593*x**2+2.09137015*x-0.16748867:3.0817580*x**3-5.87338670*x**2+3.75112997*x-0.37001483;
  return{x,y};
}
function p3(x,y,cri){return new THREE.Vector3(x/.8,cri/100,y/.9);}

const LOCUS=[[.1741,.005],[.174,.005],[.1736,.0049],[.173,.0048],[.1726,.0048],[.1714,.0051],[.1689,.0069],[.1644,.0138],[.1566,.0177],[.144,.0297],[.1241,.0578],[.0913,.1327],[.0454,.295],[.0082,.5384],[.0139,.695],[.0743,.8338],[.1547,.8059],[.2296,.7543],[.3016,.6923],[.3731,.6245],[.4441,.5547],[.5125,.4866],[.5752,.4242],[.627,.3725],[.6658,.334],[.6915,.3083],[.7079,.292],[.714,.2859]];
const REFS=[{x:.4476,y:.4074,Rf:100,label:'CIE A (2856K)'},{x:.3127,y:.329,Rf:100,label:'D65 (6504K)'},{x:.3818,y:.3797,Rf:80,label:'Typ LED 3000K'},{x:.3447,y:.3553,Rf:80,label:'Typ LED 4000K'},{x:.38,y:.35,Rf:24,label:'HPS Sodium'}];

export default function ThreeViewer({ reports=[], activeId, minRf=0, viewCmd, onHover, onClearHover }) {
  const canvasRef = useRef();
  const st = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({canvas,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x060a0f);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a0f,.13);
    const camera = new THREE.PerspectiveCamera(50,1,.01,100);
    let sph={theta:.9,phi:.85,r:4}, pan=new THREE.Vector3(.5,.5,.5);

    function camUpdate(){
      camera.position.set(sph.r*Math.sin(sph.phi)*Math.sin(sph.theta)+pan.x,sph.r*Math.cos(sph.phi)+pan.y,sph.r*Math.sin(sph.phi)*Math.cos(sph.theta)+pan.z);
      camera.lookAt(pan);
    }

    let drag=false,right=false,prev={x:0,y:0};
    canvas.addEventListener('mousedown',e=>{drag=true;right=e.button===2;prev={x:e.clientX,y:e.clientY};});
    canvas.addEventListener('contextmenu',e=>e.preventDefault());
    const onMove=e=>{
      if(!drag)return;
      const dx=(e.clientX-prev.x)*.007,dy=(e.clientY-prev.y)*.007;
      prev={x:e.clientX,y:e.clientY};
      if(right){const r=new THREE.Vector3();camera.getWorldDirection(r);r.cross(camera.up).normalize();pan.addScaledVector(r,-dx*.4);pan.addScaledVector(camera.up,dy*.4);}
      else{sph.theta-=dx;sph.phi=Math.max(.05,Math.min(Math.PI-.05,sph.phi+dy));}
      camUpdate();
    };
    window.addEventListener('mousemove',onMove);
    window.addEventListener('mouseup',()=>drag=false);
    canvas.addEventListener('wheel',e=>{sph.r=Math.max(.5,Math.min(12,sph.r+e.deltaY*.003));camUpdate();});

    // Static scene
    const grid=new THREE.GridHelper(1.3,13,0x0e2838,0x091820);grid.position.set(.5,0,.5);scene.add(grid);
    [[new THREE.Vector3(0,0,0),new THREE.Vector3(1.15,0,0),0xff5555],[new THREE.Vector3(0,0,0),new THREE.Vector3(0,1.15,0),0x55aaff],[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,1.15),0x55ff99]].forEach(([a,b,c])=>scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:c,transparent:true,opacity:.55}))));
    const lp=LOCUS.map(([x,y])=>p3(x,y,0));lp.push(lp[0].clone());
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.1})));
    const ccts=[];for(let T=1500;T<=12000;T+=60)ccts.push(T);
    [0,50,100].forEach((cri,i)=>{const pts=ccts.map(T=>{const p=cctXy(T);return p?p3(p.x,p.y,cri):null;}).filter(Boolean);scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffd580,transparent:true,opacity:i===0?.3:.08})));});
    const seg=[];ccts.forEach(T=>{const p=cctXy(T);if(!p)return;seg.push(p3(p.x,p.y,0));seg.push(p3(p.x,p.y,100));});
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg),new THREE.LineBasicMaterial({color:0xffd580,transparent:true,opacity:.05})));
    [1500,2000,2500,3000,4000,5000,6500,10000].forEach(T=>{const p=cctXy(T);if(!p)return;const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p3(p.x,p.y,0),p3(p.x,p.y,100)]),new THREE.LineDashedMaterial({color:0x1a3a5a,transparent:true,opacity:.35,dashSize:.025,gapSize:.018}));l.computeLineDistances();scene.add(l);});

    const allMeshes=[];
    REFS.forEach(s=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.013,10,7),new THREE.MeshBasicMaterial({color:rfCol3(s.Rf),transparent:true,opacity:.35}));m.position.copy(p3(s.x,s.y,s.Rf));m.userData={...s,isRef:true};scene.add(m);allMeshes.push(m);});

    // Raycaster
    const rc=new THREE.Raycaster(), m2=new THREE.Vector2();
    canvas.addEventListener('mousemove',e=>{
      const vp=canvas.getBoundingClientRect();
      m2.x=((e.clientX-vp.left)/vp.width)*2-1;m2.y=-((e.clientY-vp.top)/vp.height)*2+1;
      rc.setFromCamera(m2,camera);
      const hits=rc.intersectObjects(allMeshes.filter(m=>m.visible&&m.geometry.type==='SphereGeometry'));
      if(hits.length)onHover(hits[0].object.userData,e.clientX,e.clientY);else onClearHover();
    });

    function resize(){const vp=canvas.parentElement;renderer.setSize(vp.clientWidth,vp.clientHeight);camera.aspect=vp.clientWidth/vp.clientHeight;camera.updateProjectionMatrix();}
    window.addEventListener('resize',resize);resize();

    let raf;
    function animate(){raf=requestAnimationFrame(animate);scene.children.forEach(c=>{if(c.userData?.isRing)c.lookAt(camera.position);});renderer.render(scene,camera);}
    animate();camUpdate();

    st.current={scene,camera,renderer,allMeshes,sph,pan,camUpdate};
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('mousemove',onMove);window.removeEventListener('resize',resize);renderer.dispose();};
  }, []);

  // Sync reports
  useEffect(()=>{
    const{scene,allMeshes}=st.current;if(!scene)return;
    scene.children.filter(c=>c.userData?.isUser||c.userData?.isRing||c.userData?.isDrop||c.userData?.isDot).forEach(c=>scene.remove(c));
    allMeshes.length=0;
    scene.children.filter(c=>c.userData?.isRef).forEach(m=>allMeshes.push(m));
    reports.forEach(r=>{
      if(!r.x||!r.y)return;
      const pos=p3(r.x,r.y,r.Rf||0),col=rfCol3(r.Rf);
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.021,14,9),new THREE.MeshBasicMaterial({color:col}));
      mesh.position.copy(pos);mesh.userData={...r,isUser:true};scene.add(mesh);allMeshes.push(mesh);
      const ring=new THREE.Mesh(new THREE.RingGeometry(.025,.033,16),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,side:THREE.DoubleSide}));
      ring.position.copy(pos);ring.userData={isRing:true};scene.add(ring);
      const drop=new THREE.Line(new THREE.BufferGeometry().setFromPoints([pos.clone(),new THREE.Vector3(pos.x,0,pos.z)]),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.3}));
      drop.userData={isDrop:true};scene.add(drop);
      const dot=new THREE.Mesh(new THREE.CircleGeometry(.013,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.4}));
      dot.rotation.x=-Math.PI/2;dot.position.set(pos.x,.002,pos.z);dot.userData={isDot:true};scene.add(dot);
    });
  },[reports]);

  useEffect(()=>{
    const{allMeshes}=st.current;if(!allMeshes)return;
    allMeshes.forEach(m=>m.visible=(m.userData.Rf??0)>=minRf);
  },[minRf]);

  useEffect(()=>{
    if(!viewCmd||!st.current.camUpdate)return;
    const{sph:s,pan:p,camUpdate}=st.current;
    if(viewCmd==='persp'){s.theta=.9;s.phi=.85;s.r=4;p.set(.5,.5,.5);}
    else if(viewCmd==='top'){s.theta=0;s.phi=.04;s.r=3;p.set(.5,0,.5);}
    else if(viewCmd.startsWith('focus:')){const[,x,y,rf]=viewCmd.split(':').map(Number);const pos=p3(x,y,rf||0);p.set(pos.x,pos.y,pos.z);s.r=1.6;}
    camUpdate();
  },[viewCmd]);

  useEffect(()=>{
    const{allMeshes}=st.current;if(!allMeshes||!activeId)return;
    const mesh=allMeshes.find(m=>m.userData.id===activeId);if(!mesh)return;
    let t=0;const iv=setInterval(()=>{t+=.15;mesh.scale.setScalar(1+.3*Math.sin(t));if(t>Math.PI*2){mesh.scale.setScalar(1);clearInterval(iv);}},16);
    return()=>clearInterval(iv);
  },[activeId]);

  return <canvas ref={canvasRef} style={{display:'block',width:'100%',height:'100%'}} />;
}
