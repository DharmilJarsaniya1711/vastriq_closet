import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addToWishlist,
  createReview,
  CreateReviewPayload,
  fetchOutfitReviews,
  fetchWishlist,
  fileReport,
  removeFromWishlist,
} from '../requests/social.requests';

export const useOutfitReviews = (slug: string) =>
  useQuery({
    queryKey: ['reviews', slug],
    queryFn: async () => (await fetchOutfitReviews(slug)).data.items,
    enabled: !!slug,
  });

export const useCreateReview = (slug: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', slug] }),
  });
};

export const useWishlist = (enabled = true) =>
  useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => (await fetchWishlist()).data.items,
    enabled,
  });

export const useAddToWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (outfitId: string) => addToWishlist(outfitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};

export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (outfitId: string) => removeFromWishlist(outfitId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist'] }),
  });
};

export const useFileReport = () =>
  useMutation({ mutationFn: fileReport });
