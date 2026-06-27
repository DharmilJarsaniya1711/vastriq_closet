import * as Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  icon: Joi.string().trim().max(120).allow('', null),
  order: Joi.number().integer().min(0).default(0),
  parentId: Joi.string().trim().allow(null),
});
export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(80),
  icon: Joi.string().trim().max(120).allow('', null),
  order: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

export const createColorSchema = Joi.object({
  name: Joi.string().trim().min(1).max(60).required(),
  hex: Joi.string()
    .trim()
    .pattern(/^#?[0-9a-fA-F]{3,8}$/)
    .allow('', null),
  order: Joi.number().integer().min(0).default(0),
});
export const updateColorSchema = Joi.object({
  name: Joi.string().trim().min(1).max(60),
  hex: Joi.string()
    .trim()
    .pattern(/^#?[0-9a-fA-F]{3,8}$/)
    .allow('', null),
  order: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

export const createOccasionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  order: Joi.number().integer().min(0).default(0),
});
export const updateOccasionSchema = Joi.object({
  name: Joi.string().trim().min(1).max(80),
  order: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1);

export const createCitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(80).required(),
  state: Joi.string().trim().max(80).allow('', null),
});
export const updateCitySchema = Joi.object({
  name: Joi.string().trim().min(1).max(80),
  state: Joi.string().trim().max(80).allow('', null),
  isServiceable: Joi.boolean(),
}).min(1);
