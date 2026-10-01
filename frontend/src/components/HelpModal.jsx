// frontend/src/components/HelpModal.jsx
//
// Reconstructed from the deployed assets/app.js (minified functions
// GlobalHelp, slugifyHelp, linkifyHelp, and O). Entirely new -- the stale
// frontend/src this replaces had no contextual help system at all. GlobalHelp
// is meant to be mounted once near the app root: it listens for a
// window-level `hcri:openHelp` CustomEvent (dispatched by the "?" button on
// the auth screen and presumably elsewhere) and for a `?help=<slug>` query
// param on load, and renders HelpModal when either fires. HelpModal itself
// loads a static `help_content.json` (an array of {title, content} topics),
// shows a tab/sidebar list of topics, and auto-links any other topic's title
// mentioned inside the current topic's body text so readers can jump around
// (linkifyHelp). The current topic is also reflected into the URL as
// `?help=<slug>` so a specific topic can be linked to directly or copied via
// the "Copy link" button.

import { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext.jsx';
import { useIsMobile } from '../hooks/useIsMobile';

// Turns a help-topic title into a URL-safe slug, e.g. "Uploading via the
// API" -> "uploading-via-the-api".
export function slugifyHelp(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Scans `text` for any other topic's title and wraps each occurrence in a
// clickable span that jumps to that topic (onJump(index)). `skipIdx` is the
// current topic's own index, excluded so a topic never links to itself.
// Longer titles are matched first so e.g. "TM-30" doesn't shadow a longer
// title that contains it.
export function linkifyHelp(text, topics, skipIdx, onJump) {
  const cands = topics
    .map((tp, ix) => ({ title: tp.title, ix }))
    .filter(c => c.ix !== skipIdx && c.title)
    .sort((a, b) => b.title.length - a.title.length);
  if (!cands.length || !text) return text;
  const re = new RegExp('(' + cands.map(c => c.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
  const parts = text.split(re);
  const byTitle = {};
  cands.forEach(c => { byTitle[c.title] = c.ix; });
  return parts.map((part, pi) => {
    if (byTitle.hasOwnProperty(part)) {
      return (
        <span
          key={pi}
          onClick={() => onJump(byTitle[part])}
          style={{ color:'inherit', textDecoration:'underline', textDecorationStyle:'dotted', textUnderlineOffset:3, cursor:'pointer', fontWeight:700 }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

// Mount once near the app root. Opens HelpModal in response to either the
// `hcri:openHelp` event (detail: { title }) or a `?help=<slug>` URL param
// present on load.
export function GlobalHelp() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(null);
  const [slug, setSlug] = useState(null);

  useEffect(() => {
    function onOpenHelp(ev) {
      setTitle((ev && ev.detail && ev.detail.title) || null);
      setSlug(null);
      setOpen(true);
    }
    window.addEventListener('hcri:openHelp', onOpenHelp);
    try {
      const p = new URLSearchParams(window.location.search).get('help');
      if (p) { setSlug(p); setOpen(true); }
    } catch {}
    return () => window.removeEventListener('hcri:openHelp', onOpenHelp);
  }, []);

  if (!open) return null;
  return (
    <div style={{ position:'relative', zIndex:6000 }}>
      <HelpModal onClose={() => setOpen(false)} initialTitle={title} initialSlug={slug} />
    </div>
  );
}

// initialTitle takes priority over initialSlug when both are given (mirrors
// the bundle: title is set for an explicit openHelp(detail.title) call, slug
// for the ?help= URL param).
export default function HelpModal({ onClose, initialTitle, initialSlug }) {
  const { theme: T } = useTheme();
  const [index, setIndex] = useState(0);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    fetch('./help_content.json')
      .then(r => r.json())
      .then(data => {
        setTopics(data);
        setLoading(false);
        if (initialTitle) {
          const ix = data.findIndex(x => x && x.title === initialTitle);
          if (ix >= 0) setIndex(ix);
        } else if (initialSlug) {
          const ix = data.findIndex(x => x && slugifyHelp(x.title) === initialSlug);
          if (ix >= 0) setIndex(ix);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!topics.length) return;
    try {
      const u = new URL(window.location.href);
      u.searchParams.set('help', slugifyHelp(topics[index].title));
      window.history.replaceState(null, '', u.toString());
    } catch {}
  }, [index, topics]);

  useEffect(() => { setCopiedLink(false); }, [index]);

  function closeAndClearUrl() {
    try {
      const u = new URL(window.location.href);
      u.searchParams.delete('help');
      window.history.replaceState(null, '', u.toString());
    } catch {}
    onClose();
  }

  if (loading || topics.length === 0) {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:T.dim, fontFamily:'monospace', fontSize:14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, width:'100%', maxWidth:800, maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', background:T.surface2, flexShrink:0 }}>
          <div style={{ fontWeight:900, fontSize:18, color:T.white, fontFamily:'monospace' }}>
            hCRI<span style={{ color:T.accent }}>.io</span>
            <span style={{ fontSize:13, color:T.dim, fontWeight:400, marginLeft:12 }}>Help &amp; Reference</span>
          </div>
          <button onClick={closeAndClearUrl} style={{ background:'none', border:'none', color:T.dim, fontSize:22, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>

        <a href="/hCRI.io%20-%20Complete%20Guide.pdf" target="_blank" rel="noopener noreferrer"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderBottom:`1px solid ${T.border}`, background:`${T.accent}0d`, color:T.accent, textDecoration:'none', fontFamily:'monospace', fontSize:12.5, fontWeight:700, flexShrink:0 }}>
          ↓ Download the complete hCRI.io PDF guide
        </a>

        <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', flex:1, overflow:'hidden' }}>
          <div style={ isMobile
            ? { width:'100%', maxHeight:128, flexShrink:0, borderBottom:`1px solid ${T.border}`, overflowY:'auto', background:T.surface2 }
            : { width:200, flexShrink:0, borderRight:`1px solid ${T.border}`, overflowY:'auto', background:T.surface2 }
          }>
            {topics.map((tp, i) => (
              <div key={i} onClick={() => setIndex(i)}
                style={{
                  padding:'9px 14px', fontSize:12, cursor:'pointer',
                  borderLeft: `3px solid ${i === index ? T.accent : 'transparent'}`,
                  background: i === index ? `${T.accent}12` : 'transparent',
                  color: i === index ? T.accent : T.dim,
                  fontWeight: i === index ? 700 : 400,
                  fontFamily:'monospace', lineHeight:1.4, transition:'all .1s',
                }}>
                {tp.title}
              </div>
            ))}
          </div>

          <div style={{ flex:1, minHeight:0, overflowY:'auto', padding: isMobile ? '16px 16px' : '24px 28px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginBottom:16 }}>
              <div style={{ fontSize:18, fontWeight:900, color:T.white, fontFamily:'monospace' }}>{topics[index].title}</div>
              <button
                onClick={() => {
                  try {
                    const u = new URL(window.location.href);
                    u.searchParams.set('help', slugifyHelp(topics[index].title));
                    navigator.clipboard.writeText(u.toString());
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 1500);
                  } catch {}
                }}
                style={{ flexShrink:0, background: copiedLink ? `${T.accent}22` : 'none', border:`1px solid ${T.accent}50`, color:T.accent, borderRadius:6, padding:'5px 10px', fontSize:11, fontFamily:'monospace', cursor:'pointer', whiteSpace:'nowrap' }}>
                {copiedLink ? 'Copied!' : '🔗 Copy link'}
              </button>
            </div>
            <div style={{ fontSize:14, color:T.text, lineHeight:1.9, fontFamily:'monospace', whiteSpace:'pre-line' }}>
              {linkifyHelp(topics[index].content, topics, index, setIndex)}
            </div>
          </div>
        </div>

        <div style={{ padding:'10px 20px', borderTop:`1px solid ${T.border}`, background:T.surface2, flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:11, color:T.dim, fontFamily:'monospace' }}>IES TM-30-18 · CIE 13.3-1995 · hcri.io</div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}
              style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}40`, color:T.accent, borderRadius:5, padding:'5px 14px', fontSize:12, cursor:'pointer', fontFamily:'monospace', opacity: index === 0 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <button onClick={() => setIndex(i => Math.min(topics.length - 1, i + 1))} disabled={index === topics.length - 1}
              style={{ background:`${T.accent}15`, border:`1px solid ${T.accent}40`, color:T.accent, borderRadius:5, padding:'5px 14px', fontSize:12, cursor:'pointer', fontFamily:'monospace', opacity: index === topics.length - 1 ? 0.4 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
