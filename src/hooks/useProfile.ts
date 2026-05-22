import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type Restaurant = { id: string; slug: string; name: string };
export type Profile = { id: string; full_name: string; restaurants: Restaurant[] };

export function useProfile(userId: string | undefined) {
  return useQuery<Profile>({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: profile, error: pErr } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('id', userId!)
        .maybeSingle();
      if (pErr) throw pErr;
      if (!profile) throw new Error('No profile row for this user');

      const { data: rests, error: rErr } = await supabase
        .from('user_restaurants')
        .select('restaurants(id, slug, name)')
        .eq('user_id', userId!);
      if (rErr) throw rErr;

      const restaurants: Restaurant[] = ((rests ?? []) as Array<{ restaurants: Restaurant | Restaurant[] | null }>)
        .flatMap(row => {
          if (!row.restaurants) return [];
          return Array.isArray(row.restaurants) ? row.restaurants : [row.restaurants];
        });

      return { id: profile.id, full_name: profile.full_name, restaurants };
    },
  });
}
