import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './lib/ThemeContext';
import { api } from './lib/api';
import AuthScreen  from './components/AuthScreen';
import Sidebar     from './components/Sidebar';
import ReportView  from './components/ReportView';

export default function App() {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const { user, checking, tryAutoLogin, login, register, logout } = useAuth();
  const [reports,    setReports]   = useState([]);
  const [detail,     setDetail]    = useState(null);
  const [activeId,   setActiveId]  = useState(null);
  const [minRf,      setMinRf]     = useState(0);
  const [uploading,  setUploading] = useState(false);
  const [progress,   setProgress]  = useState(0);
  const [progLabel,  setProgLabel] = useState('');
  const [notif,      setNotif]     = useState(null);
  const [guestReport,setGuestReport] = useState(null); // one-off guest result

  useEffect(() => { tryAutoLogin(); }, []);
  useEffect(() => {
    if (!user) { setReports([]); setDetail(null); return; }
    setGuestReport(null); // clear guest report on login
    api.get('/reports').then(setReports).catch(e => showNotif(e.message, 'err'));
  }, [user]);

  function showNotif(msg, type='ok') {
    setNotif({msg,type});
    setTimeout(() => setNotif(null), 3200);
  }

  // Guest one-off — no auth, no save
  function handleGuestUpload(result) {
    setGuestReport(result);
    // Don't redirect to login — just show the report
  }

  async function handleUpload(file) {
    setUploading(true); setProgress(20); setProgLabel('Uploading…');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', file.name.replace(/\.[^.]+$/, ''));
    try {
      setProgress(60); setProgLabel('Analyzing…');
      const r = await api.upload('/reports', fd);
      setProgress(100); setProgLabel('Done ✓');
      setReports(prev => [r, ...prev]);
      handleSelect(r.id);
      showNotif('Saved: ' + r.label, 'ok');
      setTimeout(() => setUploading(false), 1500);
    } catch(e) { setUploading(false); showNotif(e.message, 'err'); }
  }

  async function handleSelect(id) {
    if (!id) return;
    setActiveId(id);
    try { const r = await api.get(`/reports/${id}`); setDetail(r); }
    catch(e) { showNotif(e.message, 'err'); }
  }

  async function handleMetaSave(updatedReport) {
    // Update the report in both the list and detail view
    setReports(prev => prev.map(r => r.id === updatedReport.id ? {...r, ...updatedReport} : r));
    setDetail(prev => prev ? {...prev, ...updatedReport} : prev);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this report?')) return;
    try {
      await api.del(`/reports/${id}`);
      setReports(prev => prev.filter(r => r.id !== id));
      if (activeId === id) { setActiveId(null); setDetail(null); }
      showNotif('Deleted', 'ok');
    } catch(e) { showNotif(e.message, 'err'); }
  }

  if (checking) return (
    <div style={{background:T.bg,height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:T.dim,fontFamily:'monospace',fontSize:14}}>
      Loading…
    </div>
  );

  // ── Guest report view (not logged in, just uploaded a file) ──────────────
  if (!user && guestReport) {
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#060a0f'}}>
        {/* Guest banner */}
        <div style={{background:T.surface2,borderBottom:`1px solid ${T.border}`,padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{fontWeight:900,fontSize:18,color:T.white,fontFamily:'monospace'}}>
            hCRI<span style={{color:T.accent}}>.io</span>
            <span style={{fontSize:12,color:T.dim,fontWeight:400,marginLeft:12}}>Guest mode — results not saved</span>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={toggleTheme}
              style={{background:T.surface,border:`1px solid ${T.border}`,color:T.text,borderRadius:6,padding:'7px 12px',fontSize:16,cursor:'pointer'}}>
              {themeName==='dark'?'☀':'🌙'}
            </button>
            <button onClick={()=>setGuestReport(null)}
              style={{background:`${T.accent}15`,border:`1px solid ${T.accent}50`,color:T.accent,borderRadius:6,padding:'7px 14px',fontSize:13,cursor:'pointer',fontFamily:'monospace',fontWeight:600}}>
              ← Analyze Another
            </button>
            <button onClick={()=>setGuestReport(null)}
              style={{background:T.accent,border:'none',color:'#060a0f',borderRadius:6,padding:'7px 14px',fontSize:13,cursor:'pointer',fontFamily:'monospace',fontWeight:700}}>
              Sign In to Save
            </button>
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>
          <ReportView report={guestReport} allReports={[guestReport]} isGuest={true}/>
        </div>
      </div>
    );
  }

  // ── Auth screen ──────────────────────────────────────────────────────────
  if (!user) {
    return <AuthScreen onLogin={login} onRegister={register} onGuestUpload={handleGuestUpload}/>;
  }

  // ── Logged-in app ────────────────────────────────────────────────────────
  return (
    <div style={{display:'flex',height:'100vh',overflow:'hidden',background:T.bg}}>
      <Sidebar user={user} reports={reports} activeId={activeId}
        uploading={uploading} uploadProgress={progress} uploadLabel={progLabel}
        onUpload={handleUpload} onSelect={handleSelect} onDelete={handleDelete} onLogout={logout}
        minRf={minRf} onMinRfChange={setMinRf}/>
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <ReportView report={detail} allReports={reports} onMetaSave={handleMetaSave}/>
      </div>
      {notif&&(
        <div style={{position:'fixed',bottom:18,left:'50%',transform:'translateX(-50%)',background:T.surface2,borderRadius:6,padding:'10px 18px',fontSize:13,letterSpacing:.5,zIndex:200,pointerEvents:'none',border:`1px solid ${notif.type==='err'?T.bad+'60':T.good+'60'}`,color:notif.type==='err'?T.bad:T.good}}>
          {notif.msg}
        </div>
      )}
    </div>
  );
}
