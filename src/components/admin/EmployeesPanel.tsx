import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminEmployee } from '../../lib/adminApi';
import { Card, PanelHeader, SavedTick, Spinner, Status, Table, Th, Td, TextInput, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

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
    <tr>
      <Td>{e.first_name || ''}</Td>
      <Td>{e.last_name || ''}</Td>
      <Td className="text-[var(--text-muted)]">{e.pos_name || ''}</Td>
      <Td className="text-[var(--text-muted)]">{e.role || ''}</Td>
      <Td className="font-mono text-[11px] text-[var(--text-muted)]">{e.fresto_uid || ''}</Td>
      <Td>
        <TextInput type="number" value={pd} onChange={ev => setPd(ev.target.value)}
          onBlur={() => save.mutate(pd === '' ? null : Number(pd))} className="w-32" placeholder="—" />
        <SavedTick show={saved} />
        {err && <span className="text-[#ff8585] text-[12px] ml-2">{err}</span>}
      </Td>
    </tr>
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
        <Card className="p-1">
          <Table>
            <thead>
              <tr><Th>First</Th><Th>Last</Th><Th>POS name</Th><Th>Role</Th><Th>Fresto UID</Th><Th>PlanDay ID</Th></tr>
            </thead>
            <tbody>
              {data.map(e => <EmployeeRow key={e.id} e={e} />)}
              {data.length === 0 && <tr><Td className="text-[var(--text-muted)]">No employees.</Td></tr>}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
