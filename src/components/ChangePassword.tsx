import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Self-service password change. The new password is typed directly into the
// app and sent to Supabase via auth.updateUser (the user is already logged in),
// so it never leaves the device except to Supabase — no email/reset flow needed.
export function ChangePassword() {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);

  function reset() {
    setPw(''); setConfirm(''); setMsg(null); setBusy(false);
  }
  function close() { setOpen(false); reset(); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 8) { setMsg({ kind: 'err', text: 'Use at least 8 characters.' }); return; }
    if (pw !== confirm) { setMsg({ kind: 'err', text: 'Passwords do not match.' }); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setMsg({ kind: 'err', text: error.message }); return; }
    setMsg({ kind: 'ok', text: 'Password updated.' });
    setPw(''); setConfirm('');
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Change password"
        className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--text)] underline-offset-2 hover:underline"
      >
        Password
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label="Change password"
          onClick={close}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
            className="w-full max-w-sm bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text)]">Change password</h2>
              <button type="button" onClick={close} aria-label="Close"
                className="w-6 h-6 grid place-items-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
            </div>
            {/* username hint for password managers (a11y + Keychain) */}
            <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" readOnly value="" />
            <input
              type="password" required placeholder="New password" name="new-password"
              autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)}
              className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password" required placeholder="Confirm new password" name="confirm-password"
              autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
            />
            {msg && (
              <div className={`text-xs ${msg.kind === 'err' ? 'text-rose-400' : 'text-emerald-400'}`}>{msg.text}</div>
            )}
            <button
              type="submit" disabled={busy}
              className="w-full bg-[var(--accent)] text-[#0d1117] rounded-lg py-2 text-sm font-semibold disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
