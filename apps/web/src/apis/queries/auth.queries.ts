import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchMe, updateMe, UpdateProfilePayload } from '../requests/auth.requests';

export const useMe = () =>
  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await fetchMe()).data.user,
    retry: false,
  });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
};
