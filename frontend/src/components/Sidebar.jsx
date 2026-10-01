import { useRef, useState } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';

function rfColor(rf, T) {
  if (rf == null) return T.dim;
  const t = rf/100;
  if (t < 0.7) return T.bad;
  if (t < 0.85) return T.warn;
  return T.good;
}

export default function Sidebar({ user, reports, activeId, isMobile=false, uploading, uploadProgress, uploadLabel, onUpload, onSelect, onDelete, onLogout, minRf, onMinRfChange }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const fileRef = useRef();
  const [over, setOver] = useState(false);

  const S = {
    // Desktop: a fixed-width docked pane next to the report view. Mobile:
    // this IS the full screen (App only renders one of Sidebar/ReportView
    // at a time there), so it fills the viewport instead of being squeezed
    // into a 290px sliver.
    sidebar:   { width: isMobile ? '100%' : 290, flexShrink:0, background:T.surface2, borderRight: isMobile ? 'none' : `1px solid ${T.border}`, display:'flex', flexDirection:'column', overflow:'hidden' },
    head:      { padding:'18px 16px 14px', borderBottom:`1px solid ${T.border}`, background:T.surface3 },
    logoutBtn: { fontSize:12, color:T.dim, background:'none', border:`1px solid ${T.border}`, borderRadius:4, padding:'4px 10px', cursor:'pointer' },
    body:      { flex:1, overflow:'hidden', display:'flex', flexDirection:'column' },
    dropZone:  { margin:12, border:`2px dashed ${T.accent}40`, borderRadius:8, padding:'16px 14px', textAlign:'center', cursor:'pointer', transition:'all .2s', background:`${T.accent}05` },
    dropOver:  { borderColor:T.accent, background:`${T.accent}12` },
    secHead:   { padding:'10px 16px 6px', fontSize:12, textTransform:'uppercase', letterSpacing:'1.5px', color:T.dim, borderBottom:`1px solid ${T.border}`, fontWeight:700 },
    item:      { display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', cursor:'pointer', borderLeft:'3px solid transparent', transition:'background .1s' },
    activeItem:{ background:`${T.accent}12`, borderLeftColor:T.accent },
    delBtn:    { fontSize:16, color:T.dim, border:'none', background:'none', cursor:'pointer', padding:'2px 5px', flexShrink:0 },
    empty:     { padding:'24px 16px', textAlign:'center', fontSize:14, color:T.dim, lineHeight:2.2 },
    controls:  { padding:'12px 14px', borderTop:`1px solid ${T.border}`, marginTop:'auto' },
  };

  return (
    <div style={S.sidebar}>
      <div style={S.head}>
        <div style={{fontWeight:900, fontSize:20, color:T.white, letterSpacing:1, marginBottom:6}}>
          hCRI<span style={{color:T.accent}}>.io</span>
        </div>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:14, color:T.text, fontWeight:500}}>{user?.name}</span>
          <div style={{display:'flex', gap:6}}>
            <button onClick={toggleTheme} title={themeName==='dark'?'Switch to light mode':'Switch to dark mode'}
              style={{...S.logoutBtn, fontSize:16, padding:'3px 8px'}}>
              {themeName==='dark' ? '☀' : '🌙'}
            </button>
            <button style={S.logoutBtn} onClick={onLogout}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={S.body}>
        <div style={{...S.dropZone,...(over?S.dropOver:{})}}
          onClick={() => fileRef.current.click()}
          onDragOver={e=>{e.preventDefault();setOver(true);}}
          onDragLeave={()=>setOver(false)}
          onDrop={e=>{e.preventDefault();setOver(false);if(e.dataTransfer.files[0])onUpload(e.dataTransfer.files[0]);}}>
          <div style={{fontSize:28, marginBottom:6}}>📂</div>
          <div style={{fontSize:14, color:T.text, lineHeight:1.6, fontWeight:500}}>
            <strong style={{color:T.accent, display:'block', marginBottom:2}}>Upload CSV or JSON</strong>
            wavelength · power · TM-30
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.txt,.tsv,.json" style={{display:'none'}}
          onChange={e=>{if(e.target.files[0]){onUpload(e.target.files[0]);e.target.value='';}}} />

        {uploading && (
          <div style={{padding:'0 12px 10px'}}>
            <div style={{height:4, background:`${T.accent}20`, borderRadius:2, overflow:'hidden'}}>
              <div style={{height:'100%', width:uploadProgress+'%', background:T.accent, transition:'width .4s', borderRadius:2}}/>
            </div>
            <div style={{fontSize:13, color:T.dim, marginTop:4}}>{uploadLabel}</div>
          </div>
        )}

        <div style={S.secHead}>Saved Reports</div>

        <div style={{flex:1, overflowY:'auto'}}>
          {!reports.length
            ? <div style={S.empty}>No reports yet.<br/>Upload a CSV or JSON file to begin.</div>
            : reports.map(r => (
              <div key={r.id} style={{...S.item,...(r.id===activeId?S.activeItem:{})}} onClick={()=>onSelect(r.id)}>
                <div style={{width:10, height:10, borderRadius:'50%', background:rfColor(r.Rf,T), flexShrink:0, marginTop:3}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, color:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:600, marginBottom:2}}>{r.label}</div>
                  <div style={{fontSize:12, color:T.dim}}>{r.cct?r.cct+'K · ':''}{new Date(r.createdAt.replace(' ','T')).toLocaleDateString()}</div>
                </div>
                <div style={{fontSize:15, fontWeight:700, color:rfColor(r.Rf,T), flexShrink:0, marginRight:6}}>{r.Rf??'—'}</div>
                <button style={S.delBtn} title="Delete report"
                  onMouseEnter={e=>Object.assign(e.currentTarget.style,{color:'#ff4466'})}
                  onMouseLeave={e=>Object.assign(e.currentTarget.style,{color:T.dim})}
                  onClick={e=>{e.stopPropagation();onDelete(r.id);}}>🗑</button>
              </div>
            ))
          }
        </div>

        <div style={S.controls}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <span style={{fontSize:13, color:T.text, flex:1, fontWeight:500}}>Min Rf filter</span>
            <span style={{fontSize:14, color:T.accent, fontWeight:700, minWidth:28, textAlign:'right'}}>{minRf}</span>
          </div>
          <input type="range" min="0" max="100" value={minRf}
            onChange={e=>onMinRfChange(+e.target.value)}
            style={{width:'100%', accentColor:T.accent}}/>
        </div>
      </div>
    </div>
  );
}
