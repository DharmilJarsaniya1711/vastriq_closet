import { getSingleIdContent } from '../generators/single/id';

export const updateFindByIdDtoContent = (modelName: string) => {
  return getSingleIdContent(modelName);
};
