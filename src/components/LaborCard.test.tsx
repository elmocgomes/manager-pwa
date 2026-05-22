import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LaborCard } from './LaborCard';

describe('LaborCard', () => {
  it('renders the pct with 1 decimal and both DKK values', () => {
    render(<LaborCard laborPct={18.8} laborDkk={9800} totalRevenue={52000} tone="good" />);
    expect(screen.getByText('18.8%')).toBeInTheDocument();
    expect(screen.getByText(/9\.800|9,800/)).toBeInTheDocument();
    expect(screen.getByText(/52\.000|52,000/)).toBeInTheDocument();
  });
  it('renders warn tone class when tone is warn', () => {
    const { container } = render(<LaborCard laborPct={28} laborDkk={15000} totalRevenue={50000} tone="warn" />);
    expect(container.innerHTML).toContain('--orange');
  });
});
