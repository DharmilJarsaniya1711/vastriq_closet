import * as Joi from 'joi';

export const updateSettingsSchema = Joi.object({
  autoApproveListings: Joi.boolean(),
  featuredCitySlug: Joi.string().trim().allow('', null),
  otpMessageTemplate: Joi.string().trim().max(500).allow('', null),
  supportEmail: Joi.string().email().allow('', null),
}).min(1);

export interface UpdateSettingsDto {
  autoApproveListings?: boolean;
  featuredCitySlug?: string | null;
  otpMessageTemplate?: string | null;
  supportEmail?: string | null;
}
