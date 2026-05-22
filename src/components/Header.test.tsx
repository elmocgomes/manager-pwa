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
});
