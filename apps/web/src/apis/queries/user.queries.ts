import { useQuery } from '@tanstack/react-query';

import { getUser, getUsers } from '../requests/user.requests';

export const useUsers = () =>
  useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await getUsers();
      return res.data.users;
    },
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await getUser(id);
      return res.data.user;
    },
    enabled: !!id,
  });
