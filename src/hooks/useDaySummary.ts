import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type DaySummary = {
  restaurant_id: string;
  business_date: string;
  total_revenue: number;
  total_guests: number;
  bookings_guests_served: number;
  walkins_guests_served: number;
  bookings_to_come: number;
  drinks_revenue: number;
  drinks_guests: number;
  drinks_avg: number;
  dining_revenue: number;
  dining_guests: number;
  dining_avg: number;
  labor_dkk: number;
  planned_hours: number;
  labor_pct: number;
  labor_tone: 'good' | 'ok' | 'warn';
  last_synced_at: string | null;
};

export function useDaySummary(
  restaurantId: string | undefined,
  businessDate: string | undefined,
  isToday: boolean,
) {
  return useQuery<DaySummary | null>({
    queryKey: ['daySummary', restaurantId, businessDate],
    enabled: !!restaurantId && !!businessDate,
    staleTime: isToday ? 5_000 : 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manager_day_summary')
        .select('*')
        .eq('restaurant_id', restaurantId!)
        .eq('business_date', businessDate!)
        .maybeSingle();
      if (error) throw error;
      return data as DaySummary | null;
    },
  });
}
