import { getPrismaModel } from '../../../utils/prismaUtils';
import { getDateTimeTypeContent } from '../generators/create/dateTime';
import { getEmbeddedTypeContent } from '../generators/create/embadedType';
import { getEnumTypeContent } from '../generators/create/enum';
import { getNumberTypeContent } from '../generators/create/number';
import { getStringTypeContent } from '../generators/create/string';

export const updateDtoContent = (modelName: string) => {
  const model = getPrismaModel(modelName);

  let content = '';

  model.fields.forEach((field) => {
    if (
      field.isId ||
      field.name === 'deletedAt' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt'
    )
      return;
    const { type, kind } = field;

    if (kind === 'scalar' && type === 'String') {
      content += getStringTypeContent(modelName, field, true);
    }
    if (kind === 'scalar' && (type === 'Int' || type === 'BigInt')) {
      content += getNumberTypeContent(modelName, field, true);
    }

    if (kind === 'enum') {
      content += getEnumTypeContent(modelName, field, true);
    }

    if (kind === 'object' && !field.relationFromFields) {
      content += getEmbeddedTypeContent(modelName, field, true);
    }

    if (type === 'DateTime') {
      content += getDateTimeTypeContent(modelName, field);
    }
  });

  return content;
};
