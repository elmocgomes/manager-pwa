type Props = { live: boolean };

export function Header({ live }: Props) {
  return (
    <div className="flex justify-between items-center mb-3.5">
      <div className="text-[13px] text-[var(--text-muted)] uppercase tracking-[0.18em]">
        Manager Dashboard
      </div>
      {live ? (
        <span role="status" aria-label="Service is currently live"
              className="inline-flex items-center gap-1.5 bg-[rgba(46,204,113,0.12)] text-[var(--green)] border border-[rgba(46,204,113,0.3)] px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--green)] animate-pulse" style={{ boxShadow: '0 0 8px var(--green)' }} />
          LIVE
        </span>
      ) : (
        <span role="status" aria-label="Service is closed"
              className="inline-flex items-center gap-1.5 bg-[rgba(139,148,158,0.10)] text-[var(--text-muted)] border border-[var(--border)] px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold">
          <span className="w-[7px] h-[7px] rounded-full bg-[var(--text-muted)]" />
          CLOSED
        </span>
      )}
    </div>
  );
}
