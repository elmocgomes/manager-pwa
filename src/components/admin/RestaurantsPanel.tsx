import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminRestaurant } from '../../lib/adminApi';
import { Card, PanelHeader, SavedTick, Spinner, Status, Table, Th, Td, TextInput } from './ui';

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
    <tr>
      <Td className="font-mono text-[12px] text-[var(--text-muted)]">{r.slug}</Td>
      <Td>
        <TextInput value={name} onChange={e => setName(e.target.value)}
          onBlur={() => name !== (r.name ?? '') && save.mutate({ name })} className="w-40" />
        <SavedTick show={savedField === 'name'} />
      </Td>
      <Td>
        <TextInput type="number" value={seats} onChange={e => setSeats(e.target.value)}
          onBlur={() => save.mutate({ total_seats: seats === '' ? null : Number(seats) })} className="w-24" />
        <SavedTick show={savedField === 'total_seats'} />
      </Td>
      <Td>
        <TextInput type="number" value={hours} onChange={e => setHours(e.target.value)}
          onBlur={() => save.mutate({ open_hours: hours === '' ? null : Number(hours) })} className="w-24" />
        <SavedTick show={savedField === 'open_hours'} />
      </Td>
      <Td>
        <input type="checkbox" checked={active}
          onChange={e => { setActive(e.target.checked); save.mutate({ active: e.target.checked }); }}
          className="w-4 h-4 accent-[var(--accent)]" />
        <SavedTick show={savedField === 'active'} />
      </Td>
      <Td className="text-[var(--text-muted)]">{r.source_pos || ''}</Td>
      {err && <Td className="text-[#ff8585] text-[12px]">{err}</Td>}
    </tr>
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
        <Card className="p-1">
          <Table>
            <thead>
              <tr><Th>Slug</Th><Th>Name</Th><Th>Total seats</Th><Th>Open hours</Th><Th>Active</Th><Th>POS</Th></tr>
            </thead>
            <tbody>
              {data.map(r => <RestaurantRow key={r.slug} r={r} />)}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
