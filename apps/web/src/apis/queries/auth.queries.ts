import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

import { ACCESS_TOKEN } from '@/utils/constants';

import { fetchMe, updateMe, UpdateProfilePayload } from '../requests/auth.requests';

export const useMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await fetchMe()).data.user,
    retry: false,
    // Only ask the API who we are when an auth token actually exists.
    // Logged-out visitors have no cookie, so skip the (guaranteed 401) call.
    enabled: !!getCookie(ACCESS_TOKEN),
  });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
};
