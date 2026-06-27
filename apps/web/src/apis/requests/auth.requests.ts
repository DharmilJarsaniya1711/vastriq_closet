import http from '../http';

export interface RequestOtpResponse {
  data: {
    sent: true;
    channel: 'WHATSAPP' | 'SMS' | 'DEV';
    devCode?: string;
  };
  message?: string;
}

export interface VerifyOtpResponse {
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    user: {
      id: string;
      phone?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      roles: string[];
      type: 'ADMIN' | 'USER';
    };
  };
  message?: string;
}

export interface MeResponse {
  data: {
    user: {
      id: string;
      phone?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      type: 'ADMIN' | 'USER';
    };
  };
  message?: string;
}

export const fetchMe = () => http.get<MeResponse>('/auth/me');

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const updateMe = (payload: UpdateProfilePayload) =>
  http.patch<MeResponse>('/auth/me', payload);

export const requestPhoneOtp = (phone: string) =>
  http.post<RequestOtpResponse>('/auth/otp/request', { phone, intent: 'LOGIN' });

export const verifyPhoneOtp = (phone: string, code: string) =>
  http.post<VerifyOtpResponse>('/auth/otp/verify', { phone, code });
