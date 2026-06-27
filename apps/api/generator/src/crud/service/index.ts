import * as path from 'path';
import * as fs from 'node:fs/promises';
import {
  getFolderPathByModelName,
  getTransformedCmlNameByModelName,
  getTransformedNameByModelName,
} from '../../../utils/file';
import { createServiceContent } from './create';
import { getFindOneServiceContent } from './findOne';
import { getDeleteServiceContent } from './delete';
import { findAllServiceContent } from './list';
import { FieldWithSearchableFields } from '../dto/list';
import { getPrismaModel } from '../../../utils/prismaUtils';
import { updateServiceContent } from './update';

export const genService = async (
  modelName: string,
  selectedOptionsForSearch: FieldWithSearchableFields[],
) => {
  const templatePath = path.resolve('generator', 'templates', '_service.txt');
  let templateContent = await fs.readFile(templatePath, 'utf-8');

  const transformedModelName = getTransformedNameByModelName(modelName);
  const transformedCmlModelName = getTransformedCmlNameByModelName(modelName);

  templateContent = templateContent.replace(/<% modelName %>/gi, modelName);
  templateContent = templateContent.replace(/<% modelTransformedName %>/gi, transformedModelName);
  templateContent = templateContent.replace(
    /<% modelTransformedCmlName %>/gi,
    transformedCmlModelName,
  );

  const createContent = createServiceContent(modelName);
  templateContent = templateContent.replace(/<% create %>/gi, createContent);

  const findOneContent = getFindOneServiceContent(modelName);
  templateContent = templateContent.replace(/<% findOne %>/gi, findOneContent);

  const deleteContent = getDeleteServiceContent(modelName);
  templateContent = templateContent.replace(/<% remove %>/gi, deleteContent);

  const findAllContent = findAllServiceContent(modelName, selectedOptionsForSearch);
  templateContent = templateContent.replace(/<% findAll %>/gi, findAllContent);

  const updateContent = updateServiceContent(modelName);
  templateContent = templateContent.replace(/<% update %>/gi, updateContent);

  const pathToFolder = getFolderPathByModelName(modelName);
  const dtoFilePath = path.resolve(pathToFolder, `${transformedModelName}.service.ts`);

  const prismaImports = ['Prisma'];
  const model = getPrismaModel(modelName);

  model.fields.forEach((field) => {
    if (field.kind === 'enum') {
      if (!prismaImports.includes(field.type)) prismaImports.push(field.type);
    }
  });
  templateContent = templateContent.replace(/<% prismaImports %>/gi, prismaImports.join(', '));

  await fs.writeFile(dtoFilePath, templateContent);
};
