import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useRealtimeInvalidation(restaurantId: string | undefined, enabled: boolean) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled || !restaurantId) return;
    const invalidate = () =>
      qc.invalidateQueries({ queryKey: ['daySummary', restaurantId] });
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
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, enabled, qc]);
}
