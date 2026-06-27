import { Prisma } from '@prisma/client';

export const getStringTypeContent = (
  modelName: string,
  field: Prisma.DMMF.Field,
  isUpdate = false,
) => {
  const { isList, name, isRequired } = field;

  let content = '';
  if (!isList) {
    const swaggerSchema = `@ApiProperty({
        description: '${modelName} ${name}',
        example: '${
          name.search(/id/i) > -1 ? '63874a5e69b68c4416fc0962' : `${modelName} ${name} 1`
        }',
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
        example: ['638749402112a2071eb7ccdd', '63874a5e69b68c4416fc0962'],
        required: ${isRequired && !isUpdate},
        type: Array<string>,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: string[]` + '\n';
    content += classProp;
  }

  return content;
};
