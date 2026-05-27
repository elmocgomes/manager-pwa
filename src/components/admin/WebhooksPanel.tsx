import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Btn, Card, Field, PanelHeader, Spinner, Status, Table, Th, Td, TextInput, Toolbar } from './ui';

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
        <Card className="p-1 mb-6">
          <Table>
            <thead><tr><Th>URL</Th><Th>Actions</Th><Th>Enabled</Th><Th /></tr></thead>
            <tbody>
              {data.map(w => (
                <tr key={w.id}>
                  <Td className="font-mono text-[12px] text-[var(--text-muted)] break-all">{w.url}</Td>
                  <Td>{(w.actions || []).join(', ')}</Td>
                  <Td>{w.enabled ? 'yes' : 'no'}</Td>
                  <Td>
                    <Btn variant="danger"
                      onClick={() => { if (confirm(`Delete webhook ${w.id}?`)) del.mutate(w.id); }}>
                      Delete
                    </Btn>
                  </Td>
                </tr>
              ))}
              {data.length === 0 && <tr><Td className="text-[var(--text-muted)]">No webhooks registered.</Td></tr>}
            </tbody>
          </Table>
        </Card>
      )}

      <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Register missing actions</h3>
      <Toolbar>
        <Field label="Webhook URL (append ?token=…)">
          <TextInput value={url} onChange={e => setUrl(e.target.value)} className="w-[min(520px,100%)]" />
        </Field>
        <Btn disabled={register.isPending || !url} onClick={() => register.mutate()}>
          {register.isPending ? 'Registering…' : 'Register'}
        </Btn>
      </Toolbar>
    </div>
  );
}
