import * as Joi from 'joi';

export interface RequestOtpDto {
  phone: string;
  intent?: 'LOGIN' | 'SIGNUP';
}

export interface VerifyOtpDto {
  phone: string;
  code: string;
}

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

export const requestOtpSchema = Joi.object<RequestOtpDto>({
  phone: Joi.string().pattern(phoneRegex).required(),
  intent: Joi.string().valid('LOGIN', 'SIGNUP').optional(),
});

export const verifyOtpSchema = Joi.object<VerifyOtpDto>({
  phone: Joi.string().pattern(phoneRegex).required(),
  code: Joi.string().length(6).pattern(/^\d{6}$/).required(),
});
