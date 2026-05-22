import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserStrip } from './UserStrip';

describe('UserStrip', () => {
  it('renders initials and full name', () => {
    render(<UserStrip fullName="Peter Bille" version="v1.0" />);
    expect(screen.getByText('PB')).toBeInTheDocument();
    expect(screen.getByText('Peter Bille')).toBeInTheDocument();
    expect(screen.getByText('v1.0')).toBeInTheDocument();
  });

  it('takes max 2 initials', () => {
    render(<UserStrip fullName="Elmo Carlos Gomes" version="v1.0" />);
    expect(screen.getByText('EC')).toBeInTheDocument();
  });

  it('renders ? for empty name', () => {
    render(<UserStrip fullName="" version="v1.0" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders offline pill when navigator.onLine is false', () => {
    const original = Object.getOwnPropertyDescriptor(window.navigator, 'onLine');
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    render(<UserStrip fullName="Peter Bille" version="v1.0" />);
    expect(screen.getByText('offline')).toBeInTheDocument();
    if (original) Object.defineProperty(window.navigator, 'onLine', original);
  });
});
