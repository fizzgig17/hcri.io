// frontend/src/components/CreateUserModal.jsx
//
// Reconstructed from the deployed assets/app.js (minified function
// je({T,S,onClose,onCreated})). A small modal for an admin to create a new
// user account directly (used from the admin users panel -- not part of
// this reconstruction batch). `T` is the theme; `S` is the shared style
// bag the users panel builds for its forms ({ label, input, btn(variant) }
// -- see AdminReportEdit.jsx for the plain-theme equivalent used elsewhere).
//
// Backend: POST /api/admin/users (api/admin.php) -- { name, email, password }
// -> { id, name, email, isAdmin, reportCount, createdAt }

import { useState } from 'react';
import { basePath, getToken } from '../lib/api';

async function adminPost(path, body) {
  const res = await fetch(`${basePath()}index.php/api/admin${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export default function CreateUserModal({ T: e, S: t, onClose: onCancel, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(ev) {
    ev.preventDefault();
    setError('');
    setBusy(true);
    try {
      onCreated(await adminPost('/users', { name, email, password }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: e.surface,
          border: `1px solid ${e.border}`,
          borderRadius: 10,
          padding: 24,
          maxWidth: 380,
          width: '100%',
          margin: 16,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: e.white, marginBottom: 16, fontFamily: 'monospace' }}>
          Add User
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={t.label}>Name</label>
            <input
              style={t.input}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label style={t.label}>Email</label>
            <input
              style={t.input}
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label style={t.label}>Password</label>
            <input
              style={t.input}
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>
          {error && <div style={{ fontSize: 13, color: e.bad, fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} style={t.btn('accent')}>
              Cancel
            </button>
            <button type="submit" disabled={busy} style={{ ...t.btn('good'), opacity: busy ? 0.6 : 1 }}>
              {busy ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
