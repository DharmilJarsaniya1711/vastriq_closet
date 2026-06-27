import { useQuery } from '@tanstack/react-query';

import { fetchBanners } from '../requests/cms.requests';

export const useBanners = () =>
  useQuery({
    queryKey: ['cms', 'banners'],
    queryFn: async () => (await fetchBanners()).data.items,
  });
