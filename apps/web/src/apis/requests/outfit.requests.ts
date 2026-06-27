import http from '../http';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type OutfitStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';

export interface MyOutfit {
  id: string;
  slug: string;
  title: string;
  status: OutfitStatus;
  rejectionReason?: string | null;
  color?: string | null;
  imageUrls: string[];
  rentPerDay: number;
  securityDeposit: number;
  viewsCount: number;
  enquiriesCount: number;
  category?: { slug: string; name: string };
}

export interface CreateOutfitPayload {
  title: string;
  description?: string;
  categorySlug: string;
  occasionSlugs: string[];
  color?: string;
  imageUrls: string[];
  videoUrl?: string;
  mrp?: number;
  rentPerDay: number;
  securityDeposit?: number;
  citySlugs: string[];
  availabilityNote?: string;
}

interface One<T> {
  message?: string;
  data: T;
}
interface ItemsResponse<T> {
  message?: string;
  data: { items: T[] };
}

// Server-side upload (works with the API's LOCAL or IMAGEKIT driver) → returns public URLs.
interface UploadRecord {
  fileKey?: string;
  url?: string | null;
}
interface UploadResponse {
  message?: string;
  data: UploadRecord[];
}
export const uploadImages = async (files: File[]): Promise<string[]> => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  const res = await http.post<UploadResponse>('/files/upload', form, { hasFiles: true });
  return res.data.map((r) => r.url || `${API_URL}/files/${r.fileKey}`);
};

export interface FullOutfit {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  color?: string | null;
  occasionSlugs: string[];
  imageUrls: string[];
  mrp?: number | null;
  rentPerDay: number;
  securityDeposit: number;
  citySlugs: string[];
  availabilityNote?: string | null;
  status: OutfitStatus;
  category?: { slug: string; name: string };
}

export const createOutfit = (payload: CreateOutfitPayload) =>
  http.post<One<{ outfit: MyOutfit }>>('/outfits', payload);

export const fetchMyOutfits = () => http.get<ItemsResponse<MyOutfit>>('/outfits/mine');

export const fetchMyOutfit = (id: string) =>
  http.get<One<{ outfit: FullOutfit }>>(`/outfits/${id}`);

export const updateOutfit = (id: string, payload: Partial<CreateOutfitPayload>) =>
  http.patch<One<{ outfit: MyOutfit }>>(`/outfits/${id}`, payload);

export const archiveOutfit = (id: string) =>
  http.delete<One<{ outfit: MyOutfit }>>(`/outfits/${id}`);
