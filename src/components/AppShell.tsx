import { useEffect } from 'react';
import { useUserProfile } from '../contexts/ProfileContext';
import { useHashRoute, navigate } from '../hooks/useHashRoute';
import { Dashboard } from '../pages/Dashboard';
import { AdminApp } from './admin/AdminApp';

// Top-level view switch. The dashboard is the default; `#admin*` routes open the
// admin area, but only for admins — non-admins are bounced back to the dashboard.
export function AppShell() {
  const profile = useUserProfile();
  const route = useHashRoute();
  const wantsAdmin = route === 'admin' || route.startsWith('admin/');
  const showAdmin = wantsAdmin && profile.is_admin;

  useEffect(() => {
    if (wantsAdmin && !profile.is_admin) navigate('');
  }, [wantsAdmin, profile.is_admin]);

  return showAdmin ? <AdminApp /> : <Dashboard />;
}
