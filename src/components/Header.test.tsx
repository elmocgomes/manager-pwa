import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('shows LIVE when live=true', () => {
    render(<Header live={true} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('Manager Dashboard')).toBeInTheDocument();
  });
  it('shows CLOSED when live=false', () => {
    render(<Header live={false} />);
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
  });
  it('LIVE pill has accessible label', () => {
    render(<Header live={true} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toMatch(/live/i);
  });
  it('CLOSED pill has accessible label', () => {
    render(<Header live={false} />);
    expect(screen.getByRole('status').getAttribute('aria-label')).toMatch(/closed/i);
  });
  it('shows freshness "Updated ... ago" when live with a sync time', () => {
    const twoMinAgo = new Date(Date.now() - 2 * 60_000).toISOString();
    render(<Header live={true} lastSyncedAt={twoMinAgo} />);
    expect(screen.getByText(/Updated 2m ago/)).toBeInTheDocument();
  });
  it('flags a stalled sync (>15m) with a warning', () => {
    const stale = new Date(Date.now() - 30 * 60_000).toISOString();
    render(<Header live={true} lastSyncedAt={stale} />);
    expect(screen.getByText(/⚠ Updated 30m ago/)).toBeInTheDocument();
  });
  it('hides freshness when not live', () => {
    const recent = new Date(Date.now() - 60_000).toISOString();
    render(<Header live={false} lastSyncedAt={recent} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });
});
