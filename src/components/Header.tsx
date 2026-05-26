import { useEffect, useState } from 'react';
import { fmtRelative, minutesSince } from '../lib/format';

type Props = {
  live: boolean;
  /** Most recent data sync time (ISO). Shown as a freshness indicator when live. */
  lastSyncedAt?: string | null;
};

export function Header({ live, lastSyncedAt }: Props) {
  // Re-render every 30s so the relative "updated Xm ago" stays current
  // between data refetches.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!live || !lastSyncedAt) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [live, lastSyncedAt]);

  const rel = live ? fmtRelative(lastSyncedAt, now) : '';
  const ageMin = minutesSince(lastSyncedAt, now);
  // A live service that hasn't synced in >15 min likely means the sync stalled.
  const stale = live && ageMin != null && ageMin > 15;

  return (
    <div className="flex justify-between items-start mb-3.5">
      <div className="text-[13px] text-[var(--text-muted)] uppercase tracking-[0.18em] pt-1">
        Manager Dashboard
      </div>
      <div className="flex flex-col items-end gap-1">
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
        {rel && (
          <span
            aria-label={`Data last updated ${rel}${stale ? ' — sync may be delayed' : ''}`}
            className={`text-[10px] tracking-[0.04em] ${stale ? 'text-[var(--orange)]' : 'text-[var(--text-muted)]'}`}
          >
            {stale ? '⚠ ' : ''}Updated {rel}
          </span>
        )}
      </div>
    </div>
  );
}
