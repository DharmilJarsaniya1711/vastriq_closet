import { useMutation, useQuery } from '@tanstack/react-query';

import { ILoginRequest } from '@/types/entities/auth.types';
import onApiError from '@/utils/error';

import { getUser, login } from '../requests/auth.requests';

export const useLogin = () =>
  useMutation({
    mutationFn: async (payload: ILoginRequest) => {
      const res = await login(payload);
      return res.data;
    },
    onError: onApiError,
  });

export const useCurrentUser = () =>
  useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await getUser();
      return res.data;
    },
  });
