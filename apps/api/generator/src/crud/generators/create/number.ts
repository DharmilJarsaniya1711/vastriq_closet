import { Prisma } from '@prisma/client';

export const getNumberTypeContent = (
  modelName: string,
  field: Prisma.DMMF.Field,
  isUpdate = false,
) => {
  const { isList, name, isRequired } = field;

  let content = '';

  if (!isList) {
    const swaggerSchema = `@ApiProperty({
        description: '${modelName} ${name}',
        example: 1,
        required: ${isRequired && !isUpdate},
        type: Number,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: number` + '\n';
    content += classProp;
  } else {
    const swaggerSchema = `@ApiProperty({
        description: 'Array of ${modelName} ${name}',
        example: [1, 2],
        required: ${isRequired && !isUpdate},
        type: Array<number>,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired ? '' : '?'}: number[]` + '\n';
    content += classProp;
  }

  return content;
};
