import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/adminApi';

// Restaurant slug/name options for admin selectors. Cached app-wide so each
// panel doesn't refetch.
export function useRestaurantOptions() {
  return useQuery({
    queryKey: ['admin', 'restaurant-options'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const rows = await adminApi.listRestaurants();
      return rows
        .filter(r => r.active)
        .map(r => ({ slug: r.slug, name: r.name }));
    },
  });
}
