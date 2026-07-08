<?php
$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$appName = 'hCRI.io';
$contactEmail = 'fizzgig@hcri.io';
$lastUpdated = 'June 16, 2026';
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Privacy Policy — <?= $appName ?></title>
<base href="<?= htmlspecialchars($base) ?>">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a0f; color: #cce4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; font-size: 16px; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 60px 24px 100px; }
  .logo { font-family: monospace; font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 48px; display: inline-block; text-decoration: none; }
  .logo span { color: #00c8ff; }
  h1 { font-size: 36px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
  .meta { font-size: 13px; color: #6a9ab8; margin-bottom: 48px; }
  h2 { font-size: 20px; font-weight: 600; color: #ffffff; margin: 40px 0 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(80,140,200,0.2); }
  p { color: #a8c8e0; margin-bottom: 14px; }
  ul { color: #a8c8e0; margin: 0 0 14px 24px; }
  ul li { margin-bottom: 6px; }
  a { color: #00c8ff; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .highlight { background: rgba(0,200,255,0.07); border: 1px solid rgba(0,200,255,0.2); border-radius: 6px; padding: 16px 20px; margin-bottom: 14px; }
  .back { display: inline-flex; align-items: center; gap: 6px; color: #6a9ab8; font-size: 13px; margin-bottom: 40px; text-decoration: none; }
  .back:hover { color: #00c8ff; }
  footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid rgba(80,140,200,0.15); font-size: 13px; color: #3a5a78; }
</style>
</head>
<body>
<div class="wrap">
  <a href="index.php" class="logo">hCRI<span>.io</span></a>
  <a href="index.php" class="back">← Back to app</a>

  <h1>Privacy Policy</h1>
  <div class="meta">Last updated: <?= $lastUpdated ?></div>

  <div class="highlight">
    <p style="margin:0"><strong style="color:#fff">The short version:</strong> We collect only what's needed to run the app. We never sell your data. You can delete your account and everything associated with it at any time.</p>
  </div>

  <h2>1. Who We Are</h2>
  <p><?= $appName ?> is a free web tool for analyzing light source quality. Upload a spectral power distribution (SPD) file from a spectrometer and get a full IES TM-30-18 color rendition report — including Rf, Rg, CCT, Duv, CRI, R9, chromaticity diagrams, and SDCM ellipse plots.</p>
  <p>Questions? Reach us at <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a>.</p>

  <h2>2. What We Collect</h2>
  <p>When you create an account:</p>
  <ul>
    <li><strong>Email address</strong> — used to log in, reset your password, and identify your account</li>
    <li><strong>Display name</strong> — shown in the app; can be used as your login username</li>
    <li><strong>Password</strong> — stored as a secure bcrypt hash, never in plain text</li>
  </ul>
  <p>When you upload and analyze files:</p>
  <ul>
    <li><strong>The uploaded file</strong> (CSV, JSON, or CGATS format) stored on the server</li>
    <li><strong>Computed metrics</strong> — CCT, Duv, Rf, Rg, Ra, R9, CIE x/y, u/v, u'/v', rfBins, rcsBins, rhsBins, full spectral data</li>
    <li><strong>Instrument metadata</strong> — device model, firmware version, and raw header fields extracted from your file</li>
    <li><strong>Report label and timestamp</strong></li>
    <li><strong>Optional notes</strong> — manufacturer, model, LED details, and any notes you add to a report</li>
  </ul>
  <p>We do not use cookies, analytics trackers, or third-party sign-in (no Google or Facebook login).</p>

  <h2>3. How We Use Your Data</h2>
  <ul>
    <li>To authenticate you and show your saved reports</li>
    <li>To compute and store spectral analysis results</li>
    <li>To generate shareable report links and downloadable PDFs</li>
    <li>To send password reset emails when you request them</li>
  </ul>
  <p>We do <strong>not</strong> use your data for advertising, profiling, or any purpose beyond operating the app.</p>

  <h2>4. Sharing Your Data</h2>
  <p>Your data is private by default. The only ways it becomes visible to others:</p>
  <ul>
    <li><strong>Share links</strong> — if you enable sharing on a report, anyone with the link can view it. You can revoke a share link at any time.</li>
    <li><strong>Explore page</strong> — if you mark a report as public it appears in the Explore section. You control this setting.</li>
    <li><strong>Legal requirements</strong> — if required by law or to protect our rights.</li>
  </ul>
  <p>We do not sell, rent, or share your personal data with any third party for commercial purposes.</p>

  <h2>5. Email</h2>
  <p>We only send email when you explicitly request it — specifically, password reset links triggered by you from the login screen or from your profile settings. We do not send newsletters, marketing, or unsolicited messages.</p>
  <p>Outbound email is sent via SMTP from <?= $appName ?>. Your email address is never shared with a third-party email marketing service.</p>

  <h2>6. Data Storage and Security</h2>
  <ul>
    <li>Data is stored on the server hosting this application</li>
    <li>Passwords are hashed with bcrypt (cost 12)</li>
    <li>Authentication uses JWT tokens that expire after 7 days</li>
    <li>Uploaded spectral files are stored in a protected directory not accessible directly from the web</li>
    <li>All connections use HTTPS</li>
  </ul>

  <h2>7. Your Rights and Controls</h2>
  <p>From within the app you can:</p>
  <ul>
    <li><strong>Update your name</strong> — via the profile panel (click your name in the sidebar)</li>
    <li><strong>Change your email</strong> — via the profile panel; requires your current password</li>
    <li><strong>Change your password</strong> — via the profile panel, or by requesting a reset link</li>
    <li><strong>Delete individual reports</strong> — via the delete button on any report</li>
    <li><strong>Control sharing</strong> — enable or revoke public share links per report</li>
    <li><strong>Delete your account</strong> — permanently removes your account, all reports, all uploaded files, and all associated data. See our <a href="delete.php">Data Deletion page</a>.</li>
  </ul>

  <h2>8. Browser Storage</h2>
  <p>We store your authentication token in browser <strong>localStorage</strong> to keep you signed in between sessions. Your metric grid layout preferences are also saved locally. No tracking cookies are used, and no data is sent to analytics services.</p>

  <h2>9. Children's Privacy</h2>
  <p>This app is intended for adults and professionals. We do not knowingly collect data from anyone under 13.</p>

  <h2>10. Changes to This Policy</h2>
  <p>If we make material changes to this policy, we'll update the date at the top. Continued use of the app after changes constitutes acceptance of the updated policy.</p>

  <h2>11. Contact</h2>
  <p>For privacy questions or data deletion requests, contact us at <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a>.</p>

  <footer>
    <?= $appName ?> · <a href="index.php">Back to app</a> · <a href="delete.php">Delete my data</a>
  </footer>
</div>
</body>
</html>