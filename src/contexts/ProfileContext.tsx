import { createContext, useContext, type ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import { useProfile } from '../hooks/useProfile';

type Restaurant = { id: string; slug: string; name: string };
type Profile = { id: string; full_name: string; restaurants: Restaurant[] };

const Ctx = createContext<Profile | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const { data } = useProfile(session?.user?.id);
  if (!data) return <div className="p-6 text-center text-slate-400">Loading profile…</div>;
  return <Ctx.Provider value={data as Profile}>{children}</Ctx.Provider>;
}

export function useUserProfile() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUserProfile outside ProfileProvider');
  return v;
}
