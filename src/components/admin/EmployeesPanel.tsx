import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminEmployee } from '../../lib/adminApi';
import { DataCell, DataRow, DataTable, EmptyRow, PanelHeader, SavedTick, Spinner, Status, TextInput, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

const COLS = 'md:grid-cols-[1fr_1fr_1fr_100px_1.2fr_140px]';

function EmployeeRow({ e }: { e: AdminEmployee }) {
  const qc = useQueryClient();
  const [pd, setPd] = useState(e.planday_employee_id?.toString() ?? '');
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (v: number | null) => adminApi.setEmployeePlandayId(e.id, v),
    onSuccess: () => {
      setErr(null); setSaved(true); setTimeout(() => setSaved(false), 1800);
      qc.invalidateQueries({ queryKey: ['admin', 'employees'] });
    },
    onError: (er) => setErr((er as Error).message),
  });

  return (
    <DataRow cols={COLS}>
      <DataCell label="First name">{e.first_name || ''}</DataCell>
      <DataCell label="Last name">{e.last_name || ''}</DataCell>
      <DataCell label="POS name"><span className="text-[var(--text-muted)]">{e.pos_name || ''}</span></DataCell>
      <DataCell label="Role"><span className="text-[var(--text-muted)]">{e.role || ''}</span></DataCell>
      <DataCell label="Fresto UID"><span className="font-mono text-[11px] text-[var(--text-muted)] break-all">{e.fresto_uid || ''}</span></DataCell>
      <DataCell label="PlanDay ID">
        <TextInput type="number" value={pd} onChange={ev => setPd(ev.target.value)}
          onBlur={() => save.mutate(pd === '' ? null : Number(pd))} className="w-full md:w-32" placeholder="—" />
        <SavedTick show={saved} />
        {err && <span className="text-[#ff8585] text-[12px] ml-2">{err}</span>}
      </DataCell>
    </DataRow>
  );
}

export function EmployeesPanel() {
  const [slug, setSlug] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'employees', slug],
    enabled: !!slug,
    queryFn: () => adminApi.listEmployees(slug),
  });

  return (
    <div>
      <PanelHeader title="Employees" subtitle="Link Fresto staff to their PlanDay employee ID so labor cost lines up." />
      <Toolbar><RestaurantPicker value={slug} onChange={setSlug} /></Toolbar>
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}
      {data && (
        <DataTable cols={COLS} headers={['First name', 'Last name', 'POS name', 'Role', 'Fresto UID', 'PlanDay ID']}>
          {data.map(e => <EmployeeRow key={e.id} e={e} />)}
          {data.length === 0 && <EmptyRow>No employees.</EmptyRow>}
        </DataTable>
      )}
    </div>
  );
}
