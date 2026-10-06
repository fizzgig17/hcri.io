// frontend/src/components/AuthScreen.jsx
//
// Reconstructed from the deployed assets/app.js (minified functions D and E)
// -- the stale frontend/src this replaces had a much simpler guest-upload +
// login/register screen with no marketing copy, no "Explore" link, no
// featured-reports strip, and a password-reset flow bolted on separately.
// The real deployed screen is a full landing page: marketing hero, a
// try-it-free upload box (with a "paste data instead" option), a featured
// reports strip, and the login/register form as an overlay modal
// (`overlayMode` lets App.jsx reuse this same component as a modal on top
// of the Explore page instead of a full-screen takeover). "Send Feedback"
// (FeedbackModal, minified `E`) is a separate small modal reachable from the
// footer's Contact link.

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';
import { basePath, setToken } from '../lib/api';
import ReportView from './ReportView';
// "Paste data instead" opens a modal (minified `Le`) that lets a guest paste
// SPD text directly instead of uploading a file, and returns the same shape
// as guest_analyze. That modal is reconstructed as PasteSPDModal.jsx.
import PasteSPDModal from './PasteSPDModal';
import usePanelBackClose from '../hooks/usePanelBackClose';

// ── Feedback / contact modal (bundle: `E`) ─────────────────────────────────
export function FeedbackModal({ user, onClose }) {
  const { theme: T } = useTheme();
  const [message, setMessage]   = useState('');
  const [email, setEmail]       = useState(user?.email || '');
  const [name, setName]         = useState(user?.name || '');
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [err, setErr]           = useState('');
  const [website, setWebsite]   = useState(''); // honeypot field, kept empty

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true); setErr('');
    try {
      const res = await fetch('./index.php/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email, name, website }),
      });
      const data = await res.json();
      if (res.status === 429) throw new Error('You just sent a message — please wait a minute before sending another.');
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setSent(true);
    } catch (ex) {
      setErr(ex.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  const s = {
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 },
    modal: { background:T.surface2, border:`1px solid ${T.border}`, borderRadius:10, width:'100%', maxWidth:420, fontFamily:'monospace', overflow:'hidden' },
    header: { padding:'14px 18px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' },
    body: { padding:20 },
    label: { fontSize:11, color:T.dim, textTransform:'uppercase', letterSpacing:1, fontWeight:700, display:'block', marginBottom:5 },
    input: { width:'100%', background:T.surface, border:`1px solid ${T.border}`, color:T.text, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'monospace', boxSizing:'border-box', marginBottom:12 },
    textarea: { width:'100%', background:T.surface, border:`1px solid ${T.border}`, color:T.text, borderRadius:5, padding:'8px 10px', fontSize:13, fontFamily:'monospace', boxSizing:'border-box', marginBottom:12, resize:'vertical', minHeight:120 },
    btn: { width:'100%', padding:10, borderRadius:5, border:'none', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'monospace', background:T.accent, color:'#000', opacity: sending || !message.trim() ? 0.5 : 1 },
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={{ fontWeight:700, color:T.white, fontSize:15 }}>Send Feedback</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.dim, fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>
        <div style={s.body}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>✓</div>
              <div style={{ fontSize:15, fontWeight:700, color:T.good, marginBottom:8 }}>Message sent!</div>
              <div style={{ fontSize:13, color:T.dim, marginBottom:20 }}>Thanks for the feedback — we read everything.</div>
              <button onClick={onClose} style={{ ...s.btn, width:'auto', padding:'8px 24px' }}>Close</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div style={{ fontSize:13, color:T.dim, marginBottom:16, lineHeight:1.5 }}>
                Bug report, feature idea, or general feedback — we'd love to hear it.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:0 }}>
                <div>
                  <label style={s.label}>Name</label>
                  <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="For a reply" />
                </div>
              </div>
              {/* Honeypot -- hidden from real users, bots that fill every field get caught server-side */}
              <div style={{ position:'absolute', left:-9999, height:0, overflow:'hidden' }} aria-hidden="true">
                <label>Website</label>
                <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
              </div>
              <label style={s.label}>Message <span style={{ color:T.bad }}>*</span></label>
              <textarea style={s.textarea} value={message} onChange={e => setMessage(e.target.value)} placeholder="What's on your mind?" maxLength={2000} required />
              <div style={{ fontSize:11, color:T.dim, textAlign:'right', marginTop:-10, marginBottom:12 }}>{message.length}/2000</div>
              {err && (
                <div style={{ padding:'8px 12px', borderRadius:5, fontSize:12, marginBottom:12, background:`${T.bad}18`, color:T.bad, border:`1px solid ${T.bad}40` }}>
                  {err}
                </div>
              )}
              <button style={s.btn} type="submit" disabled={sending || !message.trim()}>
                {sending ? 'Sending…' : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Landing page / login-register / guest-upload screen (bundle: `D`) ─────
// overlayMode: when true, this is rendered on top of another page (e.g. the
// Explore page) as a modal-only auth prompt rather than the full landing
// page; onOverlayClose closes it in that case instead of toggling local
// state.
export default function AuthScreen({ onLogin, onRegister, onGuestUpload, onExplore, overlayMode, onOverlayClose }) {
  const { theme: T, themeName, toggleTheme } = useTheme();
  const isMobile = useIsMobile(768);

  const [tab, setTab]               = useState('login');
  const [resetOpen, setResetOpen]   = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [resetSent, setResetSent]   = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [err, setErr]               = useState('');
  const [loading, setLoading]       = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [liEmail, setLiEmail]       = useState('');
  const [liPass, setLiPass]         = useState('');
  const [rgName, setRgName]         = useState('');
  const [rgEmail, setRgEmail]       = useState('');
  const [rgPass, setRgPass]         = useState('');
  const fileRef = useRef();
  const guestResultRef = useRef(null);
  const [over, setOver] = useState(false);
  const [remember, setRemember] = useState(() => {
    try { return localStorage.getItem('hcri_remember') !== '0'; }
    catch { return true; }
  });
  const [pasteOpen, setPasteOpen] = useState(false);
  const [guestReport, setGuestReport] = useState(null);
  const [featured, setFeatured] = useState([]);
  usePanelBackClose(resetOpen, () => setResetOpen(false));
  usePanelBackClose(feedbackOpen, () => setFeedbackOpen(false));
  usePanelBackClose(pasteOpen, () => setPasteOpen(false));
  const [authOpen, setAuthOpen] = useState(() => !!overlayMode);
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  function closeAuth() {
    if (overlayMode) onOverlayClose && onOverlayClose();
    else setAuthOpen(false);
  }

  useEffect(() => {
    fetch('./index.php/api/featured')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFeatured(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (guestReport && guestResultRef.current && !window.__hcriIsDesktop?.()) {
      try { guestResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }
  }, [guestReport]);

  async function submitAuth(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (tab === 'register' && !agree) {
        setErr('Please accept the Privacy Policy and Terms to continue.');
        setLoading(false);
        return;
      }
      if (tab === 'login') {
        try { localStorage.setItem('hcri_remember', remember ? '1' : '0'); } catch {}
        await onLogin(liEmail, liPass, remember);
      } else {
        await onRegister(rgName, rgEmail, rgPass);
      }
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestFile(file) {
    if (!file) return;
    setGuestLoading(true); setErr('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', file.name.replace(/\.[^.]+$/, ''));
    try {
      const res = await fetch('./index.php/api/guest_analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || res.statusText);
      setGuestReport(data);
    } catch (ex) {
      setErr('Upload error: ' + ex.message);
    } finally {
      setGuestLoading(false);
    }
  }

  const iStyle = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, padding:'12px 14px', color:T.text, fontSize:16, outline:'none', width:'100%', fontFamily:'monospace' };
  const lStyle = { fontSize:13, textTransform:'uppercase', letterSpacing:1, color:T.dim, fontWeight:700, display:'block', marginBottom:7 };
  const cardStyle = { background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding: isMobile ? '12px 14px' : '16px 18px', display:'flex', flexDirection:'column', gap:10 };

  return (
    <div style={{
      position:'fixed', inset:0, display:'flex',
      alignItems: isMobile ? 'flex-start' : 'center', justifyContent:'flex-start',
      background: overlayMode ? 'transparent' : T.bg,
      padding: isMobile ? '12px' : '20px',
      overflowY:'auto', overflowX:'hidden', flexDirection:'column',
    }}>
      {!overlayMode && (
        <>
          {/* ── Top bar: logo + sign in / register / theme / help ── */}
          <div style={{ textAlign:'center', marginBottom: isMobile?12:20, paddingTop: isMobile?12:0, display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', maxWidth:860 }}>
            <div style={{ fontWeight:900, fontSize: isMobile?20:24, color:T.white, letterSpacing:1, fontFamily:'monospace' }}>
              hCRI<span style={{ color:T.accent }}>.io</span>
              {!isMobile && (
                <span style={{ fontSize:12, color:T.dim, fontWeight:400, letterSpacing:'1px', textTransform:'uppercase', marginLeft:12 }}>
                  LED · TM-30 · Color Rendering
                </span>
              )}
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={() => { setTab('login'); setErr(''); setAuthOpen(true); }}
                style={{ background:'none', border:`1px solid ${T.border}`, color:T.text, borderRadius:8, padding:'6px 12px', fontSize:13, cursor:'pointer', fontFamily:'monospace', fontWeight:600 }}>
                Sign in
              </button>
              <button onClick={() => { setTab('register'); setErr(''); setAuthOpen(true); }}
                style={{ background:T.accent, border:'none', color: themeName==='dark' ? '#060a0f' : '#fff', borderRadius:8, padding:'6px 12px', fontSize:13, cursor:'pointer', fontFamily:'monospace', fontWeight:700 }}>
                Create account
              </button>
              <button onClick={toggleTheme}
                style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, width:38, height:34, padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', boxSizing:'border-box', fontSize:16, cursor:'pointer', color:T.text }}>
                {themeName==='dark' ? '☀' : '🌙'}
              </button>
              <button
                onClick={() => {
                  try { window.dispatchEvent(new CustomEvent('hcri:openHelp', { detail: { title: null } })); } catch {}
                }}
                title="New here? Learn more about hCRI.io"
                style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, width:38, height:34, padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', boxSizing:'border-box', fontSize:14, fontWeight:700, cursor:'pointer', color:T.text, fontFamily:'monospace' }}>
                ?
              </button>
            </div>
          </div>

          {/* ── Marketing hero ── */}
          <div style={{ width:'100%', maxWidth:860, textAlign:'center', marginBottom: isMobile?18:24 }}>
            <div style={{ height:8, borderRadius:8, marginBottom: isMobile?16:20, background:'linear-gradient(90deg,#7c3aed,#2563eb,#06b6d4,#22c55e,#eab308,#f97316,#ef4444)', boxShadow:`0 3px 22px ${T.accent}40` }} />
            <div style={{ fontSize: isMobile?23:34, fontWeight:900, color:T.white, lineHeight:1.15, fontFamily:'monospace' }}>
              How good is your light at showing true color?
            </div>
            <div style={{ fontSize: isMobile?14:16, color:T.dim, lineHeight:1.6, marginTop:12, maxWidth:660, marginLeft:'auto', marginRight:'auto' }}>
              Every lamp, LED or flashlight renders color a little differently. hCRI.io reads a spectral measurement of a light and turns it into a plain‑English report: how accurately it shows color (CRI &amp; TM‑30), how warm or cool it is (CCT), its tint — and a photo preview so you can actually see the difference. Drop a file below to try it free, no account needed.
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginTop: isMobile?16:20 }}>
              <div style={{ flex:'1 1 170px', maxWidth:240, background:T.surface, border:`1px solid ${T.border}`, borderTop:'3px solid #22c55e', borderRadius:10, padding:'12px 14px', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:20 }}>🎨</span>
                  <span style={{ fontSize:14, fontWeight:800, color:T.text }}>Color accuracy</span>
                </div>
                <div style={{ fontSize:12, color:T.dim, marginTop:6, lineHeight:1.45 }}>CRI, R9 and TM‑30 fidelity scores</div>
              </div>
              <div style={{ flex:'1 1 170px', maxWidth:240, background:T.surface, border:`1px solid ${T.border}`, borderTop:'3px solid #f59e0b', borderRadius:10, padding:'12px 14px', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:20 }}>🌡️</span>
                  <span style={{ fontSize:14, fontWeight:800, color:T.text }}>Warmth &amp; tint</span>
                </div>
                <div style={{ fontSize:12, color:T.dim, marginTop:6, lineHeight:1.45 }}>Color temperature and Duv at a glance</div>
              </div>
              <div style={{ flex:'1 1 170px', maxWidth:240, background:T.surface, border:`1px solid ${T.border}`, borderTop:'3px solid #06b6d4', borderRadius:10, padding:'12px 14px', textAlign:'left' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:20 }}>📸</span>
                  <span style={{ fontSize:14, fontWeight:800, color:T.text }}>See it in a photo</span>
                </div>
                <div style={{ fontSize:12, color:T.dim, marginTop:6, lineHeight:1.45 }}>Preview the light on a real scene</div>
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center', marginBottom:12 }}>
            <button onClick={() => onExplore && onExplore()}
              style={{ background:'none', border:'none', color:'#00d4ff', fontSize:14, fontFamily:'monospace', cursor:'pointer', textDecoration:'underline' }}>
              🔭 Explore public reports without logging in →
            </button>
          </div>

          {/* ── Try it free: guest upload box ── */}
          <div style={{ width:'100%', maxWidth:860, display:'grid', gridTemplateColumns:'1fr', gap: isMobile?16:24, alignItems:'start' }}>
            <div style={cardStyle}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:15, fontWeight:900, color:T.white }}>Try it free</span>
                <span style={{ fontSize:12, color:T.dim }}>Upload a file for an instant TM‑30 report — not saved.</span>
              </div>
              <div
                style={{
                  border:`2px dashed ${T.accent}50`, borderRadius:10, padding:'20px 16px', textAlign:'center', cursor:'pointer', transition:'all .2s',
                  background: over ? `${T.accent}10` : `${T.accent}05`,
                  ...(over ? { borderColor:T.accent } : {}),
                }}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={e => { e.preventDefault(); setOver(false); if (e.dataTransfer.files[0]) handleGuestFile(e.dataTransfer.files[0]); }}
              >
                <div style={{ fontSize:14, color:T.text, fontWeight:600 }}>
                  {guestLoading ? '⏳ Analyzing…' : '📂 Drop a file or click to upload'}
                </div>
                <div style={{ fontSize:11, color:T.dim, marginTop:4 }}>.csv · .tsv · .json · .sp</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt,.tsv,.json,.sp" style={{ display:'none' }}
                onChange={e => { if (e.target.files[0]) { handleGuestFile(e.target.files[0]); e.target.value = ''; } }} />

              <details style={{ width:'100%', marginTop:6, marginBottom:2 }}>
                <summary style={{ fontSize:12, color:T.accent, cursor:'pointer', fontFamily:'monospace', fontWeight:700 }}>
                  How do I get a file to upload?
                </summary>
                <div style={{ fontSize:12, color:T.dim, marginTop:8, lineHeight:1.55, textAlign:'left' }}>
                  <div style={{ marginBottom:6 }}>
                    You need a <b style={{ color:T.text }}>spectral measurement (SPD)</b> — a two‑column list of wavelength (nm) and intensity (relative power).
                  </div>
                  <div style={{ marginBottom:6 }}>
                    Most spectral meters can export one — e.g. a <b style={{ color:T.text }}>Hopoocolor</b> or <b style={{ color:T.text }}>Torch Bearer</b> spectrometer, or a <b style={{ color:T.text }}>ColorMunki</b> read with Argyll.
                  </div>
                  <div>
                    Save the spectrum as <b style={{ color:T.text }}>CSV/TSV</b> (wavelength in one column, value in the next), <b style={{ color:T.text }}>JSON</b>, or Argyll <b style={{ color:T.text }}>.sp</b>. Some measurement PDFs work too.
                  </div>
                </div>
              </details>

              <button onClick={() => setPasteOpen(true)}
                style={{ background:'none', border:`1px solid ${T.accent}40`, color:T.accent, borderRadius:8, padding:'7px 12px', fontSize:13, cursor:'pointer', fontFamily:'monospace', fontWeight:700, width:'100%', marginTop:2 }}>
                📋 Paste data instead
              </button>
              {pasteOpen && (
                <PasteSPDModal
                  user={null}
                  onResult={r => { setPasteOpen(false); setGuestReport(r); }}
                  onClose={() => setPasteOpen(false)}
                />
              )}
            </div>
          </div>

          {/* ── Featured reports strip ── */}
          {featured.length > 0 && (
            <div style={{ width:'100%', maxWidth:860, marginTop: isMobile?8:14 }}>
              <div style={{ fontSize:12, textTransform:'uppercase', letterSpacing:1, color:T.dim, fontWeight:700, marginBottom:10, textAlign:'center' }}>
                Featured — tap to explore a report
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:12 }}>
                {featured.map(rep => {
                  const cc = cctToSwatch(rep.cct, T.dim);
                  const qc = (v, lo, hi) => v == null ? T.dim : v >= hi ? T.good : v >= lo ? T.warn : T.bad;
                  return (
                    <div key={rep.id} className="hcri-feat"
                      onClick={() => {
                        fetch('./index.php/api/explore/' + rep.id)
                          .then(r => r.json())
                          .then(d => { if (d && d.id) setGuestReport(d); })
                          .catch(() => {});
                      }}
                      style={{
                        background:`linear-gradient(135deg,${cc}14,${T.surface} 55%)`, border:`1px solid ${T.border}`,
                        borderLeft:`4px solid ${cc}`, borderRadius:10, padding:'12px 14px', cursor:'pointer', textAlign:'left', minWidth:0,
                      }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                        <span style={{ width:12, height:12, borderRadius:'50%', background:cc, boxShadow:`0 0 8px ${cc}99`, flexShrink:0, border:'1px solid rgba(255,255,255,0.3)' }} />
                        <div style={{ fontSize:14, fontWeight:800, color:T.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {rep.label || 'Report #' + rep.id}
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:T.dim, marginTop:6 }}>
                        {rep.cct ? rep.cct + 'K' : '—'}  ·  Ra {rep.ra == null ? '—' : Math.round(rep.ra)}
                      </div>
                      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                        {[
                          ['Rf', rep.Rf, qc(rep.Rf, 80, 90)],
                          ['Rg', rep.Rg, rep.Rg == null ? T.dim : Math.abs(rep.Rg - 100) <= 8 ? T.good : T.warn],
                          ['R9', rep.r9, qc(rep.r9, 50, 80)],
                        ].map(([lb, vv, co]) => (
                          <span key={lb} style={{ fontSize:11, fontFamily:'monospace', fontWeight:700, padding:'2px 7px', borderRadius:4, background:`${co}1f`, border:`1px solid ${co}55`, color:co }}>
                            {lb} {vv == null ? '—' : Math.round(vv)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Guest result (after an upload, before signing in) ── */}
          {guestReport && (
            <div ref={guestResultRef} style={{ width:'100%', maxWidth:1100, marginTop:24, paddingBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, gap:12, flexWrap:'wrap' }}>
                <div style={{ fontSize: isMobile?18:20, fontWeight:900, color:T.white, fontFamily:'monospace' }}>
                  {guestReport && guestReport.id ? 'Featured Report' : 'Your report'}
                </div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <button
                    onClick={() => { setGuestReport(null); try { window.scrollTo({ top:0, behavior:'smooth' }); } catch {} }}
                    style={{ background:T.surface, border:`1px solid ${T.border}`, color:T.text, borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer', fontFamily:'monospace', fontWeight:700 }}>
                    ↻ Analyze another
                  </button>
                  <button
                    onClick={() => { setTab('register'); setErr(''); try { window.scrollTo({ top:0, behavior:'smooth' }); } catch {} }}
                    style={{ background:T.accent, border:'none', color: themeName==='dark' ? '#060a0f' : '#fff', borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer', fontFamily:'monospace', fontWeight:700 }}>
                    Create an account to save it →
                  </button>
                </div>
              </div>
              <div style={{ border:`1px solid ${T.border}`, borderRadius:12, overflow:'hidden', background:T.surface }}>
                <ReportView report={guestReport} allReports={[guestReport]} isGuest={true} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Login / register overlay modal ── */}
      {authOpen && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
          onClick={() => closeAuth()}
        >
          <div onClick={e => e.stopPropagation()} style={{ position:'relative', width:'100%', maxWidth:420 }}>
            <button onClick={() => closeAuth()}
              style={{ position:'absolute', top:-12, right:-4, background:T.surface, border:`1px solid ${T.border}`, borderRadius:'50%', width:30, height:30, color:T.dim, fontSize:15, cursor:'pointer', zIndex:1, lineHeight:1 }}>
              ✕
            </button>
            <div style={cardStyle}>
              <div
                style={{ fontSize:11, textTransform:'uppercase', letterSpacing:1, color:T.accent, fontWeight:700, cursor:'pointer' }}
                onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErr(''); }}
              >
                {tab === 'login' ? 'New user? Register →' : 'Have an account? Sign in →'}
              </div>
              <div style={{ fontSize:22, fontWeight:900, color:T.white }}>{tab === 'login' ? 'Sign In' : 'Create Account'}</div>
              <div style={{ fontSize:14, color:T.dim, lineHeight:1.6, marginTop:-8 }}>
                Save reports, track multiple sources, download PDFs.
              </div>

              <form style={{ display:'flex', flexDirection:'column', gap:14 }} onSubmit={submitAuth}>
                {tab === 'register' && (
                  <div>
                    <label style={lStyle}>Name</label>
                    <input style={iStyle} type="text" value={rgName} onChange={e => setRgName(e.target.value)} placeholder="Your name" />
                  </div>
                )}
                <div>
                  <label style={lStyle}>{tab === 'login' ? 'Email or Username' : 'Email'}</label>
                  <input
                    style={iStyle}
                    type={tab === 'login' ? 'text' : 'email'}
                    value={tab === 'login' ? liEmail : rgEmail}
                    onChange={e => tab === 'login' ? setLiEmail(e.target.value) : setRgEmail(e.target.value)}
                    placeholder={tab === 'login' ? 'you@example.com or username' : 'you@example.com'}
                    autoComplete={tab === 'login' ? 'username' : 'email'}
                    inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    tabIndex={tab === 'login' ? 1 : undefined}
                    autoFocus
                  />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                    <label style={lStyle}>Password</label>
                    {tab === 'login' && (
                      <button type="button" onClick={() => setResetOpen(true)} tabIndex={4}
                        style={{ background:'none', border:'none', color:T.accent, fontSize:12, cursor:'pointer', padding:0, fontFamily:'monospace' }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position:'relative' }}>
                    <input
                      style={{ ...iStyle, paddingRight:42 }}
                      type={showPw ? 'text' : 'password'}
                      value={tab === 'login' ? liPass : rgPass}
                      onChange={e => tab === 'login' ? setLiPass(e.target.value) : setRgPass(e.target.value)}
                      placeholder={tab === 'login' ? '••••••••' : 'Min 8 characters'}
                      autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                      tabIndex={tab === 'login' ? 2 : undefined}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} title={showPw ? 'Hide password' : 'Show password'}
                      style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:T.dim, cursor:'pointer', padding:6, lineHeight:0, display:'flex', alignItems:'center' }}>
                      {showPw ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {tab === 'register' && (
                  <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer', fontSize:12, color:T.dim, lineHeight:1.45 }}>
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                      style={{ accentColor:T.accent, width:15, height:15, marginTop:1, flexShrink:0 }} />
                    <span>
                      I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color:T.accent }}>Privacy Policy</a> and{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color:T.accent }}>Terms</a>.
                    </span>
                  </label>
                )}
                {tab === 'login' && (
                  <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:12.5, color:T.dim, cursor:'pointer', userSelect:'none' }}>
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} tabIndex={5}
                      style={{ accentColor:T.accent, width:15, height:15, flexShrink:0, cursor:'pointer' }} />
                    <span>Keep me logged in</span>
                  </label>
                )}
                <button type="submit" disabled={loading || (tab === 'register' && !agree)} tabIndex={tab === 'login' ? 3 : undefined}
                  style={{ background:T.accent, color: themeName==='dark' ? '#060a0f' : '#fff', border:'none', borderRadius:8, padding:'14px', fontWeight:900, fontSize:16, letterSpacing:1, cursor:'pointer', marginTop:4, opacity: loading ? 0.7 : 1 }}>
                  {loading ? '…' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
              {err && <div style={{ fontSize:14, color:T.bad, textAlign:'center', fontWeight:600 }}>{err}</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Forgot-password modal ── */}
      {resetOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:28, width:'100%', maxWidth:400, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:18, fontWeight:900, color:T.white, fontFamily:'monospace' }}>Reset Password</div>
              <button onClick={() => { setResetOpen(false); setResetSent(false); setResetEmail(''); }}
                style={{ background:'none', border:'none', color:T.dim, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            {resetSent ? (
              <div style={{ textAlign:'center', padding:'12px 0' }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📧</div>
                <div style={{ fontSize:15, color:T.good, fontWeight:700, marginBottom:8 }}>Check your email</div>
                <div style={{ fontSize:13, color:T.dim, lineHeight:1.6 }}>
                  If an account exists for <strong style={{ color:T.text }}>{resetEmail}</strong>, you'll receive a reset link shortly. Check your spam folder if you don't see it.
                </div>
                <button onClick={() => { setResetOpen(false); setResetSent(false); setResetEmail(''); }}
                  style={{ marginTop:16, background:T.accent, color: themeName==='dark' ? '#060a0f' : '#fff', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'monospace' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize:14, color:T.dim, lineHeight:1.5 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </div>
                <div>
                  <label style={lStyle}>Email</label>
                  <input style={iStyle} type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com" autoFocus />
                </div>
                <button
                  disabled={resetSending || !resetEmail}
                  onClick={async () => {
                    setResetSending(true);
                    try {
                      await fetch('./index.php/api/auth/reset_request', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: resetEmail }),
                      });
                      setResetSent(true);
                    } catch {
                    } finally {
                      setResetSending(false);
                    }
                  }}
                  style={{ background:T.accent, color: themeName==='dark' ? '#060a0f' : '#fff', border:'none', borderRadius:8, padding:'12px', fontWeight:900, fontSize:15, cursor:'pointer', fontFamily:'monospace', opacity: resetSending || !resetEmail ? 0.6 : 1 }}>
                  {resetSending ? 'Sending…' : 'Send Reset Link'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop:24, paddingBottom:16, display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap' }}>
        <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:T.dim, textDecoration:'none', fontFamily:'monospace', opacity:0.7 }}>Privacy Policy</a>
        <span style={{ fontSize:12, color:T.dim, opacity:0.4 }}>·</span>
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:T.dim, textDecoration:'none', fontFamily:'monospace', opacity:0.7 }}>Terms</a>
        <span style={{ fontSize:12, color:T.dim, opacity:0.4 }}>·</span>
        <a href="/licenses" target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:T.dim, textDecoration:'none', fontFamily:'monospace', opacity:0.7 }}>Licenses &amp; source</a>
        <span style={{ fontSize:12, color:T.dim, opacity:0.4 }}>·</span>
        <button onClick={() => setFeedbackOpen(true)}
          style={{ fontSize:12, color:T.dim, background:'none', border:'none', cursor:'pointer', fontFamily:'monospace', padding:0, opacity:0.7 }}>
          Contact
        </button>
      </div>

      <div style={{ textAlign:'center', fontSize:11, color:T.dim, fontFamily:'monospace', opacity:0.55, paddingBottom:10 }}>© 2026 Marc Getter · AGPL-3.0</div>

      {/* Related-sites footer strip, populated by a global the app sets outside React (see index.html) */}
      {!!(window.__hcriRelated && window.__hcriRelated.length) && (
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', alignItems:'center', paddingBottom:18 }}>
          {window.__hcriRelated.map((link, ix) => (
            <span key={link.href} style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
              {ix > 0 && <span style={{ fontSize:12, color:T.dim, opacity:0.35 }}>·</span>}
              <a href={link.href} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:T.dim, textDecoration:'none', fontFamily:'monospace', opacity:0.55 }}>
                {link.label}
              </a>
            </span>
          ))}
        </div>
      )}

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}

// CCT (K) → an approximate warm/cool swatch color, used for the featured-
// report strip's accent dot and left border.
function cctToSwatch(k, dimColor) {
  if (!k) return dimColor;
  k = Math.max(1800, Math.min(10000, k));
  const stops = [
    [1800, 255, 140, 60],
    [2700, 255, 182, 112],
    [3500, 255, 212, 162],
    [4500, 255, 236, 212],
    [5500, 250, 248, 246],
    [6500, 224, 234, 255],
    [10000, 186, 208, 255],
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (k >= stops[i][0] && k <= stops[i + 1][0]) { a = stops[i]; b = stops[i + 1]; break; }
  }
  const t = (k - a[0]) / (b[0] - a[0] || 1);
  return `rgb(${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)},${Math.round(a[3] + (b[3] - a[3]) * t)})`;
}
