import http from '../http';

export interface ApiBanner {
  id: string;
  title: string;
  imageUrl: string;
  ctaUrl?: string | null;
  order: number;
}

interface Items<T> {
  message?: string;
  data: { items: T[] };
}

export const fetchBanners = () => http.get<Items<ApiBanner>>('/cms/banners');
