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
});
