// A license dropdown with a link to what the choices mean. Used on the report page, in Account settings and in the admin editor.
import { LICENSES, LICENSE_HELP_URL } from '../lib/licenses.js';

export default function LicenseSelect({ value, onChange, disabled, T, style, block }) {
  return (
    <span style={{ display: block ? 'flex' : 'inline-flex', flexDirection: block ? 'column' : 'row', alignItems: block ? 'flex-start' : 'center', gap: 8, flexWrap: 'wrap', maxWidth: '100%', boxSizing: 'border-box' }}>
      <select value={value || ''} disabled={disabled} onChange={(e) => onChange(e.target.value)}
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text, borderRadius: 5, padding: '5px 8px', fontSize: 12, fontFamily: 'monospace', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', width: block ? '100%' : undefined, ...style }}>
        {LICENSES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
      </select>
      <a href={LICENSE_HELP_URL} target="_blank" rel="noopener noreferrer" style={{ color: T.accent, fontSize: 12, fontFamily: 'monospace' }}>What do these mean?</a>
    </span>
  );
}
