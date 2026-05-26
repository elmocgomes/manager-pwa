export const fmtN = (n: number) => new Intl.NumberFormat('da-DK').format(Math.round(n));

// Human-friendly "time since" for the data-freshness indicator.
// Returns '' for missing/invalid input so callers can hide the label.
export function fmtRelative(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const sec = Math.max(0, Math.round((now - t) / 1000));
  if (sec < 45) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.round(hr / 24)}d ago`;
}

// Minutes since an ISO timestamp (used to flag a stalled live sync).
export function minutesSince(iso: string | null | undefined, now: number = Date.now()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return (now - t) / 60000;
}
