import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type EmployeeGroupRate } from '../../lib/adminApi';
import { Card, PanelHeader, SavedTick, Spinner, Status, Table, Th, Td, TextInput, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

function RateRow({ slug, r }: { slug: string; r: EmployeeGroupRate }) {
  const qc = useQueryClient();
  const [rate, setRate] = useState(r.hourly_rate_dkk?.toString() ?? '');
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (v: number) => adminApi.setRate(slug, r.planday_employee_group_id, v),
    onSuccess: () => {
      setErr(null); setSaved(true); setTimeout(() => setSaved(false), 1800);
      qc.invalidateQueries({ queryKey: ['admin', 'rates', slug] });
    },
    onError: (e) => setErr((e as Error).message),
  });

  return (
    <tr>
      <Td>{r.group_name || <span className="text-[var(--text-muted)]">Group {r.planday_employee_group_id}</span>}</Td>
      <Td className="font-mono text-[12px] text-[var(--text-muted)]">{r.planday_employee_group_id}</Td>
      <Td>
        <TextInput type="number" step="0.01" min="0" value={rate} onChange={e => setRate(e.target.value)}
          onBlur={() => { const v = Number(rate); if (rate !== '' && !Number.isNaN(v) && v >= 0) save.mutate(v); }}
          className="w-28" />
        <span className="text-[var(--text-muted)] text-[12px] ml-1">DKK/h</span>
        <SavedTick show={saved} />
        {err && <span className="text-[#ff8585] text-[12px] ml-2">{err}</span>}
      </Td>
    </tr>
  );
}

export function RatesPanel() {
  const [slug, setSlug] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'rates', slug],
    enabled: !!slug,
    queryFn: () => adminApi.listRates(slug),
  });

  return (
    <div>
      <PanelHeader title="Pay rates" subtitle="Hourly rate per PlanDay employee group — drives the labor cost ratio on the dashboard." />
      <Toolbar><RestaurantPicker value={slug} onChange={setSlug} /></Toolbar>
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}
      {data && (
        <Card className="p-1">
          <Table>
            <thead><tr><Th>Group</Th><Th>PlanDay group ID</Th><Th>Hourly rate</Th></tr></thead>
            <tbody>
              {data.map(r => <RateRow key={r.planday_employee_group_id} slug={slug} r={r} />)}
              {data.length === 0 && <tr><Td className="text-[var(--text-muted)]">No rate rows yet.</Td></tr>}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
