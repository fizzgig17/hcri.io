// frontend/src/components/Votes.jsx
//
// Reconstructed from the deployed assets/app.js (minified functions
// vt/vhdr/Votes). A thumbs-up / thumbs-down widget shown on a report in the
// public Explore experience (and on the report detail page). Anonymous
// visitors vote using a random UUID persisted in localStorage
// ("hcri_voter"); a logged-in user's vote is tied to their account instead
// (the backend keys votes by `u:<id>` when a Bearer token is present, else
// `a:<anon token>` -- see api/votes.php: voter_key_from()).
//
// Backend: GET  /api/votes?ids=<id>&voter=<token>   -> { "<id>": {up,down,myVote} }
//          POST /api/votes { reportId, value: 1|-1|0, voter } -> {reportId,up,down,myVote}

import { useState, useEffect } from 'react';
import { basePath, getToken } from '../lib/api';

// A stable per-browser anonymous voter id, so a guest's vote can be toggled
// / changed without an account. Falls back to a timestamp+random string if
// crypto.randomUUID isn't available.
export function voterToken() {
  try {
    let k = localStorage.getItem('hcri_voter');
    if (!k) {
      k = window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : 'v' + Date.now() + Math.random().toString(36).slice(2);
      localStorage.setItem('hcri_voter', k);
    }
    return k;
  } catch (e) {
    return '';
  }
}

export function voteHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export default function Votes({ reportId, theme: t, initialUp = 0, initialDown = 0, size = 16 }) {
  const [up, setUp] = useState(initialUp);
  const [down, setDown] = useState(initialDown);
  const [myVote, setMyVote] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`${basePath()}index.php/api/votes?ids=${reportId}&voter=${encodeURIComponent(voterToken())}`, {
      headers: voteHeaders(),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        const x = d && d[reportId];
        if (x) {
          setUp(x.up);
          setDown(x.down);
          setMyVote(x.myVote || 0);
        }
      })
      .catch(() => {});
    return () => { live = false; };
  }, [reportId]);

  const vote = async (v) => {
    if (busy) return;
    const nv = myVote === v ? 0 : v;
    setBusy(true);
    try {
      const r = await (
        await fetch(`${basePath()}index.php/api/votes`, {
          method: 'POST',
          headers: voteHeaders(),
          body: JSON.stringify({ reportId, value: nv, voter: voterToken() }),
        })
      ).json();
      if (r && !r.error) {
        setUp(r.up);
        setDown(r.down);
        setMyVote(r.myVote || 0);
      }
    } catch (e) {}
    setBusy(false);
  };

  const btnStyle = (on, c) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    background: on ? `${c}22` : 'transparent',
    border: `1px solid ${on ? c : t.border}`,
    color: on ? c : t.dim,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 13,
    cursor: busy ? 'default' : 'pointer',
    fontFamily: 'monospace',
    fontWeight: 700,
    lineHeight: 1,
    transition: 'all .12s',
  });

  return (
    <div
      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
      onClick={(e) => { e.stopPropagation && e.stopPropagation(); }}
    >
      <button type="button" title="Good report" onClick={() => vote(1)} style={btnStyle(myVote === 1, t.good)}>
        <span style={{ fontSize: size, lineHeight: 1 }}>👍</span>
        <span>{up}</span>
      </button>
      <button type="button" title="Not a good report" onClick={() => vote(-1)} style={btnStyle(myVote === -1, t.bad)}>
        <span style={{ fontSize: size, lineHeight: 1 }}>👎</span>
        <span>{down}</span>
      </button>
    </div>
  );
}
