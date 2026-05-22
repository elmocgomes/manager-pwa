import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitCard } from './SplitCard';

describe('SplitCard', () => {
  it('renders drinks + food revenue, %, and labels', () => {
    render(<SplitCard totalRevenue={32500}
                      drinksRevenue={10175} drinksGuests={88} drinksAvg={116}
                      diningRevenue={22665} diningGuests={123} diningAvg={184} />);
    expect(screen.getByText(/10\.175|10,175/)).toBeInTheDocument();
    expect(screen.getByText(/22\.665|22,665/)).toBeInTheDocument();
    expect(screen.getByText('Drinks')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    // Percentages of total
    expect(screen.getByText('31%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('renders "—" for avg when item count is 0', () => {
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
