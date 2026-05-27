import { useEffect } from 'react';
import { Field, Select } from './ui';
import { useRestaurantOptions } from './useRestaurantOptions';

// Restaurant <select> bound to the active-restaurants list. Auto-selects the
// first option once loaded if nothing is selected yet.
export function RestaurantPicker({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const { data } = useRestaurantOptions();
  useEffect(() => {
    if (!value && data && data.length > 0) onChange(data[0].slug);
  }, [value, data, onChange]);

  return (
    <Field label="Restaurant">
      <Select value={value} onChange={e => onChange(e.target.value)} className="min-w-[160px]">
        {(data ?? []).map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)}
      </Select>
    </Field>
  );
}
