import { Prisma } from '@prisma/client';

const { models } = Prisma.dmmf.datamodel;

export const modelOptions = () => models.map(({ name }) => name);

export const getPrismaModel = (name) => models.find((m) => m.name === name);
