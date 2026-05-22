import { useContext } from 'react';
import { SessionContext } from '../contexts/SessionContext';

export function useSession() {
  const v = useContext(SessionContext);
  if (!v) throw new Error('useSession outside SessionProvider');
  return v;
}
