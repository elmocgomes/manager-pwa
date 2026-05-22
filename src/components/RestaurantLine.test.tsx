import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RestaurantLine } from './RestaurantLine';

describe('RestaurantLine', () => {
  it('renders restaurant name and formatted date', () => {
    render(<RestaurantLine name="Maven" date={new Date('2026-05-22T12:00:00')} />);
    expect(screen.getByText('Maven')).toBeInTheDocument();
    // Date should be formatted as "Fri, 22 May" or similar
    expect(screen.getByText(/22 May/)).toBeInTheDocument();
  });
});
