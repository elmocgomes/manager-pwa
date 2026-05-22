type Props = {
  selected: 0 | 1 | 2;
  onSelect: (n: 0 | 1 | 2) => void;
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dowLabel(offset: 0 | 1 | 2): string {
  const t = new Date();
  t.setDate(t.getDate() - offset);
  return DOW[t.getDay()];
}

const LABELS: Array<{ main: string; offset: 0 | 1 | 2 }> = [
  { main: 'Today', offset: 0 },
  { main: 'Yesterday', offset: 1 },
  { main: '2 days ago', offset: 2 },
];

export function DayToggle({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 bg-[var(--panel)] border border-[var(--border)] rounded-[10px] p-[3px] gap-[3px]">
      {LABELS.map(({ main, offset }) => {
        const active = offset === selected;
        return (
          <button key={offset} onClick={() => onSelect(offset)}
            aria-pressed={active}
            className={[
              'border-0 text-xs font-medium px-1 py-2 rounded-[7px] cursor-pointer transition-all leading-tight',
              active
                ? 'bg-[var(--panel-2)] text-[var(--text)] shadow-[inset_0_0_0_1px_var(--border)]'
                : 'bg-transparent text-[var(--text-muted)]'
            ].join(' ')}>
            <span className="block text-[13px] font-semibold">{main}</span>
            <span className={`block text-[10px] mt-0.5 ${active ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{dowLabel(offset)}</span>
          </button>
        );
      })}
    </div>
  );
}
