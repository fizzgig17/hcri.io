import { useState, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';

export default function AuthScreen({ onLogin, onRegister, onGuestUpload }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const [tab,setTab]=useState('login');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  const [guestLoading,setGuestLoading]=useState(false);
  const [liEmail,setLiEmail]=useState('');
  const [liPass,setLiPass]=useState('');
  const [rgName,setRgName]=useState('');
  const [rgEmail,setRgEmail]=useState('');
  const [rgPass,setRgPass]=useState('');
  const fileRef = useRef();
  const [over,setOver]=useState(false);

  async function submit(e){
    e.preventDefault();setErr('');setLoading(true);
    try{if(tab==='login')await onLogin(liEmail,liPass);else await onRegister(rgName,rgEmail,rgPass);}
    catch(ex){setErr(ex.message);}finally{setLoading(false);}
  }

  async function handleGuestFile(file) {
    if (!file) return;
    setGuestLoading(true); setErr('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', file.name.replace(/\.[^.]+$/, ''));
    try {
      const r = await fetch('./index.php/api/guest_analyze', { method:'POST', body:fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || r.statusText);
      onGuestUpload(j);
    } catch(ex) { setErr('Upload error: ' + ex.message); }
    finally { setGuestLoading(false); }
  }

  const iStyle = {background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:'11px 13px', color:T.text, fontSize:14, outline:'none', width:'100%', fontFamily:'monospace'};
  const lStyle = {fontSize:12, textTransform:'uppercase', letterSpacing:1, color:T.dim, fontWeight:700, display:'block', marginBottom:6};
  const cardStyle = {background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:'28px 28px 24px', display:'flex', flexDirection:'column', gap:16};

  return (
    <div style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, padding:'20px'}}>

      {/* Theme toggle */}
      <button onClick={toggleTheme}
        style={{position:'absolute', top:16, right:16, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, padding:'8px 12px', fontSize:18, cursor:'pointer', color:T.text}}>
        {themeName==='dark' ? '☀' : '🌙'}
      </button>

      <div style={{width:'100%', maxWidth:860, display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start'}}>

        {/* Left: Guest */}
        <div style={cardStyle}>
          <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:1, color:T.accent, fontWeight:700}}>No account needed</div>
          <div style={{fontSize:22, fontWeight:900, color:T.white}}>Quick Analysis</div>
          <div style={{fontSize:13, color:T.dim, lineHeight:1.6, marginTop:-8}}>Upload a CSV or JSON file for an instant TM-30 report. Results are not saved.</div>

          <div style={{border:`2px dashed ${T.accent}50`, borderRadius:10, padding:'28px 16px', textAlign:'center', cursor:'pointer', transition:'all .2s',
              background:over?`${T.accent}10`:`${T.accent}05`,
              ...(over?{borderColor:T.accent}:{})}}
            onClick={()=>fileRef.current.click()}
            onDragOver={e=>{e.preventDefault();setOver(true);}}
            onDragLeave={()=>setOver(false)}
            onDrop={e=>{e.preventDefault();setOver(false);if(e.dataTransfer.files[0])handleGuestFile(e.dataTransfer.files[0]);}}>
            <div style={{fontSize:36, marginBottom:8}}>{guestLoading?'⏳':'📂'}</div>
            <div style={{fontSize:15, color:T.text, fontWeight:600, marginBottom:4}}>
              {guestLoading?'Analyzing…':'Drop CSV or JSON file here'}
            </div>
            <div style={{fontSize:13, color:T.dim}}>or click to browse</div>
            <div style={{display:'flex', gap:6, justifyContent:'center', marginTop:10}}>
              {['.csv','.tsv','.txt','.json'].map(e=>(
                <span key={e} style={{fontSize:11, padding:'3px 8px', borderRadius:20, background:`${T.accent}15`, border:`1px solid ${T.accent}40`, color:T.dim}}>{e}</span>
              ))}
            </div>
          </div>
          <input ref={fileRef} type="file" accept=".csv,.txt,.tsv,.json" style={{display:'none'}}
            onChange={e=>{if(e.target.files[0]){handleGuestFile(e.target.files[0]);e.target.value='';}}}/>
          <div style={{fontSize:12, color:T.dim, textAlign:'center'}}>Results shown immediately · Not saved to database</div>
        </div>

        {/* Right: Sign in */}
        <div style={cardStyle}>
          <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:1, color:T.accent, fontWeight:700, cursor:'pointer'}}
            onClick={()=>{setTab(tab==='login'?'register':'login');setErr('');}}>
            {tab==='login'?'New user? Register →':'Have an account? Sign in →'}
          </div>
          <div style={{fontSize:22, fontWeight:900, color:T.white}}>{tab==='login'?'Sign In':'Create Account'}</div>
          <div style={{fontSize:13, color:T.dim, lineHeight:1.6, marginTop:-8}}>Save reports, track multiple sources, download PDFs.</div>

          <form style={{display:'flex', flexDirection:'column', gap:14}} onSubmit={submit}>
            {tab==='register'&&<div><label style={lStyle}>Name</label><input style={iStyle} type="text" value={rgName} onChange={e=>setRgName(e.target.value)} placeholder="Your name"/></div>}
            <div>
              <label style={lStyle}>Email</label>
              <input style={iStyle} type="email" value={tab==='login'?liEmail:rgEmail} onChange={e=>tab==='login'?setLiEmail(e.target.value):setRgEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/>
            </div>
            <div>
              <label style={lStyle}>Password</label>
              <input style={iStyle} type="password" value={tab==='login'?liPass:rgPass} onChange={e=>tab==='login'?setLiPass(e.target.value):setRgPass(e.target.value)} placeholder={tab==='login'?'••••••••':'Min 8 characters'} autoComplete={tab==='login'?'current-password':'new-password'}/>
            </div>
            <button type="submit" disabled={loading}
              style={{background:T.accent, color:'#060a0f', border:'none', borderRadius:8, padding:'13px', fontWeight:900, fontSize:15, letterSpacing:1, cursor:'pointer', marginTop:4, opacity:loading?.7:1}}>
              {loading?'…':tab==='login'?'Sign In':'Create Account'}
            </button>
          </form>
          {err&&<div style={{fontSize:13, color:T.bad, textAlign:'center', fontWeight:600}}>{err}</div>}
        </div>
      </div>

      <div style={{position:'absolute', top:24, left:'50%', transform:'translateX(-50%)', fontWeight:900, fontSize:24, color:T.white, letterSpacing:1, whiteSpace:'nowrap', fontFamily:'monospace'}}>
        hCRI<span style={{color:T.accent}}>.io</span>
        <span style={{fontSize:12, color:T.dim, fontWeight:400, letterSpacing:'1px', textTransform:'uppercase', marginLeft:12}}>LED · TM-30 · Color Rendering</span>
      </div>
    </div>
  );
}
