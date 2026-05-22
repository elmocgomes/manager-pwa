import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestaurantToggle } from './RestaurantToggle';

const rests = [
  { id: 'r1', slug: 'maven', name: 'Maven' },
  { id: 'r2', slug: 'cholon', name: 'Cholon' },
];

describe('RestaurantToggle', () => {
  it('renders all restaurants', () => {
    render(<RestaurantToggle restaurants={rests} selected="maven" onSelect={() => {}} />);
    expect(screen.getByText('Maven')).toBeInTheDocument();
    expect(screen.getByText('Cholon')).toBeInTheDocument();
  });
  it('calls onSelect with slug', () => {
    const onSelect = vi.fn();
    render(<RestaurantToggle restaurants={rests} selected="maven" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Cholon'));
    expect(onSelect).toHaveBeenCalledWith('cholon');
  });
  it('returns null when no restaurants', () => {
    const { container } = render(<RestaurantToggle restaurants={[]} selected="" onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
  it('marks the selected button as aria-pressed', () => {
    render(<RestaurantToggle restaurants={rests} selected="maven" onSelect={() => {}} />);
    expect(screen.getByText('Maven').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText('Cholon').getAttribute('aria-pressed')).toBe('false');
  });
});
