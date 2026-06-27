import { ApiResponse, ITokens, IUser } from '@/types';

import { ILoginRequest } from '../../types/entities/auth.types';
import http from '../http';

export const login = async (payload: ILoginRequest) =>
  http.post<ApiResponse<{ user: IUser; tokens: ITokens }>>('/auth/login/email', payload);

export const getUser = async () => http.get<ApiResponse<{ user: IUser }>>('/auth/me');
