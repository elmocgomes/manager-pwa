import { useEffect, useState } from 'react';

type Props = { name: string; date: Date };

function fmtDate(d: Date): string {
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('en-GB', opts).format(d);
}

function fmtClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function RestaurantLine({ name, date }: Props) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex justify-between items-baseline mt-4">
      <div className="text-[26px] font-bold tracking-[0.01em]">{name}</div>
      <div className="text-[13px] text-[var(--text-muted)] tabular-nums">
        <span>{fmtDate(date)}</span> · <span>{fmtClock(now)}</span>
      </div>
    </div>
  );
}
