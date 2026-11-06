// An owner's comparison address (?explore=runtime&cmp=<curve id>,...) opens for its owner. For anyone else (or the owner
// signed out) it becomes the public comparison page for the same lights: ?runtime=<curve id>,...
export function cmpIdsFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('explore') !== 'runtime' || sp.get('runtime')) return [];
    return (sp.get('cmp') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12);
  } catch { return []; }
}
export function redirectCmpToShared() {
  const ids = cmpIdsFromUrl();
  if (!ids.length) return false;
  window.location.replace(window.location.pathname + '?runtime=' + ids.map(encodeURIComponent).join(','));
  return true;
}
