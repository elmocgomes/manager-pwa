import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDaySummary } from './useDaySummary';
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

describe('useDaySummary', () => {
  beforeEach(() => { maybeSingle.mockReset(); });

  it('returns null when no row exists for the day', async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(
      () => useDaySummary('r1', '2026-05-22', true), { wrapper }
    );
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toBeNull();
  });

  it('returns the row when present', async () => {
    maybeSingle.mockResolvedValue({
      data: { restaurant_id: 'r1', business_date: '2026-05-22', total_revenue: 42000, labor_tone: 'good' },
      error: null,
    });
    const { result } = renderHook(
      () => useDaySummary('r1', '2026-05-22', false), { wrapper }
    );
    await waitFor(() => expect(result.current.data?.total_revenue).toBe(42000));
    expect(result.current.data?.labor_tone).toBe('good');
  });

  it('does not fetch when restaurantId is undefined', () => {
    const { result } = renderHook(
      () => useDaySummary(undefined, '2026-05-22', true), { wrapper }
    );
    expect(result.current.fetchStatus).toBe('idle');
  });
});
