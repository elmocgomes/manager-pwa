import { fmtN } from '../lib/format';

type Props = {
  totalRevenue: number;
  drinksRevenue: number;
  drinksGuests: number;  // semantically: line count
  drinksAvg: number;
  diningRevenue: number;
  diningGuests: number;  // semantically: line count
  diningAvg: number;
};

function pct(part: number, whole: number): string {
  if (whole <= 0) return '0%';
  return Math.round((part / whole) * 100) + '%';
}

// Rename to disambiguate from "Drinks only" (the previous bar-only-customer
// semantic). "Drinks" = all drink-line revenue across every order.
export function SplitCard(p: Props) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 grid grid-cols-2 gap-3.5">
      <div className="pr-2 border-r border-[var(--border)]">
        <div className="text-lg mb-1.5">🥃</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2">Drinks</div>
        <div className="text-[21px] font-bold tabular-nums leading-tight">
          {fmtN(p.drinksRevenue)} <span className="text-[15px] text-[var(--text-muted)] font-normal">DKK</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">
          <b className="text-[var(--text)] font-semibold">{pct(p.drinksRevenue, p.totalRevenue)}</b> of revenue ·
          {' '}avg <b className="text-[var(--text)] font-semibold">{p.drinksGuests > 0 ? fmtN(p.drinksAvg) : '—'}</b>/item
        </div>
      </div>
      <div className="pl-2">
        <div className="text-lg mb-1.5">🍽️</div>
        <div className="text-xs text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2">Food</div>
        <div className="text-[21px] font-bold tabular-nums leading-tight">
          {fmtN(p.diningRevenue)} <span className="text-[15px] text-[var(--text-muted)] font-normal">DKK</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">
          <b className="text-[var(--text)] font-semibold">{pct(p.diningRevenue, p.totalRevenue)}</b> of revenue ·
          {' '}avg <b className="text-[var(--text)] font-semibold">{p.diningGuests > 0 ? fmtN(p.diningAvg) : '—'}</b>/item
        </div>
      </div>
    </div>
  );
}
