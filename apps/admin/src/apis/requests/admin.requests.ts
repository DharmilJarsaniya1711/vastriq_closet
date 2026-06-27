import { ApiResponse } from '@/types';

import http from '../http';

// ---- Dashboard ----
export interface OverviewKpis {
  users: number;
  activeOutfits: number;
  pendingOutfits: number;
  totalEnquiries: number;
  openReports: number;
  newUsers30d: number;
}

export interface Overview {
  kpis: OverviewKpis;
  signupsSeries: { date: string; signups: number }[];
  topCategories: { name: string; count: number }[];
}

export interface AdminUser {
  id: string;
  type: 'ADMIN' | 'USER';
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  banned: boolean;
  createdAt: string;
}

export interface AdminOutfit {
  id: string;
  title: string;
  slug: string;
  status: string;
  description?: string | null;
  color?: string | null;
  occasionSlugs?: string[];
  citySlugs?: string[];
  mrp?: number | null;
  rentPerDay: number;
  securityDeposit: number;
  availabilityNote?: string | null;
  rejectionReason?: string | null;
  imageUrls?: string[];
  category?: { name: string };
  owner?: { firstName?: string; lastName?: string; phone?: string; ownerProfile?: { brandName?: string } | null };
  createdAt: string;
}

export interface PendingReview {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  createdAt: string;
  author?: { firstName?: string | null; lastName?: string | null };
  outfit?: { slug: string; title: string };
}

export interface AdminReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface AdminContactQuery {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: 'NEW' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string | null;
}

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  order?: number;
  icon?: string | null;
  hex?: string | null;
  state?: string | null;
  isActive?: boolean;
  isServiceable?: boolean;
}

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const qs = (params: Record<string, unknown>) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.append(k, String(v));
  });
  return u.toString();
};

// ---- Dashboard / lists ----
export const getOverview = () => http.get<ApiResponse<Overview>>('/admin/stats/overview');

export const listAdminUsers = (params: { banned?: string; q?: string; page?: number } = {}) =>
  http.get<ApiResponse<Paged<AdminUser>>>(`/admin/users?${qs(params)}`);

export const listAdminOutfits = (params: { status?: string; page?: number } = {}) =>
  http.get<ApiResponse<Paged<AdminOutfit>>>(`/admin/outfits?${qs(params)}`);

// ---- Listing moderation ----
export const approveOutfit = (id: string) =>
  http.post<ApiResponse<unknown>>(`/outfits/${id}/approve`, {});
export const rejectOutfit = (id: string, reason: string) =>
  http.post<ApiResponse<unknown>>(`/outfits/${id}/reject`, { reason });

// ---- Reviews moderation ----
export const listPendingReviews = () =>
  http.get<ApiResponse<{ items: PendingReview[] }>>('/reviews/pending');
export const approveReview = (id: string) =>
  http.post<ApiResponse<unknown>>(`/reviews/${id}/approve`, {});
export const hideReview = (id: string) =>
  http.post<ApiResponse<unknown>>(`/reviews/${id}/hide`, {});

// ---- Reports queue ----
export const listReports = (status?: string) =>
  http.get<ApiResponse<{ items: AdminReport[] }>>(`/reports?${qs({ status })}`);
export const resolveReport = (id: string, body: { status: string; resolution?: string }) =>
  http.patch<ApiResponse<unknown>>(`/reports/${id}`, body);

// ---- Contact queries ----
export const listContactQueries = (status?: string) =>
  http.get<ApiResponse<{ items: AdminContactQuery[] }>>(`/contact?${qs({ status })}`);
export const resolveContactQuery = (id: string, body: { status: string }) =>
  http.patch<ApiResponse<unknown>>(`/contact/${id}`, body);

// ---- Catalog master ----
export type CatalogType = 'categories' | 'colors' | 'occasions' | 'cities';

export const listCatalog = (type: CatalogType) =>
  http.get<ApiResponse<{ items: CatalogItem[] }>>(`/admin/catalog/${type}`);
export const createCatalog = (type: CatalogType, body: Record<string, unknown>) =>
  http.post<ApiResponse<{ item: CatalogItem }>>(`/admin/catalog/${type}`, body);
export const updateCatalog = (type: CatalogType, id: string, body: Record<string, unknown>) =>
  http.patch<ApiResponse<{ item: CatalogItem }>>(`/admin/catalog/${type}/${id}`, body);

// ---- CMS / Banners ----
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  ctaUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const listBanners = () =>
  http.get<ApiResponse<{ items: Banner[] }>>('/admin/cms/banners');
export const createBanner = (body: Record<string, unknown>) =>
  http.post<ApiResponse<{ banner: Banner }>>('/admin/cms/banners', body);
export const updateBanner = (id: string, body: Record<string, unknown>) =>
  http.patch<ApiResponse<{ banner: Banner }>>(`/admin/cms/banners/${id}`, body);
export const deleteBanner = (id: string) =>
  http.delete<ApiResponse<unknown>>(`/admin/cms/banners/${id}`);

// ---- Settings ----
export interface PlatformSettings {
  autoApproveListings: boolean;
  featuredCitySlug?: string | null;
  otpMessageTemplate?: string | null;
  supportEmail?: string | null;
}

export const getSettings = () =>
  http.get<ApiResponse<{ settings: PlatformSettings }>>('/admin/settings');
export const updateSettings = (body: Partial<PlatformSettings>) =>
  http.patch<ApiResponse<{ settings: PlatformSettings }>>('/admin/settings', body);

// Server-side image upload (works with API LOCAL/IMAGEKIT driver) → returns a public URL.
export const uploadAdminImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('files', file);
  const res = await http.post<ApiResponse<Array<{ fileKey?: string; url?: string | null }>>>(
    '/files/upload',
    form,
    { hasFiles: true }
  );
  const rec = res.data[0];
  return rec.url || `${import.meta.env.VITE_API_URL}/files/${rec.fileKey}`;
};
