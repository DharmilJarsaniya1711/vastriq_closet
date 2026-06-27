import { getSingleIdContent } from '../generators/single/id';

export const deleteDtoContent = (modelName: string) => {
  return getSingleIdContent(modelName);
};
