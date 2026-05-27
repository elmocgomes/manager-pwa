import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, type ProductGroup } from '../../lib/adminApi';
import { DataCell, DataRow, DataTable, EmptyRow, PanelHeader, SavedTick, Select, Spinner, Status, Toolbar } from './ui';
import { RestaurantPicker } from './RestaurantPicker';

const COLS = 'md:grid-cols-[1fr_200px]';
const CATS: Array<ProductGroup['category']> = ['drinks', 'food', 'ignore'];

function CategoryRow({ slug, g }: { slug: string; g: ProductGroup }) {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: (cat: 'drinks' | 'food' | 'ignore') => adminApi.setProductGroupCategory(g.id, cat),
    onSuccess: () => {
      setErr(null); setSaved(true); setTimeout(() => setSaved(false), 1800);
      qc.invalidateQueries({ queryKey: ['admin', 'product-groups', slug] });
    },
    onError: (e) => setErr((e as Error).message),
  });

  return (
    <DataRow cols={COLS}>
      <DataCell label="Product group">
        {g.name}
        {g.needs_review && (
          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-[var(--amber)] border border-[rgba(241,196,15,0.3)] rounded px-1.5 py-0.5">
            review
          </span>
        )}
      </DataCell>
      <DataCell label="Category">
        <Select value={g.category ?? ''} onChange={e => save.mutate(e.target.value as 'drinks' | 'food' | 'ignore')} className="w-full md:min-w-[130px]">
          <option value="" disabled>— set —</option>
          {CATS.map(c => <option key={c} value={c!}>{c}</option>)}
        </Select>
        <SavedTick show={saved} />
        {err && <span className="text-[#ff8585] text-[12px] ml-2">{err}</span>}
      </DataCell>
    </DataRow>
  );
}

export function CategoriesPanel() {
  const [slug, setSlug] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'product-groups', slug],
    enabled: !!slug,
    queryFn: () => adminApi.listProductGroups(slug),
  });

  return (
    <div>
      <PanelHeader title="Product categories" subtitle="Classify each product group as drinks, food or ignore — this powers the Drinks vs Dining split." />
      <Toolbar><RestaurantPicker value={slug} onChange={setSlug} /></Toolbar>
      {error && <Status kind="error">{(error as Error).message}</Status>}
      {isLoading && <Spinner />}
      {data && (
        <DataTable cols={COLS} headers={['Product group', 'Category']}>
          {data.map(g => <CategoryRow key={g.id} slug={slug} g={g} />)}
          {data.length === 0 && <EmptyRow>No product groups.</EmptyRow>}
        </DataTable>
      )}
    </div>
  );
}
