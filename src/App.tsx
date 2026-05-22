import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthGate } from './components/AuthGate';
import { ProfileProvider, useUserProfile } from './contexts/ProfileContext';

const qc = new QueryClient();

function DashboardStub() {
  const profile = useUserProfile();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Logged in as {profile.full_name}</h1>
      <p className="text-sm text-slate-400 mt-2">
        Restaurants: {profile.restaurants.map(r => r.name).join(', ')}
      </p>
      <p className="text-xs text-slate-500 mt-6">
        Dashboard components land in T25–T33.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthGate>
        <ProfileProvider>
          <DashboardStub />
        </ProfileProvider>
      </AuthGate>
    </QueryClientProvider>
  );
}
