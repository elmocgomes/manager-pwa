import { fmtN } from '../lib/format';

type Props = {
  laborPct: number;
  laborDkk: number;
  totalRevenue: number;
  tone: 'good' | 'ok' | 'warn';
};

const TONE_TEXT: Record<Props['tone'], string> = {
  good: 'text-[var(--green)]',
  ok:   'text-[var(--text)]',
  warn: 'text-[var(--orange)]',
};

export function LaborCard({ laborPct, laborDkk, totalRevenue, tone }: Props) {
  const fillPct = Math.min(laborPct * 2.5, 100);
  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex justify-between items-baseline mb-3">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.15em]">Labor / Revenue</div>
        <div className={`text-4xl font-bold tabular-nums tracking-tight ${TONE_TEXT[tone]}`}>
          {laborPct.toFixed(1)}%
        </div>
      </div>
      <div className="h-2 bg-[var(--panel-2)] rounded mb-2.5 overflow-hidden">
        <div className="h-full rounded transition-[width] duration-500"
             style={{ width: `${fillPct}%`, background: 'linear-gradient(90deg, var(--green), #3fe07d)' }} />
      </div>
      <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
        <span>Labor <b className="text-[var(--text)] font-semibold">{fmtN(laborDkk)} DKK</b></span>
        <span>Revenue <b className="text-[var(--text)] font-semibold">{fmtN(totalRevenue)} DKK</b></span>
      </div>
    </div>
  );
}
