import { fmtN } from '../lib/format';

type Props = {
  drinksRevenue: number;
  drinksGuests: number;
  drinksAvg: number;
  diningRevenue: number;
  diningGuests: number;
  diningAvg: number;
};

export function SplitCard(p: Props) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 grid grid-cols-2 gap-3.5">
      <div className="pr-2 border-r border-[var(--border)]">
        <div className="text-lg mb-1.5">🥃</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2">Drinks only</div>
        <div className="text-[21px] font-bold tabular-nums leading-tight">
          {fmtN(p.drinksRevenue)} <span className="text-[15px] text-[var(--text-muted)] font-normal">DKK</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">
          <b className="text-[var(--text)] font-semibold">{p.drinksGuests}</b> items · avg <b className="text-[var(--text)] font-semibold">{p.drinksGuests > 0 ? fmtN(p.drinksAvg) : '—'}</b>
        </div>
      </div>
      <div className="pl-2">
        <div className="text-lg mb-1.5">🍽️</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2">Dining</div>
        <div className="text-[21px] font-bold tabular-nums leading-tight">
          {fmtN(p.diningRevenue)} <span className="text-[15px] text-[var(--text-muted)] font-normal">DKK</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">
          <b className="text-[var(--text)] font-semibold">{p.diningGuests}</b> items · avg <b className="text-[var(--text)] font-semibold">{p.diningGuests > 0 ? fmtN(p.diningAvg) : '—'}</b>
        </div>
      </div>
    </div>
  );
}
