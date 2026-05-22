type Restaurant = { id: string; slug: string; name: string };
type Props = {
  restaurants: Restaurant[];
  selected: string;  // slug
  onSelect: (slug: string) => void;
};

export function RestaurantToggle({ restaurants, selected, onSelect }: Props) {
  if (restaurants.length === 0) return null;
  return (
    <div className="grid bg-[var(--panel)] border border-[var(--border)] rounded-xl p-1 gap-1 mb-2"
         style={{ gridTemplateColumns: `repeat(${restaurants.length}, 1fr)` }}>
      {restaurants.map(r => (
        <button key={r.slug} onClick={() => onSelect(r.slug)}
          className={[
            'border-0 text-base font-medium p-2.5 rounded-lg cursor-pointer transition-all',
            r.slug === selected
              ? 'bg-[var(--accent)] text-white font-semibold'
              : 'bg-transparent text-[var(--text-muted)]'
          ].join(' ')}>
          {r.name}
        </button>
      ))}
    </div>
  );
}
