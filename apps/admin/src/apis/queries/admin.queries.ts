import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  approveOutfit,
  approveReview,
  CatalogType,
  createBanner,
  createCatalog,
  deleteBanner,
  getOverview,
  getSettings,
  hideReview,
  listAdminOutfits,
  listAdminUsers,
  listBanners,
  listCatalog,
  listContactQueries,
  listPendingReviews,
  listReports,
  PlatformSettings,
  rejectOutfit,
  resolveContactQuery,
  resolveReport,
  updateBanner,
  updateCatalog,
  updateSettings,
} from '../requests/admin.requests';

export const useOverview = () =>
  useQuery({ queryKey: ['admin', 'overview'], queryFn: async () => (await getOverview()).data });

export const useAdminUsers = (params: { banned?: string; q?: string; page?: number } = {}) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => (await listAdminUsers(params)).data,
  });

export const useAdminOutfits = (params: { status?: string; page?: number } = {}) =>
  useQuery({
    queryKey: ['admin', 'outfits', params],
    queryFn: async () => (await listAdminOutfits(params)).data,
  });

// ---- Listing moderation ----
export const useModerateOutfit = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'outfits'] });
    qc.invalidateQueries({ queryKey: ['admin', 'overview'] });
  };
  return {
    approve: useMutation({ mutationFn: (id: string) => approveOutfit(id), onSuccess: invalidate }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectOutfit(id, reason),
      onSuccess: invalidate,
    }),
  };
};

// ---- Reviews moderation ----
export const usePendingReviews = () =>
  useQuery({
    queryKey: ['admin', 'reviews', 'pending'],
    queryFn: async () => (await listPendingReviews()).data.items,
  });

export const useModerateReview = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'reviews', 'pending'] });
  return {
    approve: useMutation({ mutationFn: (id: string) => approveReview(id), onSuccess: invalidate }),
    hide: useMutation({ mutationFn: (id: string) => hideReview(id), onSuccess: invalidate }),
  };
};

// ---- Reports ----
export const useReports = (status?: string) =>
  useQuery({
    queryKey: ['admin', 'reports', status],
    queryFn: async () => (await listReports(status)).data.items,
  });

export const useResolveReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolution }: { id: string; status: string; resolution?: string }) =>
      resolveReport(id, { status, resolution }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
};

// ---- Contact queries ----
export const useContactQueries = (status?: string) =>
  useQuery({
    queryKey: ['admin', 'contact', status],
    queryFn: async () => (await listContactQueries(status)).data.items,
  });

export const useResolveContactQuery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      resolveContactQuery(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'contact'] }),
  });
};

// ---- Catalog master ----
export const useCatalog = (type: CatalogType) =>
  useQuery({
    queryKey: ['admin', 'catalog', type],
    queryFn: async () => (await listCatalog(type)).data.items,
  });

// ---- Settings ----
export const useSettings = () =>
  useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => (await getSettings()).data.settings,
  });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<PlatformSettings>) => updateSettings(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
};

// ---- CMS / Banners ----
export const useBanners = () =>
  useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async () => (await listBanners()).data.items,
  });

export const useBannerMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'banners'] });
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => createBanner(body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        updateBanner(id, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => deleteBanner(id), onSuccess: invalidate }),
  };
};

export const useCatalogMutations = (type: CatalogType) => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'catalog', type] });
  return {
    create: useMutation({
      mutationFn: (body: Record<string, unknown>) => createCatalog(type, body),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
        updateCatalog(type, id, body),
      onSuccess: invalidate,
    }),
  };
};
