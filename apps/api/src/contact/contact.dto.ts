import { ContactQueryStatus } from '@prisma/client';
import * as Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().max(20).allow('', null),
  subject: Joi.string().trim().max(160).allow('', null),
  message: Joi.string().trim().min(5).max(4000).required(),
});

export const resolveContactSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ContactQueryStatus))
    .required(),
});

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}

export interface ResolveContactDto {
  status: ContactQueryStatus;
}
