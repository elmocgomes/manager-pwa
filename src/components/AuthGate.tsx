import type { ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { Login } from './Login';

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  if (loading) return <div className="p-6 text-center text-slate-400">Loading…</div>;
  if (!session) return <Login />;
  return <>{children}</>;
}
