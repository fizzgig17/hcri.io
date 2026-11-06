// An owner's comparison address (?explore=runtime&cmp=<curve id>,...) is private to them. When someone else opens it
// (or the owner is signed out), turn it into the public link for the same lights if those lights are shared.
export function cmpIdsFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('explore') !== 'runtime' || sp.get('runtime')) return [];
    return (sp.get('cmp') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  } catch { return []; }
}
export async function redirectCmpToShared() {
  const ids = cmpIdsFromUrl();
  if (!ids.length) return false;
  try {
    const r = await fetch('./index.php/api/runtime_shared?ids=' + encodeURIComponent(ids.join(',')));
    if (!r.ok) return false;
    const j = await r.json();
    if (!j.tokens || !j.tokens.length) return false;
    window.location.replace(window.location.pathname + '?runtime=' + j.tokens.join(','));
    return true;
  } catch { return false; }
}
