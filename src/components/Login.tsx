import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
  }
  async function magicLink() {
    setError(null); setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setBusy(false);
    setError(error ? error.message : 'Check your email for the link');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h1 className="text-lg font-semibold">Manager Dashboard</h1>
        <input type="email" required placeholder="email@example.com"
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
        <input type="password" required placeholder="password"
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm" />
        {error && <div className="text-xs text-rose-400">{error}</div>}
        <button disabled={busy} className="w-full bg-[var(--accent)] text-white rounded-lg py-2 text-sm font-medium">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" onClick={magicLink} disabled={busy || !email}
          className="w-full text-xs text-slate-400 underline">Email me a magic link</button>
      </form>
    </div>
  );
}
