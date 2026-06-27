import { ApiResponse, IUser } from '@/types';

import http from '../http';

export const getUsers = async () => http.get<ApiResponse<{ users: Array<IUser> }>>('/user');

export const getUser = async (id: string) => http.get<ApiResponse<{ user: IUser }>>(`/user/${id}`);
