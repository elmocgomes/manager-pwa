import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type ClosingNote = {
  id: string;
  restaurant_id: string;
  business_date: string;
  author_name: string;
  body: string;
  submitted_at: string;
};

export function useClosingNote(restaurantId: string | undefined, businessDate: string | undefined) {
  return useQuery<ClosingNote | null>({
    queryKey: ['closingNote', restaurantId, businessDate],
    enabled: !!restaurantId && !!businessDate,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('closing_notes')
        .select('id, restaurant_id, business_date, author_name, body, submitted_at')
        .eq('restaurant_id', restaurantId!)
        .eq('business_date', businessDate!)
        .maybeSingle();
      if (error) throw error;
      return (data as ClosingNote | null) ?? null;
    },
  });
}
