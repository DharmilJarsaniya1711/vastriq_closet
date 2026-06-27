import { getPrismaModel } from '../../../utils/prismaUtils';
import { getEnumTypeContent } from '../generators/list/enum';
import { getNumberTypeContent } from '../generators/list/number';
import { getStringTypeContent } from '../generators/list/string';
import { getSearchContent } from '../generators/list/search';
import { Prisma } from '@prisma/client';

export type FieldWithSearchableFields = Prisma.DMMF.Field & {
  searchableFelids: string[];
};

export const listDtoContent = async (
  modelName: string,
  selectedOptionsForSearch: FieldWithSearchableFields[],
) => {
  const model = getPrismaModel(modelName);

  let content = '';

  if (selectedOptionsForSearch.length)
    content += getSearchContent(modelName, selectedOptionsForSearch);

  model.fields.forEach((field) => {
    const { type, kind } = field;

    if (kind === 'scalar' && type === 'String') {
      const mContent = getStringTypeContent(modelName, field);
      if (mContent) content += mContent;
    }
    if (kind === 'scalar' && (type === 'Int' || type === 'BigInt')) {
      const mContent = getNumberTypeContent(modelName, field);
      if (mContent) content += mContent;
    }

    if (kind === 'enum') {
      const mContent = getEnumTypeContent(modelName, field);
      if (mContent) content += mContent;
    }
  });

  return content;
};
