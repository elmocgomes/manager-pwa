import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { useProfile, type Profile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

const Ctx = createContext<Profile | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const { data, error, isLoading } = useProfile(session?.user?.id);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="text-rose-400 text-sm">Profile load failed: {String((error as Error).message ?? error)}</div>
        <button onClick={() => supabase.auth.signOut()}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300">
          Sign out
        </button>
      </div>
    );
  }
  if (isLoading || !data) return <div className="p-6 text-center text-slate-400">Loading profile…</div>;
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useUserProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUserProfile outside ProfileProvider');
  return v;
}
