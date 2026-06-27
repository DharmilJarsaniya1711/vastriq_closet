import { getPrismaModel } from '../../../utils/prismaUtils';
import { createDtoContent } from './create';
import { deleteDtoContent } from './delete';
import { getSingleDtoContent } from './getSingle';
import { listDtoContent } from './list';
import { updateDtoContent } from './update';
import * as path from 'path';
import * as fs from 'node:fs/promises';
import { updateFindByIdDtoContent } from './updateFindById';
import { getFolderPathByModelName, getTransformedNameByModelName } from '../../../utils/file';
import * as inquirer from 'inquirer';
import { Prisma } from '@prisma/client';
import { subClassDtoContent } from './subclass';
import { joiSchemaContent } from './joiSchema';

export const genDto = async (modelName: string) => {
  const createContent = createDtoContent(modelName);

  const model = getPrismaModel(modelName);
  const searchFieldOptions = getSearchFieldOptions(model);
  const SCHEMA_ENUM = {
    list: 'list',
    create: 'create',
    updateFindById: 'updateFindById',
    update: 'update',
  };

  const mSearchFields = [];
  if (searchFieldOptions) {
    const { options } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'options',
        message: 'Select searchable fields',
        choices: searchFieldOptions,
      },
    ]);

    const searchFields = model.fields.filter((f) => options.includes(f.name));
    for (const fieldToSearch of searchFields) {
      if (fieldToSearch.relationName) {
        const { searchableFelids } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'searchableFelids',
            message: `Select searchable fields in ${fieldToSearch.name}`,
            choices: getPrismaModel(fieldToSearch.type)
              .fields.filter((f) => f.name.search(/id/i) === -1 && !f.isList && !f.relationName)
              .map((f) => f.name),
          },
        ]);
        if (searchableFelids.length) {
          fieldToSearch.searchableFelids = searchableFelids;
          mSearchFields.push(fieldToSearch);
        }
      } else {
        mSearchFields.push(fieldToSearch);
      }
    }
  }

  const listContent = await listDtoContent(modelName, mSearchFields);
  const getSingleContent = getSingleDtoContent(modelName);
  const updateFindByIdContent = updateFindByIdDtoContent(modelName);
  const updateContent = updateDtoContent(modelName);
  const deleteContent = deleteDtoContent(modelName);
  const subClassContent = subClassDtoContent(modelName);
  const listSchemaContent = await joiSchemaContent(modelName, SCHEMA_ENUM.list, mSearchFields);
  const createSchemaContent = await joiSchemaContent(modelName, SCHEMA_ENUM.create);
  const updateFindByIdSchemaContent = await joiSchemaContent(modelName, SCHEMA_ENUM.updateFindById);
  const updateSchemaContent = await joiSchemaContent(modelName, SCHEMA_ENUM.update);

  const templatePath = path.resolve('generator', 'templates', '_dto.txt');
  let templateContent = await fs.readFile(templatePath, 'utf-8');

  const prismaImports = ['Prisma'];

  Prisma.dmmf.datamodel.enums.forEach((field) => {
    prismaImports.push(field.name);
  });

  Prisma.dmmf.datamodel.types.forEach((field) => {
    prismaImports.push(field.name);
  });

  templateContent = templateContent.replace(/<% prismaImports %>/gi, prismaImports.join(', '));
  templateContent = templateContent.replace(/<% modelName %>/gi, modelName);
  templateContent = templateContent.replace(/<% CreateClassBody %>/gi, createContent);
  templateContent = templateContent.replace(/<% ListSchema %>/gi, listSchemaContent);
  templateContent = templateContent.replace(/<% ListClassBody %>/gi, listContent);
  templateContent = templateContent.replace(/<% GetSingleClassBody %>/gi, getSingleContent);
  templateContent = templateContent.replace(
    /<% UpdateFindByIdClassBody %>/gi,
    updateFindByIdContent
  );
  templateContent = templateContent.replace(/<% UpdateClassBody %>/gi, updateContent);
  templateContent = templateContent.replace(/<% DeleteClassBody %>/gi, deleteContent);
  templateContent = templateContent.replace(/<% Subclasses %>/gi, subClassContent);
  templateContent = templateContent.replace(/<% CreateClassSchema %>/gi, createSchemaContent);
  templateContent = templateContent.replace(
    /<% UpdateFindByIdClassSchema %>/gi,
    updateFindByIdSchemaContent
  );
  templateContent = templateContent.replace(/<% UpdateClassSchema %>/gi, updateSchemaContent);

  const pathToFolder = getFolderPathByModelName(modelName);
  const transformedModelName = getTransformedNameByModelName(modelName);
  const dtoFilePath = path.resolve(pathToFolder, `${transformedModelName}.dto.ts`);

  await fs.writeFile(dtoFilePath, templateContent);

  return mSearchFields;
};

const getSearchFieldOptions = (model: Prisma.DMMF.Model) => {
  const options = [];

  model.fields.forEach((field) => {
    const isId = field.name.search(/id/i) > -1;

    if ((!isId && !field.isList) || field.relationName) {
      options.push(field.name);
    }
  });

  return options;
};
