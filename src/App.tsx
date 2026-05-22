import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './contexts/SessionContext';
import { AuthGate } from './components/AuthGate';
import { ProfileProvider } from './contexts/ProfileContext';
import { Dashboard } from './pages/Dashboard';

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <SessionProvider>
        <AuthGate>
          <ProfileProvider>
            <Dashboard />
          </ProfileProvider>
        </AuthGate>
      </SessionProvider>
    </QueryClientProvider>
  );
}
