import { useEffect, useState } from 'react';

type Props = { name: string; date: Date };

// Restaurants are in Denmark — show the business date and wall clock in
// Copenhagen time regardless of where the viewer's device is.
const RESTAURANT_TZ = 'Europe/Copenhagen';

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: RESTAURANT_TZ,
  }).format(d);
}

function fmtClock(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: RESTAURANT_TZ,
  }).format(d);
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
