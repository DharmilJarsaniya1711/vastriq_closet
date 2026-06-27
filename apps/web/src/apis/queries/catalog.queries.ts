import { useQuery } from '@tanstack/react-query';

import {
  fetchCategories,
  fetchCities,
  fetchColors,
  fetchOccasions,
  fetchOutfit,
  fetchOutfits,
  OutfitQuery,
} from '../requests/catalog.requests';

export const useCategories = () =>
  useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: async () => (await fetchCategories()).data.items,
  });

export const useOccasions = () =>
  useQuery({
    queryKey: ['catalog', 'occasions'],
    queryFn: async () => (await fetchOccasions()).data.items,
  });

export const useCities = () =>
  useQuery({
    queryKey: ['catalog', 'cities'],
    queryFn: async () => (await fetchCities()).data.items,
  });

export const useColors = () =>
  useQuery({
    queryKey: ['catalog', 'colors'],
    queryFn: async () => (await fetchColors()).data.items,
  });

export const useOutfits = (params: OutfitQuery = {}) =>
  useQuery({
    queryKey: ['catalog', 'outfits', params],
    queryFn: async () => (await fetchOutfits(params)).data,
  });

export const useOutfit = (slug: string) =>
  useQuery({
    queryKey: ['catalog', 'outfit', slug],
    queryFn: async () => (await fetchOutfit(slug)).data.outfit,
    enabled: !!slug,
  });
