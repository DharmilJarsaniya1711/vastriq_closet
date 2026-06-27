import { Prisma } from '@prisma/client';

export const getDateTimeTypeContent = (
  modelName: string,
  field: Prisma.DMMF.Field,
  isUpdate = false,
) => {
  if (field.name === 'deletedAt' || field.name === 'createdAt' || field.name === 'updatedAt')
    return '';

  const { isList, name, isRequired } = field;

  let content = '';

  if (!isList) {
    const swaggerSchema = `@ApiProperty({
        description: '${modelName} ${name}',
        example: '2022-01-15',
        required: ${isRequired && !isUpdate},
        type: String,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: string` + '\n';
    content += classProp;
  } else {
    const swaggerSchema = `@ApiProperty({
        description: 'Array of ${modelName} ${name}',
        example: ['2022-01-15'],
        required: ${isRequired && !isUpdate},
        type: String,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: string[]` + '\n';
    content += classProp;
  }
  return content;
};
