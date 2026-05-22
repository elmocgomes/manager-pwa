import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IncomingNoteCard } from './IncomingNoteCard';
import type { ReactNode } from 'react';

const maybeSingle = vi.fn();
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: () => maybeSingle() }),
        }),
      }),
    }),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('IncomingNoteCard', () => {
  beforeEach(() => maybeSingle.mockReset());

  it('renders the note body and author when present', async () => {
    maybeSingle.mockResolvedValue({
      data: { id: 'n1', restaurant_id: 'r1', business_date: '2026-05-21',
              author_name: 'Mads', body: 'Husk nye glas i lageret.', submitted_at: '2026-05-22T01:00:00Z' },
      error: null,
    });
    render(<IncomingNoteCard restaurantId="r1" businessDate="2026-05-22" />, { wrapper });
    await waitFor(() => expect(screen.getByText(/Husk nye glas/)).toBeInTheDocument());
    expect(screen.getByText('— Mads')).toBeInTheDocument();
  });

  it('shows empty state when no note exists', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    render(<IncomingNoteCard restaurantId="r1" businessDate="2026-05-22" />, { wrapper });
    await waitFor(() => expect(screen.getByText('No earlier note available')).toBeInTheDocument());
  });
});
