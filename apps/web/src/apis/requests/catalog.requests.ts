import http from '../http';

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  order: number;
}

export interface ApiOccasion {
  id: string;
  slug: string;
  name: string;
}

export interface ApiCity {
  id: string;
  slug: string;
  name: string;
  state?: string;
}

export interface ApiColor {
  id: string;
  slug: string;
  name: string;
  hex?: string;
}

export interface ApiOutfit {
  id: string;
  slug: string;
  title: string;
  description?: string;
  color?: string;
  fabric?: string;
  sizes: string[];
  occasionSlugs: string[];
  mrp: number;
  rentPerDay: number;
  securityDeposit: number;
  minRentalDays: number;
  maxRentalDays: number;
  imageUrls: string[];
  avgRating?: number;
  totalReviews?: number;
  availabilityNote?: string | null;
  category?: { slug: string; name: string };
  owner?: {
    id: string;
    firstName?: string;
    ownerProfile?: { brandName?: string } | null;
  };
}

interface Listing<T> {
  message?: string;
  data: { items: T[]; page: number; limit: number; total: number; totalPages: number };
}

interface One<T> {
  message?: string;
  data: T;
}

const qs = (params: Record<string, unknown>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.append(k, String(v));
  });
  return u.toString();
};

export const fetchCategories = () => http.get<Listing<ApiCategory>>('/catalog/categories');
export const fetchOccasions = () => http.get<Listing<ApiOccasion>>('/catalog/occasions');
export const fetchCities = () => http.get<Listing<ApiCity>>('/catalog/cities');
export const fetchColors = () => http.get<Listing<ApiColor>>('/catalog/colors');

export interface OutfitQuery {
  category?: string;
  occasion?: string;
  city?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  page?: number;
  limit?: number;
}

export const fetchOutfits = (params: OutfitQuery = {}) =>
  http.get<Listing<ApiOutfit>>(`/catalog/outfits?${qs(params as Record<string, unknown>)}`);

export const fetchOutfit = (slug: string) =>
  http.get<One<{ outfit: ApiOutfit }>>(`/catalog/outfits/${slug}`);
