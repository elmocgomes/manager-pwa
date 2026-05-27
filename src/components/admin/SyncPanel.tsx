import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Btn, Card, PanelHeader, Spinner, Status, Table, Th, Td, fmtTs, relativeTime } from './ui';

export function SyncPanel() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sync-status'],
    queryFn: adminApi.syncStatus,
    refetchInterval: 30_000,
  });

  const run = useMutation({
    mutationFn: adminApi.runSync,
    onSuccess: (r) => setMsg({ kind: 'ok', text: `Sync started at ${fmtTs(r.started_at)}` }),
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  const toggle = useMutation({
    mutationFn: (enable: boolean) => adminApi.setCron(enable),
    onSuccess: (r, enable) => {
      if (r.cron_active === !enable) {
        setMsg({ kind: 'error', text: "Couldn't toggle cron — RPC may not be set up." });
      } else {
        setMsg({ kind: 'ok', text: `Cron is now ${r.cron_active ? 'ON' : 'OFF'}` });
      }
      qc.invalidateQueries({ queryKey: ['admin', 'sync-status'] });
    },
    onError: (e) => setMsg({ kind: 'error', text: (e as Error).message }),
  });

  return (
    <div>
      <PanelHeader title="Sync" subtitle="Pull the latest orders, bookings and shifts from Fresto." />
      {msg && <Status kind={msg.kind}>{msg.text}</Status>}
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {data && (
        <>
          <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Last sync per restaurant</h3>
          <Card className="p-1 mb-6">
            <Table>
              <thead><tr><Th>Restaurant</Th><Th>Last synced</Th><Th>Age</Th></tr></thead>
              <tbody>
                {data.last_sync_per_restaurant.map(r => (
                  <tr key={r.slug}>
                    <Td>{r.name || r.slug}</Td>
                    <Td className="text-[var(--text-muted)]">{fmtTs(r.last_synced_at)}</Td>
                    <Td>{relativeTime(r.last_synced_at)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Cron job</h3>
          <Card className="p-4 mb-6">
            <p className="text-[13px] text-[var(--text-muted)] mb-3">
              Schedule <span className="font-mono text-[var(--text)]">{data.cron_schedule || '—'}</span>
              {' · currently '}
              <span className={data.cron_active ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}>
                {data.cron_active ? 'ON' : 'OFF'}
              </span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Btn variant="ghost" disabled={toggle.isPending} onClick={() => toggle.mutate(!data.cron_active)}>
                {data.cron_active ? 'Disable cron' : 'Enable cron'}
              </Btn>
              <Btn disabled={run.isPending} onClick={() => run.mutate()}>
                {run.isPending ? 'Starting…' : 'Run sync now'}
              </Btn>
            </div>
          </Card>

          <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Recent webhook events</h3>
          <Card className="p-1">
            <Table>
              <thead><tr><Th>Action</Th><Th>Entity</Th><Th>Received</Th><Th>Processed</Th><Th>Error</Th></tr></thead>
              <tbody>
                {data.recent_events.map((ev, i) => (
                  <tr key={i}>
                    <Td>{ev.action || ''}</Td>
                    <Td className="font-mono text-[12px] text-[var(--text-muted)]">{ev.entity_id || ''}</Td>
                    <Td className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.received_at)}</Td>
                    <Td className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.processed_at)}</Td>
                    <Td className="text-[#ff8585] text-[12px]">{ev.error || ''}</Td>
                  </tr>
                ))}
                {data.recent_events.length === 0 && (
                  <tr><Td className="text-[var(--text-muted)]">No recent events.</Td></tr>
                )}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
