import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';
import { useUserProfile } from '../../contexts/ProfileContext';
import { Card, PanelHeader, Spinner, Status, Table, Th, Td, fmtTs, relativeTime } from './ui';

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
          <Card className="p-1">
            <Table>
              <thead>
                <tr><Th>Action</Th><Th>Entity</Th><Th>Received</Th><Th>Error</Th></tr>
              </thead>
              <tbody>
                {data.recent_events.slice(0, 12).map((ev, i) => (
                  <tr key={i}>
                    <Td>{ev.action || ''}</Td>
                    <Td className="font-mono text-[12px] text-[var(--text-muted)]">{ev.entity_id || ''}</Td>
                    <Td className="text-[12px] text-[var(--text-muted)]">{fmtTs(ev.received_at)}</Td>
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
