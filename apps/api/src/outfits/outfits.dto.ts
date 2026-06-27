import * as Joi from 'joi';

export const createOutfitSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  categorySlug: Joi.string().trim().required(),
  occasionSlugs: Joi.array().items(Joi.string().trim()).default([]),
  color: Joi.string().trim().allow('', null),
  imageUrls: Joi.array().items(Joi.string().uri()).min(1).max(10).required(),
  videoUrl: Joi.string().uri().allow('', null),
  mrp: Joi.number().min(0).allow(null),
  rentPerDay: Joi.number().min(0).required(),
  securityDeposit: Joi.number().min(0).default(0),
  citySlugs: Joi.array().items(Joi.string().trim()).min(1).required(),
  availabilityNote: Joi.string().trim().max(500).allow('', null),
});

export const updateOutfitSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120),
  description: Joi.string().trim().max(2000).allow('', null),
  categorySlug: Joi.string().trim(),
  occasionSlugs: Joi.array().items(Joi.string().trim()),
  color: Joi.string().trim().allow('', null),
  imageUrls: Joi.array().items(Joi.string().uri()).min(1).max(10),
  videoUrl: Joi.string().uri().allow('', null),
  mrp: Joi.number().min(0).allow(null),
  rentPerDay: Joi.number().min(0),
  securityDeposit: Joi.number().min(0),
  citySlugs: Joi.array().items(Joi.string().trim()).min(1),
  availabilityNote: Joi.string().trim().max(500).allow('', null),
}).min(1);

export const rejectOutfitSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(500).required(),
});

export interface CreateOutfitDto {
  title: string;
  description?: string | null;
  categorySlug: string;
  occasionSlugs?: string[];
  color?: string | null;
  imageUrls: string[];
  videoUrl?: string | null;
  mrp?: number | null;
  rentPerDay: number;
  securityDeposit?: number;
  citySlugs: string[];
  availabilityNote?: string | null;
}

export type UpdateOutfitDto = Partial<CreateOutfitDto>;
