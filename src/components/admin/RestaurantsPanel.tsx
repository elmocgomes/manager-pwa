import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminRestaurant } from '../../lib/adminApi';
import { DataCell, DataRow, DataTable, PanelHeader, SavedTick, Spinner, Status, TextInput } from './ui';

const COLS = 'md:grid-cols-[90px_1.4fr_110px_110px_70px_90px]';

function RestaurantRow({ r }: { r: AdminRestaurant }) {
  const qc = useQueryClient();
  const [name, setName] = useState(r.name ?? '');
  const [seats, setSeats] = useState(r.total_seats?.toString() ?? '');
  const [hours, setHours] = useState(r.open_hours?.toString() ?? '');
  const [active, setActive] = useState(r.active);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (patch: Partial<Pick<AdminRestaurant, 'name' | 'total_seats' | 'open_hours' | 'active'>>) =>
      adminApi.patchRestaurant(r.slug, patch),
    onSuccess: (_d, patch) => {
      setErr(null);
      setSavedField(Object.keys(patch)[0]);
      setTimeout(() => setSavedField(null), 1800);
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      qc.invalidateQueries({ queryKey: ['admin', 'restaurant-options'] });
    },
    onError: (e) => setErr((e as Error).message),
  });

  return (
    <DataRow cols={COLS}>
      <DataCell label="Slug"><span className="font-mono text-[12px] text-[var(--text-muted)]">{r.slug}</span></DataCell>
      <DataCell label="Name">
        <TextInput value={name} onChange={e => setName(e.target.value)}
          onBlur={() => name !== (r.name ?? '') && save.mutate({ name })} className="w-full md:w-44" />
        <SavedTick show={savedField === 'name'} />
      </DataCell>
      <DataCell label="Total seats">
        <TextInput type="number" value={seats} onChange={e => setSeats(e.target.value)}
          onBlur={() => save.mutate({ total_seats: seats === '' ? null : Number(seats) })} className="w-full md:w-24" />
        <SavedTick show={savedField === 'total_seats'} />
      </DataCell>
      <DataCell label="Open hours">
        <TextInput type="number" value={hours} onChange={e => setHours(e.target.value)}
          onBlur={() => save.mutate({ open_hours: hours === '' ? null : Number(hours) })} className="w-full md:w-24" />
        <SavedTick show={savedField === 'open_hours'} />
      </DataCell>
      <DataCell label="Active">
        <input type="checkbox" checked={active}
          onChange={e => { setActive(e.target.checked); save.mutate({ active: e.target.checked }); }}
          className="w-4 h-4 accent-[var(--accent)]" />
        <SavedTick show={savedField === 'active'} />
      </DataCell>
      <DataCell label="POS"><span className="text-[var(--text-muted)]">{r.source_pos || ''}</span></DataCell>
      {err && <div className="text-[#ff8585] text-[12px] md:col-span-6">{err}</div>}
    </DataRow>
  );
}

export function RestaurantsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'restaurants'],
    queryFn: adminApi.listRestaurants,
  });

  return (
    <div>
      <PanelHeader title="Restaurants" subtitle="Edit display name, capacity and active status. Changes save as you leave a field." />
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}
      {data && (
        <DataTable cols={COLS} headers={['Slug', 'Name', 'Total seats', 'Open hours', 'Active', 'POS']}>
          {data.map(r => <RestaurantRow key={r.slug} r={r} />)}
        </DataTable>
      )}
    </div>
  );
}
