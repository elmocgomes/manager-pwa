import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TotalsCard } from './TotalsCard';

describe('TotalsCard', () => {
  it('renders revenue + guests, live footer when isToday', () => {
    render(<TotalsCard totalRevenue={52000} totalGuests={64} isToday={true} />);
    expect(screen.getByText(/52\.000|52,000/)).toBeInTheDocument();
    expect(screen.getByText('DKK')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
    expect(screen.getByText(/live/)).toBeInTheDocument();
    expect(screen.getByText(/Served so far/)).toBeInTheDocument();
  });
  it('renders final footer when not isToday', () => {
    render(<TotalsCard totalRevenue={48200} totalGuests={58} isToday={false} />);
    expect(screen.getByText(/final/)).toBeInTheDocument();
    expect(screen.getByText(/Total covers/)).toBeInTheDocument();
  });
});
