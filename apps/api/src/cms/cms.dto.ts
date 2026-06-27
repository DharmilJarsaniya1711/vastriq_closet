import * as Joi from 'joi';

export const createBannerSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160).required(),
  imageUrl: Joi.string().uri().required(),
  ctaUrl: Joi.string().uri().allow('', null),
  position: Joi.string().trim().max(40).allow('', null),
  order: Joi.number().integer().min(0).default(0),
  startsAt: Joi.date().allow(null),
  endsAt: Joi.date().allow(null),
});

export const updateBannerSchema = Joi.object({
  title: Joi.string().trim().min(1).max(160),
  imageUrl: Joi.string().uri(),
  ctaUrl: Joi.string().uri().allow('', null),
  position: Joi.string().trim().max(40).allow('', null),
  order: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  startsAt: Joi.date().allow(null),
  endsAt: Joi.date().allow(null),
}).min(1);

export interface CreateBannerDto {
  title: string;
  imageUrl: string;
  ctaUrl?: string | null;
  position?: string | null;
  order?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {
  isActive?: boolean;
}
