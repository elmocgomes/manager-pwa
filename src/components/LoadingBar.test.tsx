import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingBar } from './LoadingBar';

describe('LoadingBar', () => {
  it('renders an accessible busy progressbar', () => {
    render(<LoadingBar />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar.getAttribute('aria-busy')).toBe('true');
    expect(bar.getAttribute('aria-label')).toMatch(/loading/i);
  });
});
