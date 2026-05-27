import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useRealtimeInvalidation(restaurantId: string | undefined, enabled: boolean) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled || !restaurantId) return;
    // A sync upserts hundreds of rows at once, firing a burst of change events.
    // Debounce so the burst collapses into a single refetch instead of hundreds.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const invalidate = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => qc.invalidateQueries({ queryKey: ['daySummary', restaurantId] }),
        1500,
      );
    };
    const channel = supabase.channel(`day-${restaurantId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orderlines', filter: `restaurant_id=eq.${restaurantId}` },
        invalidate)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurantId}` },
        invalidate)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `restaurant_id=eq.${restaurantId}` },
        invalidate)
      .subscribe();
    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
  }, [restaurantId, enabled, qc]);
}
