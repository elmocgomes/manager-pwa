import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminUser } from '../../lib/adminApi';
import { Btn, Card, DataCell, DataRow, DataTable, EmptyRow, Field, PanelHeader, Spinner, Status, TextInput, Toolbar } from './ui';
import { useRestaurantOptions } from './useRestaurantOptions';

const COLS = 'md:grid-cols-[1fr_1.4fr_200px]';

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

function UserRow({ u, options }: { u: AdminUser; options: Array<{ slug: string; name: string }> }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set(u.restaurants));
  const [msg, setMsg] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => adminApi.setUserRestaurants(u.id, [...sel]),
    onSuccess: () => { setEditing(false); setMsg(null); qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: (e) => setMsg((e as Error).message),
  });

  return (
    <DataRow cols={COLS} className="md:items-start">
      <DataCell label="Name">
        {u.full_name}
        {u.is_admin && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[var(--accent)] border border-[rgba(88,166,255,0.3)] rounded px-1.5 py-0.5">
            admin
          </span>
        )}
      </DataCell>
      <DataCell label="Restaurants">
        {!editing ? (
          <span className="text-[var(--text-muted)]">{u.restaurants.length ? u.restaurants.join(', ') : '—'}</span>
        ) : (
          <div className="flex flex-col gap-2">
            <RestaurantChecks options={options} value={sel} onChange={setSel} />
            {msg && <span className="text-[#ff8585] text-[12px]">{msg}</span>}
          </div>
        )}
      </DataCell>
      <DataCell className="md:text-right">
        {!editing ? (
          <Btn variant="ghost" onClick={() => { setSel(new Set(u.restaurants)); setEditing(true); }}>Edit access</Btn>
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
      setEmail(''); setName(''); setSel(new Set());
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  const canInvite = !!email.trim() && !!name.trim() && sel.size > 0 && !invite.isPending;
  const opts = options ?? [];

  return (
    <div>
      <PanelHeader title="Users" subtitle="Invite managers and control which restaurants they can see. Admin status is set in the database." />
      {msg && <Status kind={msg.kind}>{msg.text}</Status>}
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {data && (
        <div className="mb-6">
          <DataTable cols={COLS} headers={['Name', 'Restaurants', '']}>
            {data.map(u => <UserRow key={u.id} u={u} options={opts} />)}
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
        <Btn disabled={!canInvite} onClick={() => invite.mutate()}>{invite.isPending ? 'Sending…' : 'Send invite'}</Btn>
      </Card>
    </div>
  );
}
