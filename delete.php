<?php
declare(strict_types=1);

$base         = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$appName = 'hCRI.io';
$contactEmail = 'fizzgig@hcri.io'; // ← change this
$lastUpdated  = 'June 14, 2026';

// ── Handle deletion form submission ──────────────────────────────────────────
$message = '';
$error   = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Please enter a valid email address.';
    } else {
        // Try to delete from database directly
        try {
            require_once __DIR__ . '/api/_core/db.php';
            $db = get_db();

            $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([strtolower($email)]);
            $user = $stmt->fetch();

            if ($user) {
                // Delete all uploads for this user
                $rStmt = $db->prepare('SELECT file_name FROM reports WHERE user_id = ?');
                $rStmt->execute([$user['id']]);
                $files = $rStmt->fetchAll();
                foreach ($files as $f) {
                    if (!empty($f['file_name'])) {
                        $path = __DIR__ . '/uploads/' . $f['file_name'];
                        if (file_exists($path)) @unlink($path);
                    }
                }

                // Delete user (cascades to reports)
                $db->prepare('DELETE FROM users WHERE id = ?')->execute([$user['id']]);

                $message = 'success';
            } else {
                // Don't reveal whether email exists — same message either way
                $message = 'success';
            }
        } catch (\Throwable $e) {
            $error = 'An error occurred. Please contact us directly at ' . $contactEmail;
        }
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Delete My Data — <?= $appName ?></title>
<base href="<?= htmlspecialchars($base) ?>">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a0f; color: #cce4f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; font-size: 16px; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 60px 24px 100px; }
  .logo { font-family: monospace; font-size: 20px; font-weight: 900; color: #fff; margin-bottom: 48px; display: inline-block; text-decoration: none; }
  .logo span { color: #00c8ff; }
  h1 { font-size: 34px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
  .meta { font-size: 13px; color: #6a9ab8; margin-bottom: 40px; }
  p { color: #a8c8e0; margin-bottom: 14px; }
  ul { color: #a8c8e0; margin: 0 0 20px 24px; }
  ul li { margin-bottom: 6px; }
  a { color: #00c8ff; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .back { display: inline-flex; align-items: center; gap: 6px; color: #6a9ab8; font-size: 13px; margin-bottom: 40px; text-decoration: none; }
  .back:hover { color: #00c8ff; }
  .card { background: #0d1e32; border: 1px solid rgba(80,140,200,0.2); border-radius: 10px; padding: 32px; margin-top: 32px; }
  .card h2 { font-size: 18px; color: #fff; margin-bottom: 16px; }
  label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6a9ab8; font-weight: 600; margin-bottom: 6px; }
  input[type=email] { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(80,140,200,0.25); border-radius: 6px; padding: 12px 14px; color: #cce4f8; font-size: 15px; outline: none; margin-bottom: 8px; }
  input[type=email]:focus { border-color: rgba(0,200,255,0.5); }
  .confirm-row { display: flex; align-items: flex-start; gap: 10px; margin: 16px 0 20px; }
  .confirm-row input { width: 18px; height: 18px; margin-top: 2px; flex-shrink: 0; accent-color: #ff5577; cursor: pointer; }
  .confirm-row label { font-size: 13px; text-transform: none; letter-spacing: 0; color: #a8c8e0; margin: 0; font-weight: 400; }
  .btn { background: #ff5577; color: #fff; border: none; border-radius: 6px; padding: 13px 24px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity .15s; width: 100%; }
  .btn:hover { opacity: .85; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  .success { background: rgba(61,255,160,0.08); border: 1px solid rgba(61,255,160,0.3); border-radius: 8px; padding: 24px; text-align: center; }
  .success .icon { font-size: 40px; margin-bottom: 12px; }
  .success h2 { color: #4fffb0; font-size: 20px; margin-bottom: 8px; }
  .success p { color: #a8c8e0; margin: 0; }
  .error-msg { background: rgba(255,85,119,0.1); border: 1px solid rgba(255,85,119,0.3); border-radius: 6px; padding: 12px 16px; color: #ff8899; font-size: 14px; margin-bottom: 16px; }
  .warning { background: rgba(255,100,50,0.08); border: 1px solid rgba(255,100,50,0.25); border-radius: 6px; padding: 14px 18px; margin-bottom: 20px; }
  .warning p { color: #ffaa88; margin: 0; font-size: 14px; }
  footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid rgba(80,140,200,0.15); font-size: 13px; color: #3a5a78; }

  /* Alternative method section */
  .alt { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(80,140,200,0.12); }
  .alt h3 { font-size: 14px; color: #6a9ab8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
</style>
</head>
<body>
<div class="wrap">
  <a href="index.php" class="logo">hCRI<span>.io</span></a>
  <a href="index.php" class="back">← Back to app</a>

  <h1>Delete My Data</h1>
  <div class="meta">Your right to erasure — per our <a href="privacy.php">Privacy Policy</a></div>

  <?php if ($message === 'success'): ?>

  <div class="success">
    <div class="icon">✓</div>
    <h2>Request processed</h2>
    <p>If an account with that email address existed, it has been permanently deleted along with all associated reports and uploaded files.</p>
    <p style="margin-top:12px;font-size:13px;color:#6a9ab8">This action cannot be undone. You may register a new account at any time.</p>
  </div>

  <?php else: ?>

  <p>Submitting this form will <strong style="color:#fff">permanently delete</strong> your account and all data associated with it.</p>

  <p>The following will be removed:</p>
  <ul>
    <li>Your account (email, name, password)</li>
    <li>All saved spectral reports</li>
    <li>All uploaded CSV and PDF files</li>
    <li>All computed metrics (CCT, Rf, Rg, Duv, etc.)</li>
  </ul>

  <div class="card">
    <h2>Request account deletion</h2>

    <div class="warning">
      <p>⚠ This is permanent and cannot be undone. Your data cannot be recovered after deletion.</p>
    </div>

    <?php if ($error): ?>
    <div class="error-msg"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST" action="" id="delete-form">
      <label for="email">Your account email address</label>
      <input type="email" id="email" name="email" placeholder="you@example.com"
             value="<?= htmlspecialchars($_POST['email'] ?? '') ?>"
             required autocomplete="email">

      <div class="confirm-row">
        <input type="checkbox" id="confirm" name="confirm" required>
        <label for="confirm">I understand this will permanently delete my account and all my data. This cannot be undone.</label>
      </div>

      <button type="submit" class="btn" id="submit-btn">Delete my account and all data</button>
    </form>

    <div class="alt">
      <h3>Prefer to contact us directly?</h3>
      <p style="font-size:14px;color:#a8c8e0">Email <a href="mailto:<?= $contactEmail ?>"><?= $contactEmail ?></a> with your account email address and we will process your deletion request within 30 days.</p>
    </div>
  </div>

  <?php endif; ?>

  <footer>
    <?= $appName ?> · <a href="index.php">Back to app</a> · <a href="privacy.php">Privacy Policy</a>
  </footer>
</div>

<script>
// Require checkbox before enabling submit
const form = document.getElementById('delete-form');
const btn  = document.getElementById('submit-btn');
const chk  = document.getElementById('confirm');
if (chk && btn) {
  btn.disabled = true;
  chk.addEventListener('change', () => btn.disabled = !chk.checked);
}
</script>
</body>
</html>
