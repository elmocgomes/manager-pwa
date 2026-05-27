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

// Table helpers
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  );
}
export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`text-left font-semibold text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)] px-3 py-2.5 border-b border-[var(--border)] ${className}`}>
      {children}
    </th>
  );
}
export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 border-b border-[var(--border)] text-[var(--text)] align-middle ${className}`}>{children}</td>;
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
