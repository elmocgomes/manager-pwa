import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClosingNoteCard } from './ClosingNoteCard';
import type { ReactNode } from 'react';

const maybeSingle = vi.fn();
const insert = vi.fn();
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: () => maybeSingle() }),
        }),
      }),
      insert: (...args: unknown[]) => insert(...args),
    }),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('ClosingNoteCard', () => {
  beforeEach(() => { maybeSingle.mockReset(); insert.mockReset(); });

  it('renders read-only when a note exists', async () => {
    maybeSingle.mockResolvedValue({
      data: { id: 'n1', restaurant_id: 'r1', business_date: '2026-05-22',
              author_name: 'Mads', body: 'Great night.', submitted_at: '' },
      error: null,
    });
    render(<ClosingNoteCard restaurantId="r1" businessDate="2026-05-22"
              isToday={true} authorId="u1" authorName="Mads" />, { wrapper });
    await waitFor(() => expect(screen.getByText('Great night.')).toBeInTheDocument());
    expect(screen.queryByPlaceholderText('How did tonight go?')).toBeNull();
  });

  it('renders textarea + submit when today and no note', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    render(<ClosingNoteCard restaurantId="r1" businessDate="2026-05-22"
              isToday={true} authorId="u1" authorName="Mads" />, { wrapper });
    await waitFor(() => expect(screen.getByPlaceholderText('How did tonight go?')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Submit closing note/i })).toBeInTheDocument();
  });

  it('renders pending placeholder when not today and no note', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    render(<ClosingNoteCard restaurantId="r1" businessDate="2026-05-20"
              isToday={false} authorId="u1" authorName="Mads" />, { wrapper });
    await waitFor(() => expect(screen.getByText(/No closing note submitted/i)).toBeInTheDocument());
  });

  it('calls supabase.insert on submit', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    insert.mockResolvedValue({ error: null });
    render(<ClosingNoteCard restaurantId="r1" businessDate="2026-05-22"
              isToday={true} authorId="u1" authorName="Mads" />, { wrapper });
    await waitFor(() => screen.getByPlaceholderText('How did tonight go?'));
    fireEvent.change(screen.getByPlaceholderText('How did tonight go?'),
      { target: { value: 'Roligt aften.' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit closing note/i }));
    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      restaurant_id: 'r1', business_date: '2026-05-22',
      author_id: 'u1', author_name: 'Mads', body: 'Roligt aften.',
    }));
  });
});
