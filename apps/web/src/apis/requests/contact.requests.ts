import http from '../http';

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const submitContact = (payload: ContactPayload) =>
  http.post<{ message?: string; data: { submitted: true } }>('/contact', payload);
