import * as Joi from 'joi';

export const createReviewSchema = Joi.object({
  outfitId: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().trim().max(120).allow('', null),
  body: Joi.string().trim().max(2000).allow('', null),
  photoUrls: Joi.array().items(Joi.string().uri()).max(6).default([]),
});

export interface CreateReviewDto {
  outfitId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  photoUrls?: string[];
}
