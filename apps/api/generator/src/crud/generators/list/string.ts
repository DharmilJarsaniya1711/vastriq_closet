import { Prisma } from '@prisma/client';

export const getStringTypeContent = (modelName: string, field: Prisma.DMMF.Field) => {
  const { name } = field;

  const isId = name.search(/id/i) > -1;
  if (!isId) return;

  let content = '';

  const swaggerSchema = `@ApiProperty({
        description: 'Filter by ${modelName} ${name} ${isId ? '(s)' : ''}',
        example: '638749402112a2071eb7ccdd,63874a5e69b68c4416fc0962',
        required: false,
        type: String,
    })
    `;
  content += swaggerSchema;

  const classProp = `${name}?: string` + '\n';
  content += classProp;

  return content;
};
