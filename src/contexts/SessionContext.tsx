import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type SessionContextValue = { session: Session | null; loading: boolean };

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => { if (alive) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (alive) setSession(sess);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return <SessionContext.Provider value={{ session, loading }}>{children}</SessionContext.Provider>;
}
