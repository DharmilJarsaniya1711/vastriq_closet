import { Prisma } from '@prisma/client';

export const joiValidationField = (
  modelName: string,
  field: Prisma.DMMF.Field,
  schemaType: string
) => {
  const { name, isList } = field;

  let { isRequired, type } = field;

  if (schemaType === 'list') {
    isRequired = false;
  }

  if ((type === 'Int' || type === 'BigInt') && schemaType === 'list') {
    return joiNumberValidation(field);
  }

  type === 'Int' || type === 'BigInt' ? (type = 'number') : (type = type.toLowerCase());

  let content = '';

  if (!isList) {
    const appendedSchema =
      `${name}: JoiImport.${(type = type.toLowerCase())}()${type !== 'number' ? '.trim()' : ''}.max(100)${isRequired ? '.required()' : ''},` +
      '\n';
    content += appendedSchema;
  } else {
    const appendedSchema =
      `${name}: Joi.array().items(JoiImport.${(type = type.toLowerCase())}()${type !== 'number' ? '.trim()' : ''}.max(100)${isRequired ? '.required()' : ''}),` +
      '\n';
    content += appendedSchema;
  }

  return content;
};

export const joiNumberValidation = (field) => {
  const content =
    `${field.name}Gte: JoiImport.number().required(),
  ${field.name}Lte: JoiImport.number().when('${field.name}Gte', {
    is: JoiImport.number().required(),
    then: JoiImport.number().min(JoiImport.ref('${field.name}Gte')).required()
  }),` + '\n';
  return content;
};
