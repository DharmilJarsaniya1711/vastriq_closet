import * as path from 'path';
import * as fs from 'node:fs/promises';
import {
  getFolderPathByModelName,
  getTransformedCmlNameByModelName,
  getTransformedNameByModelName,
} from '../../../utils/file';
import { pluralize } from '../../../utils/pluralize';

export const genController = async (modelName: string) => {
  const templatePath = path.resolve('generator', 'templates', '_controller.txt');
  let templateContent = await fs.readFile(templatePath, 'utf-8');

  const transformedModelName = getTransformedNameByModelName(modelName);
  const transformedCmlModelName = getTransformedCmlNameByModelName(modelName);
  const transformedCmlPluralizedModelName = pluralize(transformedCmlModelName);

  templateContent = templateContent.replace(/<% modelName %>/gi, modelName);
  templateContent = templateContent.replace(/<% modelTransformedName %>/gi, transformedModelName);
  templateContent = templateContent.replace(
    /<% modelTransformedCmlPluralizedName %>/gi,
    transformedCmlPluralizedModelName,
  );
  templateContent = templateContent.replace(
    /<% modelTransformedCmlName %>/gi,
    transformedCmlModelName,
  );

  const pathToFolder = getFolderPathByModelName(modelName);
  const dtoFilePath = path.resolve(pathToFolder, `${transformedModelName}.controller.ts`);

  await fs.writeFile(dtoFilePath, templateContent);
};
