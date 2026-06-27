import * as path from 'path';

export const getFolderPathByModelName = (modelName: string) => {
  const transformedModelName = getTransformedNameByModelName(modelName);

  const pathToFolder = path.resolve('src', transformedModelName);

  return pathToFolder;
};

export const getTransformedNameByModelName = (modelName: string) => {
  const transformedModelName = modelName
    .match(/[A-Z][a-z]+/g)
    .map((w) => w.toLocaleLowerCase())
    .join('-');

  return transformedModelName;
};

export const getTransformedCmlNameByModelName = (modelName: string) => {
  const transformedModelName = modelName
    .match(/[A-Z][a-z]+/g)
    .map((w, i) => (i === 0 ? w.toLocaleLowerCase() : w))
    .join('');

  return transformedModelName;
};
