import http from '../http';

interface One<T> {
  message?: string;
  data: T;
}
interface ItemsResponse<T> {
  message?: string;
  data: { items: T[] };
}

// ---- Reviews ----
export interface ApiReview {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  photoUrls: string[];
  createdAt: string;
  author?: { firstName?: string | null; lastName?: string | null };
}

export interface CreateReviewPayload {
  outfitId: string;
  rating: number;
  title?: string;
  body?: string;
}

export const fetchOutfitReviews = (slug: string) =>
  http.get<ItemsResponse<ApiReview>>(`/reviews/outfit/${slug}`);

export const createReview = (payload: CreateReviewPayload) =>
  http.post<One<{ review: ApiReview }>>('/reviews', payload);

// ---- Wishlist ----
export interface ApiWishlistOutfit {
  id: string;
  slug: string;
  title: string;
  rentPerDay: number;
  securityDeposit: number;
  color?: string | null;
  imageUrls?: string[];
  category?: { slug: string; name: string } | null;
}

export interface ApiWishlistItem {
  id: string;
  createdAt: string;
  outfit: ApiWishlistOutfit;
}

export const fetchWishlist = () => http.get<ItemsResponse<ApiWishlistItem>>('/wishlist');

export const addToWishlist = (outfitId: string) =>
  http.post<One<unknown>>('/wishlist', { outfitId });

export const removeFromWishlist = (outfitId: string) =>
  http.delete<One<unknown>>(`/wishlist/${outfitId}`);

// ---- Reports ----
export type ReportTargetType = 'LISTING' | 'USER' | 'MESSAGE';

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
}

export const fileReport = (payload: CreateReportPayload) =>
  http.post<One<unknown>>('/reports', payload);
