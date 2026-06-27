import { faker } from '@faker-js/faker';

export const generateDefaultFields = () => ({
  id: faker.database.mongodbObjectId(),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  deletedAt: null,
});

export const API_URL = import.meta.env.VITE_API_URL;
