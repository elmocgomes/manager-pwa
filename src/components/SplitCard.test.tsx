import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitCard } from './SplitCard';

describe('SplitCard', () => {
  it('renders drinks + dining numbers', () => {
    render(<SplitCard drinksRevenue={3400} drinksGuests={8} drinksAvg={425}
                      diningRevenue={48600} diningGuests={56} diningAvg={868} />);
    expect(screen.getByText(/3\.400|3,400/)).toBeInTheDocument();
    expect(screen.getByText(/48\.600|48,600/)).toBeInTheDocument();
    expect(screen.getByText('Drinks only')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
  });
  it('renders "—" for avg when guest count is 0', () => {
    render(<SplitCard drinksRevenue={0} drinksGuests={0} drinksAvg={0}
                      diningRevenue={48600} diningGuests={56} diningAvg={868} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
