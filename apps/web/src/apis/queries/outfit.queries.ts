import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveOutfit,
  createOutfit,
  CreateOutfitPayload,
  fetchMyOutfit,
  fetchMyOutfits,
  updateOutfit,
} from '../requests/outfit.requests';

export const useMyOutfits = () =>
  useQuery({
    queryKey: ['outfits', 'mine'],
    queryFn: async () => (await fetchMyOutfits()).data.items,
  });

export const useMyOutfit = (id: string) =>
  useQuery({
    queryKey: ['outfits', 'one', id],
    queryFn: async () => (await fetchMyOutfit(id)).data.outfit,
    enabled: !!id,
  });

export const useUpdateOutfit = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateOutfitPayload>) => updateOutfit(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outfits', 'mine'] });
      qc.invalidateQueries({ queryKey: ['outfits', 'one', id] });
    },
  });
};

export const useCreateOutfit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOutfitPayload) => createOutfit(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits', 'mine'] }),
  });
};

export const useArchiveOutfit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveOutfit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits', 'mine'] }),
  });
};
