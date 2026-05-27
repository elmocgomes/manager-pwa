import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type EmployeeGroupRate } from '../../lib/adminApi';
import { DataCell, DataRow, DataTable, EmptyRow, PanelHeader, SavedTick, Spinner, Status, TextInput, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

const COLS = 'md:grid-cols-[1.4fr_150px_1fr]';

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
    <DataRow cols={COLS}>
      <DataCell label="Group">{r.group_name || <span className="text-[var(--text-muted)]">Group {r.planday_employee_group_id}</span>}</DataCell>
      <DataCell label="PlanDay group ID"><span className="font-mono text-[12px] text-[var(--text-muted)]">{r.planday_employee_group_id}</span></DataCell>
      <DataCell label="Hourly rate">
        <span className="inline-flex items-center">
          <TextInput type="number" step="0.01" min="0" value={rate} onChange={e => setRate(e.target.value)}
            onBlur={() => { const v = Number(rate); if (rate !== '' && !Number.isNaN(v) && v >= 0) save.mutate(v); }}
            className="w-28" />
          <span className="text-[var(--text-muted)] text-[12px] ml-1">DKK/h</span>
        </span>
        <SavedTick show={saved} />
        {err && <span className="text-[#ff8585] text-[12px] ml-2">{err}</span>}
      </DataCell>
    </DataRow>
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
        <DataTable cols={COLS} headers={['Group', 'PlanDay group ID', 'Hourly rate']}>
          {data.map(r => <RateRow key={r.planday_employee_group_id} slug={slug} r={r} />)}
          {data.length === 0 && <EmptyRow>No rate rows yet.</EmptyRow>}
        </DataTable>
      )}
    </div>
  );
}
