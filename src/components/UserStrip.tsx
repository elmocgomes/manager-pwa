type Props = { fullName: string; version: string };

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

export function UserStrip({ fullName, version }: Props) {
  return (
    <div className="flex justify-between items-center mb-3.5 text-[11px] text-[var(--text-muted)]">
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-full text-white text-[9px] font-bold tracking-wider inline-flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, var(--accent), #7bb8ff)' }}>
          {initials(fullName)}
        </div>
        <span className="text-[var(--text)] font-medium">{fullName}</span>
      </div>
      <span className="font-mono opacity-60">{version}</span>
    </div>
  );
}
