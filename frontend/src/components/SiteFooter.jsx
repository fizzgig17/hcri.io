// SiteFooter: quiet copyright / license / legal links shown at the bottom of the
// scrolling content on the signed-in Explore pages and the shared-report page
// (the sign-in screen and the static pages carry their own footers).
import { useTheme } from '../lib/ThemeContext.jsx';

export default function SiteFooter() {
  const { theme: T } = useTheme();
  const link = { color: T.dim, textDecoration: 'none' };
  return (
    <div style={{ padding: '22px 16px 26px', textAlign: 'center', fontSize: 11, fontFamily: 'monospace', color: T.dim, opacity: 0.7, lineHeight: 1.9 }}>
      <div>© 2026 fizzgig · AGPL-3.0</div>
      <div>
        <a href="/privacy" target="_blank" rel="opener" style={link}>Privacy</a>
        {' · '}
        <a href="/terms" target="_blank" rel="opener" style={link}>Terms</a>
        {' · '}
        <a href="/licenses" target="_blank" rel="opener" style={link}>Licenses &amp; source</a>
      </div>
    </div>
  );
}
