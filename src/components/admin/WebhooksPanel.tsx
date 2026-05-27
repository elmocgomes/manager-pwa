import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Btn, Card, DataCell, DataRow, DataTable, EmptyRow, Field, PanelHeader, Spinner, Status, TextInput, Toolbar } from './ui';

const COLS = 'md:grid-cols-[1.7fr_1fr_80px_90px]';
const FRESTO_WEBHOOK_BASE = `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/fresto-webhook`;

export function WebhooksPanel() {
  const qc = useQueryClient();
  const [url, setUrl] = useState(FRESTO_WEBHOOK_BASE);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'webhooks'],
    queryFn: adminApi.listWebhooks,
  });

  const register = useMutation({
    mutationFn: () => adminApi.registerWebhook(url),
    onSuccess: (r) => {
      setMsg({ kind: 'ok', text: r.registered.length ? `Registered: ${r.registered.join(', ')}` : 'All actions already registered.' });
      qc.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteWebhook(id),
    onSuccess: () => { setMsg({ kind: 'ok', text: 'Webhook deleted.' }); qc.invalidateQueries({ queryKey: ['admin', 'webhooks'] }); },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  return (
    <div>
      <PanelHeader title="Webhooks" subtitle="Fresto webhook registrations. Note: Fresto webhooks are unreliable — live data comes from the Firestore sync." />
      {msg && <Status kind={msg.kind}>{msg.text}</Status>}
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {data && (
        <div className="mb-6">
          <DataTable cols={COLS} headers={['URL', 'Actions', 'Enabled', '']}>
            {data.map(w => (
              <DataRow key={w.id} cols={COLS}>
                <DataCell label="URL"><span className="font-mono text-[12px] text-[var(--text-muted)] break-all">{w.url}</span></DataCell>
                <DataCell label="Actions">{(w.actions || []).join(', ')}</DataCell>
                <DataCell label="Enabled">{w.enabled ? 'yes' : 'no'}</DataCell>
                <DataCell>
                  <Btn variant="danger"
                    onClick={() => { if (confirm(`Delete webhook ${w.id}?`)) del.mutate(w.id); }}>
                    Delete
                  </Btn>
                </DataCell>
              </DataRow>
            ))}
            {data.length === 0 && <EmptyRow>No webhooks registered.</EmptyRow>}
          </DataTable>
        </div>
      )}

      <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Register missing actions</h3>
      <Card className="p-4">
        <Toolbar>
          <Field label="Webhook URL (append ?token=…)">
            <TextInput value={url} onChange={e => setUrl(e.target.value)} className="w-full md:w-[520px]" />
          </Field>
          <Btn disabled={register.isPending || !url} onClick={() => register.mutate()}>
            {register.isPending ? 'Registering…' : 'Register'}
          </Btn>
        </Toolbar>
      </Card>
    </div>
  );
}
