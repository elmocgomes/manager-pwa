import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Profile } from '../hooks/useProfile';

// Stub the heavy child views so the test focuses on the routing gate.
vi.mock('../pages/Dashboard', () => ({ Dashboard: () => <div>DASHBOARD</div> }));
vi.mock('./admin/AdminApp', () => ({ AdminApp: () => <div>ADMIN</div> }));

let profile: Profile;
vi.mock('../contexts/ProfileContext', () => ({ useUserProfile: () => profile }));

import { AppShell } from './AppShell';

const admin: Profile = { id: 'u1', full_name: 'Elmo', is_admin: true, restaurants: [] };
const manager: Profile = { id: 'u2', full_name: 'Manager', is_admin: false, restaurants: [] };

beforeEach(() => { window.location.hash = ''; });

describe('AppShell routing gate', () => {
  it('shows the dashboard by default', () => {
    profile = admin;
    render(<AppShell />);
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
  });

  it('opens the admin area for an admin on #admin', () => {
    profile = admin;
    window.location.hash = '#admin';
    render(<AppShell />);
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('blocks a non-admin from #admin and bounces to the dashboard', async () => {
    profile = manager;
    window.location.hash = '#admin';
    render(<AppShell />);
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    await waitFor(() => expect(window.location.hash).toBe(''));
  });
});
