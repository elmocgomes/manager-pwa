import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { Btn, Card, DataCell, DataRow, DataTable, EmptyRow, PanelHeader, Spinner, Status, fmtTs, relativeTime } from './ui';

const LAST_COLS = 'md:grid-cols-[1fr_1fr_120px]';
const EVT_COLS = 'md:grid-cols-[110px_1fr_150px_150px_1fr]';

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
          <div className="mb-6">
            <DataTable cols={LAST_COLS} headers={['Restaurant', 'Last synced', 'Age']}>
              {data.last_sync_per_restaurant.map(r => (
                <DataRow key={r.slug} cols={LAST_COLS}>
                  <DataCell label="Restaurant">{r.name || r.slug}</DataCell>
                  <DataCell label="Last synced"><span className="text-[var(--text-muted)]">{fmtTs(r.last_synced_at)}</span></DataCell>
                  <DataCell label="Age">{relativeTime(r.last_synced_at)}</DataCell>
                </DataRow>
              ))}
            </DataTable>
          </div>

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
          <DataTable cols={EVT_COLS} headers={['Action', 'Entity', 'Received', 'Processed', 'Error']}>
            {data.recent_events.map((ev, i) => (
              <DataRow key={i} cols={EVT_COLS}>
                <DataCell label="Action">{ev.action || ''}</DataCell>
                <DataCell label="Entity"><span className="font-mono text-[12px] text-[var(--text-muted)] break-all">{ev.entity_id || ''}</span></DataCell>
                <DataCell label="Received"><span className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.received_at)}</span></DataCell>
                <DataCell label="Processed"><span className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.processed_at)}</span></DataCell>
                <DataCell label="Error"><span className="text-[#ff8585] text-[12px]">{ev.error || ''}</span></DataCell>
              </DataRow>
            ))}
            {data.recent_events.length === 0 && <EmptyRow>No recent events.</EmptyRow>}
          </DataTable>
        </>
      )}
    </div>
  );
}
