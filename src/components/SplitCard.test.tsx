import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitCard } from './SplitCard';

describe('SplitCard', () => {
  it('renders drinks-only + dining revenue with labels and percents', () => {
    // Drinks-only: 615 DKK across 5 bar-only customers, avg 123/customer
    // Dining: 31,922 DKK across 45 dining customers, avg 709/customer
    render(<SplitCard totalRevenue={32537}
                      drinksRevenue={615} drinksGuests={5} drinksAvg={123}
                      diningRevenue={31922} diningGuests={45} diningAvg={709} />);
    expect(screen.getByText(/615/)).toBeInTheDocument();
    expect(screen.getByText(/31\.922|31,922/)).toBeInTheDocument();
    expect(screen.getByText('Drinks only')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
    // 615/32537 ≈ 2%, 31922/32537 ≈ 98%
    expect(screen.getByText('2%')).toBeInTheDocument();
    expect(screen.getByText('98%')).toBeInTheDocument();
  });

  it('renders "—" for avg when customer count is 0', () => {
    render(<SplitCard totalRevenue={48600}
                      drinksRevenue={0} drinksGuests={0} drinksAvg={0}
                      diningRevenue={48600} diningGuests={56} diningAvg={868} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows 0% when totalRevenue is 0', () => {
    render(<SplitCard totalRevenue={0}
                      drinksRevenue={0} drinksGuests={0} drinksAvg={0}
                      diningRevenue={0} diningGuests={0} diningAvg={0} />);
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBe(2);
  });
});
