import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: profile } = await supabase.from('user_profiles')
        .select('id, full_name').eq('id', userId).single();
      const { data: rests } = await supabase.from('user_restaurants')
        .select('restaurants(id, slug, name)');
      const restaurants = (rests ?? []).map((r: any) => r.restaurants);
      return { ...profile, restaurants };
    },
  });
}
