import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRealtimeInvalidation } from './useRealtimeInvalidation';
import type { ReactNode } from 'react';

const subscribe = vi.fn();
const removeChannel = vi.fn((..._args: unknown[]) => undefined);
const channel = vi.fn((..._args: unknown[]) => ({
  on: function () { return this; },
  subscribe: subscribe,
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    channel: (...args: unknown[]) => channel(...args),
    removeChannel: (...args: unknown[]) => removeChannel(...args),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useRealtimeInvalidation', () => {
  beforeEach(() => { subscribe.mockClear(); removeChannel.mockClear(); channel.mockClear(); });

  it('subscribes when enabled and restaurantId is set', () => {
    renderHook(() => useRealtimeInvalidation('r1', true), { wrapper });
    expect(channel).toHaveBeenCalledWith('day-r1');
    expect(subscribe).toHaveBeenCalled();
  });

  it('does not subscribe when disabled', () => {
    renderHook(() => useRealtimeInvalidation('r1', false), { wrapper });
    expect(channel).not.toHaveBeenCalled();
  });

  it('does not subscribe when no restaurantId', () => {
    renderHook(() => useRealtimeInvalidation(undefined, true), { wrapper });
    expect(channel).not.toHaveBeenCalled();
  });

  it('cleans up channel on unmount', () => {
    const { unmount } = renderHook(() => useRealtimeInvalidation('r1', true), { wrapper });
    unmount();
    expect(removeChannel).toHaveBeenCalled();
  });
});
