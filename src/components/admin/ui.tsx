// Shared admin UI primitives, styled to match the PWA's dark theme
// (CSS vars from index.css: --bg, --panel, --panel-2, --border, --text, etc.).
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

export function PanelHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)] leading-tight">{title}</h2>
        {subtitle && <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--panel)] border border-[var(--border)] rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function Btn({
  variant = 'primary', className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger' }) {
  const styles = {
    primary: 'bg-[var(--accent)] text-[#0d1117] hover:brightness-110 disabled:opacity-40',
    ghost: 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--panel-2)] disabled:opacity-40',
    danger: 'bg-transparent text-[#ff6b6b] border border-[rgba(255,107,107,0.35)] hover:bg-[rgba(255,107,107,0.1)]',
  }[variant];
  return (
    <button
      {...props}
      className={`text-[13px] font-medium px-3.5 py-2 rounded-lg transition disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {label}
      {children}
    </label>
  );
}

const inputBase =
  'bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-[14px] text-[var(--text)] ' +
  'outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)] disabled:opacity-50';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputBase} ${props.className ?? ''}`} />;
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3 mb-4">{children}</div>;
}

// Responsive "table": aligned columns on desktop (md+), stacked labeled cards
// on mobile. `cols` is a Tailwind grid-template class applied only at md+
// (e.g. 'md:grid-cols-[90px_1.4fr_100px]'); on mobile every row is a single
// stacked column. Write `cols` as a literal string so Tailwind's JIT sees it.
export function DataTable({ cols, headers, children }: { cols: string; headers: string[]; children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className={`hidden md:grid gap-3 px-4 py-2.5 border-b border-[var(--border)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] ${cols}`}>
        {headers.map((h, i) => <div key={i} className="min-w-0">{h}</div>)}
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </Card>
  );
}

export function DataRow({ cols, children, highlight = false, className = '' }: {
  cols: string; children: ReactNode; highlight?: boolean; className?: string;
}) {
  return (
    <div className={`px-4 py-3.5 grid grid-cols-1 gap-3 md:items-center ${cols} ${highlight ? 'bg-[rgba(88,166,255,0.06)]' : ''} ${className}`}>
      {children}
    </div>
  );
}

// One cell. On mobile the column label sits above the value; on desktop the
// label is hidden (shown once in the header) and the value aligns to its column.
export function DataCell({ label, children, className = '' }: { label?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && <div className="md:hidden text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-1">{label}</div>}
      <div className="min-w-0 text-[var(--text)] text-[14px] md:text-[13px]">{children}</div>
    </div>
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return <div className="px-4 py-4 text-[13px] text-[var(--text-muted)]">{children}</div>;
}

export function Status({ kind, children }: { kind: 'ok' | 'error' | 'info'; children: ReactNode }) {
  const styles = {
    ok: 'bg-[rgba(46,204,113,0.12)] text-[var(--green)] border-[rgba(46,204,113,0.3)]',
    error: 'bg-[rgba(255,107,107,0.12)] text-[#ff8585] border-[rgba(255,107,107,0.3)]',
    info: 'bg-[rgba(88,166,255,0.12)] text-[var(--accent)] border-[rgba(88,166,255,0.3)]',
  }[kind];
  return <div className={`text-[13px] px-3 py-2 rounded-lg border mb-4 ${styles}`}>{children}</div>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div className="text-[13px] text-[var(--text-muted)] py-6 text-center">{label}</div>;
}

export function SavedTick({ show }: { show: boolean }) {
  return (
    <span
      className="ml-2 text-[var(--green)] text-[12px] transition-opacity duration-200"
      style={{ opacity: show ? 1 : 0 }}
    >
      ✓ saved
    </span>
  );
}

// Relative time, e.g. "3 min ago" / "never".
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day ago`;
}

export function fmtTs(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/Copenhagen' });
}
