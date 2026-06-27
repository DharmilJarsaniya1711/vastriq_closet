import { ReportStatus, ReportTargetType } from '@prisma/client';
import * as Joi from 'joi';

export const createReportSchema = Joi.object({
  targetType: Joi.string()
    .valid(...Object.values(ReportTargetType))
    .required(),
  targetId: Joi.string().trim().required(),
  reason: Joi.string().trim().min(3).max(200).required(),
  details: Joi.string().trim().max(2000).allow('', null),
  evidenceUrls: Joi.array().items(Joi.string().uri()).max(6).default([]),
});

export const resolveReportSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ReportStatus))
    .required(),
  resolution: Joi.string().trim().max(2000).allow('', null),
});

export interface CreateReportDto {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string | null;
  evidenceUrls?: string[];
}

export interface ResolveReportDto {
  status: ReportStatus;
  resolution?: string | null;
}
