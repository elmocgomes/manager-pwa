type Props = {
  bookingsServed: number;
  walkinsServed: number;
  bookingsToCome: number;
  isToday: boolean;
};

export function BookingsCard({ bookingsServed, walkinsServed, bookingsToCome, isToday }: Props) {
  const totalServed = bookingsServed + walkinsServed;
  const bookingPct = totalServed > 0 ? Math.round((bookingsServed / totalServed) * 100) : 0;
  const walkinPct = 100 - bookingPct;

  return (
    <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4">
      <div className="flex justify-between items-baseline mb-2.5">
        <span className="text-2xl font-bold tabular-nums">{bookingsServed}</span>
        <span className="text-2xl font-semibold tabular-nums text-[var(--text-muted)]">{walkinsServed}</span>
      </div>
      <div className="h-2 bg-[var(--panel-2)] rounded mb-2.5 overflow-hidden flex">
        <div className="bg-[var(--green)] h-full" style={{ width: `${bookingPct}%` }} />
        <div className="bg-[var(--accent)] h-full" style={{ width: `${walkinPct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span><span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle bg-[var(--green)]" /><b className="text-[var(--text)] font-semibold">{bookingsServed}</b> bookings served</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle bg-[var(--accent)]" /><b className="text-[var(--text)] font-semibold">{walkinsServed}</b> walk-ins</span>
      </div>
      {isToday && bookingsToCome > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex justify-between items-center">
          <span className="text-[var(--text-muted)] text-[11px] uppercase tracking-[0.1em]">Bookings still to come</span>
          <b className="tabular-nums font-bold text-[13px]">{bookingsToCome}</b>
        </div>
      )}
    </div>
  );
}
