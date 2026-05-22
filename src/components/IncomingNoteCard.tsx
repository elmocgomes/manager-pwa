import { useClosingNote } from '../hooks/useClosingNote';

type Props = {
  restaurantId: string;
  businessDate: string;  // date of the CURRENT view (we'll subtract 1 day inside)
};

function fmtShort(d: Date) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
}

function priorDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const prev = new Date(y, m - 1, d - 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
}

export function IncomingNoteCard({ restaurantId, businessDate }: Props) {
  const prev = priorDate(businessDate);
  const { data } = useClosingNote(restaurantId, prev);

  const dateLabel = (() => {
    const [y, m, d] = prev.split('-').map(Number);
    return fmtShort(new Date(y, m - 1, d));
  })();

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold py-0.5 px-2 rounded bg-[rgba(167,139,250,0.12)] text-[var(--purple)] border border-[rgba(167,139,250,0.25)]">
          Note from yesterday
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">{dateLabel}</span>
      </div>
      {data ? (
        <>
          <div className="text-sm leading-relaxed italic text-[var(--text)] py-3 px-3.5 bg-[var(--panel-2)] rounded-r-lg border-l-[3px] border-[var(--purple)]">
            {data.body}
          </div>
          <div className="mt-2 text-[11px] text-[var(--text-muted)] text-right">— {data.author_name}</div>
        </>
      ) : (
        <div className="p-3 bg-[var(--panel-2)] rounded text-[var(--text-muted)] text-xs text-center italic">
          No earlier note available
        </div>
      )}
    </div>
  );
}
