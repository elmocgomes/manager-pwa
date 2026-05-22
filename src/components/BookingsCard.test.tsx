import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookingsCard } from './BookingsCard';

describe('BookingsCard', () => {
  it('renders both numbers and the to-come row when today', () => {
    render(<BookingsCard bookingsServed={32} walkinsServed={15} bookingsToCome={22} isToday={true} />);
    expect(screen.getAllByText('32').length).toBeGreaterThan(0);
    expect(screen.getAllByText('15').length).toBeGreaterThan(0);
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText(/Bookings still to come/i)).toBeInTheDocument();
  });
  it('hides the to-come row when bookingsToCome is 0', () => {
    render(<BookingsCard bookingsServed={30} walkinsServed={20} bookingsToCome={0} isToday={true} />);
    expect(screen.queryByText(/Bookings still to come/i)).toBeNull();
  });
  it('hides the to-come row when not today', () => {
    render(<BookingsCard bookingsServed={30} walkinsServed={20} bookingsToCome={5} isToday={false} />);
    expect(screen.queryByText(/Bookings still to come/i)).toBeNull();
  });
  it('renders an empty bar when both counts are 0', () => {
    const { container } = render(<BookingsCard bookingsServed={0} walkinsServed={0} bookingsToCome={0} isToday={true} />);
    const bars = container.querySelectorAll('[style*="width"]');
    bars.forEach(bar => {
      expect((bar as HTMLElement).style.width).toBe('0%');
    });
  });
});
