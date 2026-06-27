import { getPrismaModel } from '../../../utils/prismaUtils';
import { joiValidationField } from '../generators/list/joiValidationField';
import { FieldWithSearchableFields } from './list';

export const joiSchemaContent = async (
  modelName: string,
  schemaType: string,
  selectedOptionsForSearch: FieldWithSearchableFields[] = []
) => {
  const model = getPrismaModel(modelName);
  let content = '';
  const types = ['String', 'Int', 'Number', 'Boolean', 'BigInt'];

  if (selectedOptionsForSearch.length && schemaType === 'list')
    content += `search: JoiImport.string().trim().max(100),` + '\n';

  model.fields.forEach((field) => {
    if (field.type === 'String' && schemaType === 'list') {
      const isId = field.name.search(/id/i) > -1;
      if (!isId) return;
    }
    if (
      field.type === 'DateTime' ||
      (field.name === 'id' && schemaType !== 'list') ||
      !types.includes(field.type)
    ) {
      return;
    }

    content += joiValidationField(modelName, field, schemaType);
  });
  return content;
};
