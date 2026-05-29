import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '../../lib/adminApi';
import { Btn, Card, DataCell, DataRow, DataTable, EmptyRow, Field, PanelHeader, Spinner, Status, TextInput, Toolbar } from './ui';
import { useRestaurantOptions } from './useRestaurantOptions';
import { useUserProfile } from '../../contexts/ProfileContext';

const COLS = 'md:grid-cols-[1fr_1.4fr_1fr_240px]';

function RestaurantChecks({ options, value, onChange }: {
  options: Array<{ slug: string; name: string }>;
  value: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(o => (
        <label key={o.slug} className="flex items-center gap-1.5 text-[13px] text-[var(--text)]">
          <input type="checkbox" checked={value.has(o.slug)} className="w-4 h-4 accent-[var(--accent)]"
            onChange={e => {
              const next = new Set(value);
              if (e.target.checked) next.add(o.slug); else next.delete(o.slug);
              onChange(next);
            }} />
          {o.name}
        </label>
      ))}
    </div>
  );
}

function UserRow({ u, options, isSelf }: { u: AdminUser; options: Array<{ slug: string; name: string }>; isSelf: boolean }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set(u.restaurants));
  const [msg, setMsg] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => adminApi.setUserRestaurants(u.id, [...sel]),
    onSuccess: () => { setEditing(false); setMsg(null); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => setMsg((e as Error).message),
  });

  const del = useMutation({
    mutationFn: () => adminApi.deleteUser(u.id),
    onSuccess: () => { setMsg(null); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => setMsg((e as Error).message),
  });

  const confirmDelete = () => {
    const adminNote = u.is_admin ? '\n\nThey are an ADMIN — they will lose admin access immediately.' : '';
    const ok = confirm(
      `Permanently delete ${u.full_name}?\n\n` +
      `They will lose access immediately and this cannot be undone.${adminNote}`,
    );
    if (ok) del.mutate();
  };

  return (
    <DataRow cols={COLS} className="md:items-start">
      <DataCell label="Name">
        {u.full_name}
        {u.is_admin && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] border border-[rgba(88,166,255,0.3)] rounded px-1.5 py-0.5">
            admin
          </span>
        )}
        {isSelf && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)] border border-[var(--border)] rounded px-1.5 py-0.5">
            you
          </span>
        )}
      </DataCell>
      <DataCell label="Email">
        {u.email
          ? <span className="text-[var(--text-muted)] break-all">{u.email}</span>
          : <span className="text-[var(--text-muted)] italic">—</span>}
      </DataCell>
      <DataCell label="Restaurants">
        {!editing ? (
          <span className="text-[var(--text-muted)]">{u.restaurants.length ? u.restaurants.join(', ') : '—'}</span>
        ) : (
          <div className="flex flex-col gap-2">
            <RestaurantChecks options={options} value={sel} onChange={setSel} />
          </div>
        )}
        {msg && <span className="text-[#ff8585] text-[12px] block mt-1">{msg}</span>}
      </DataCell>
      <DataCell className="md:text-right">
        {!editing ? (
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Btn variant="ghost" onClick={() => { setSel(new Set(u.restaurants)); setEditing(true); }}>Edit access</Btn>
            {!isSelf && (
              <Btn variant="danger" disabled={del.isPending} onClick={confirmDelete}>
                {del.isPending ? 'Deleting…' : 'Delete'}
              </Btn>
            )}
          </div>
        ) : (
          <div className="flex gap-2 md:justify-end">
            <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
            <Btn disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save'}</Btn>
          </div>
        )}
      </DataCell>
    </DataRow>
  );
}

export function UsersPanel() {
  const qc = useQueryClient();
  const me = useUserProfile();
  const { data: options } = useRestaurantOptions();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'users'], queryFn: adminApi.listUsers });

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const invite = useMutation({
    mutationFn: () => adminApi.inviteUser(email.trim(), name.trim(), [...sel]),
    onSuccess: () => {
      setMsg({ kind: 'ok', text: `Invite sent to ${email.trim()}.` });
      setEmail(''); setName(''); setSel(new Set()); setLinkResult(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  const [linkResult, setLinkResult] = useState<{ link: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteLink = useMutation({
    mutationFn: () => adminApi.inviteUserLink(email.trim(), name.trim(), [...sel]),
    onSuccess: (r) => {
      setLinkResult({ link: r.action_link, name: name.trim() });
      setMsg(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  const pending = invite.isPending || inviteLink.isPending;
  const canInvite = !!email.trim() && !!name.trim() && sel.size > 0 && !pending;
  const opts = options ?? [];

  const copyLink = async () => {
    if (!linkResult) return;
    try { await navigator.clipboard.writeText(linkResult.link); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* clipboard may be denied — the link is still visible to copy by hand */ }
  };

  return (
    <div>
      <PanelHeader title="Users" subtitle="Invite managers and control which restaurants they can see. Admin status is set in the database." />
      {msg && <Status kind={msg.kind}>{msg.text}</Status>}
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {data && (
        <div className="mb-6">
          <DataTable cols={COLS} headers={['Name', 'Email', 'Restaurants', '']}>
            {data.map(u => <UserRow key={u.id} u={u} options={opts} isSelf={u.id === me.id} />)}
            {data.length === 0 && <EmptyRow>No users yet.</EmptyRow>}
          </DataTable>
        </div>
      )}

      <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Invite a manager</h3>
      <Card className="p-4">
        <Toolbar>
          <Field label="Email"><TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full md:min-w-[220px]" /></Field>
          <Field label="Full name"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" className="w-full md:min-w-[180px]" /></Field>
        </Toolbar>
        <div className="mb-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Restaurant access</div>
          <RestaurantChecks options={opts} value={sel} onChange={setSel} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn disabled={!canInvite} onClick={() => invite.mutate()}>{invite.isPending ? 'Sending…' : 'Send invite email'}</Btn>
          <Btn variant="ghost" disabled={!canInvite} onClick={() => inviteLink.mutate()}>
            {inviteLink.isPending ? 'Generating…' : 'Generate link instead'}
          </Btn>
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-2">
          Use "Generate link" when the email service is rate-limited — you'll get a one-time URL to send manually.
        </p>

        {linkResult && (
          <div className="mt-4 p-3 rounded-lg border border-[var(--accent)] bg-[rgba(88,166,255,0.06)]">
            <div className="text-[12px] text-[var(--text-muted)] mb-2">
              One-time link for <span className="text-[var(--text)]">{linkResult.name}</span>. Send it via Slack/WhatsApp/whatever — it expires in ~24 h.
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkResult.link}
                onFocus={e => e.currentTarget.select()}
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-[12px] font-mono text-[var(--text-muted)] break-all min-w-0"
              />
              <Btn variant="ghost" onClick={copyLink}>{copied ? '✓ Copied' : 'Copy'}</Btn>
            </div>
            <button
              onClick={() => { setLinkResult(null); setEmail(''); setName(''); setSel(new Set()); }}
              className="mt-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--text)] underline"
            >
              Clear and invite someone else
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
