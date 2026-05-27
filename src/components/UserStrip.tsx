import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ChangePassword } from './ChangePassword';

type Props = { fullName: string; version: string };

function initials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
}

export function UserStrip({ fullName, version }: Props) {
  const online = useOnlineStatus();
  return (
    <div className="flex justify-between items-center mb-3.5 text-[11px] text-[var(--text-muted)]">
      <div className="flex items-center gap-2">
        <div className="w-[22px] h-[22px] rounded-full text-white text-[9px] font-bold tracking-wider inline-flex items-center justify-center"
             style={{ background: 'linear-gradient(135deg, var(--accent), #7bb8ff)' }}>
          {initials(fullName)}
        </div>
        <span className="text-[var(--text)] font-medium">{fullName}</span>
      </div>
      <div className="flex items-center gap-2.5">
        {!online && (
          <span className="text-[10px] uppercase tracking-[0.15em] font-semibold py-0.5 px-2 rounded bg-[rgba(255,140,66,0.12)] text-[var(--orange)] border border-[rgba(255,140,66,0.3)]">
            offline
          </span>
        )}
        <ChangePassword />
        <span className="font-mono opacity-60">{version}</span>
      </div>
    </div>
  );
}
