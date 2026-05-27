import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { useUserProfile } from '../../contexts/ProfileContext';
import { Card, DataCell, DataRow, DataTable, EmptyRow, PanelHeader, Spinner, Status, fmtTs, relativeTime } from './ui';

const EVT_COLS = 'md:grid-cols-[120px_1fr_170px_1fr]';

export function HomePanel() {
  const profile = useUserProfile();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sync-status'],
    queryFn: adminApi.syncStatus,
    refetchInterval: 60_000,
  });

  return (
    <div>
      <PanelHeader title={`Welcome, ${profile.full_name.split(' ')[0]}`} subtitle="Operations overview for Cholon + Maven." />
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {data.last_sync_per_restaurant.map(r => (
              <Card key={r.slug} className="p-4">
                <div className="text-[15px] font-semibold">{r.name || r.slug}</div>
                <div className="text-[12px] text-[var(--text-muted)] mt-1">
                  Last synced {relativeTime(r.last_synced_at)}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{fmtTs(r.last_synced_at)}</div>
              </Card>
            ))}
          </div>

          <h3 className="text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">Recent webhook events</h3>
          <DataTable cols={EVT_COLS} headers={['Action', 'Entity', 'Received', 'Error']}>
            {data.recent_events.slice(0, 12).map((ev, i) => (
              <DataRow key={i} cols={EVT_COLS}>
                <DataCell label="Action">{ev.action || ''}</DataCell>
                <DataCell label="Entity"><span className="font-mono text-[12px] text-[var(--text-muted)] break-all">{ev.entity_id || ''}</span></DataCell>
                <DataCell label="Received"><span className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.received_at)}</span></DataCell>
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
