import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayToggle } from './DayToggle';

describe('DayToggle', () => {
  it('renders Today / Yesterday / 2 days ago', () => {
    render(<DayToggle selected={0} onSelect={() => {}} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });
  it('calls onSelect with the chosen offset', () => {
    const onSelect = vi.fn();
    render(<DayToggle selected={0} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Yesterday'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
  it('marks the selected day as aria-pressed', () => {
    render(<DayToggle selected={1} onSelect={() => {}} />);
    expect(screen.getByText('Yesterday').closest('button')?.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Today').closest('button')?.getAttribute('aria-pressed')).toBe('false');
  });
});
