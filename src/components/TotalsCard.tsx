import { fmtN } from '../lib/format';

type Props = {
  totalRevenue: number;
  totalGuests: number;
  isToday: boolean;
};

export function TotalsCard({ totalRevenue, totalGuests, isToday }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1.5">Revenue</div>
        <div className="text-4xl font-bold leading-none tabular-nums tracking-tight">
          {fmtN(totalRevenue)}<span className="text-[15px] text-[var(--text-muted)] font-normal ml-1">DKK</span>
        </div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
          Net, excl. VAT · {isToday ? 'live' : 'final'}
        </div>
      </div>
      <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.15em] mb-1.5">Guests</div>
        <div className="text-4xl font-bold leading-none tabular-nums tracking-tight">{totalGuests}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
          {isToday ? 'Served so far' : 'Total covers'}
        </div>
      </div>
    </div>
  );
}
