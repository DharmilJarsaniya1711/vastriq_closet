import { Prisma } from '@prisma/client';

export const getNumberTypeContent = (modelName: string, field: Prisma.DMMF.Field) => {
  const { name, isList } = field;

  let content = '';

  if (isList) return;

  const args = ['Gte', 'Lte'];
  args.forEach((arg) => {
    const swaggerSchema = `@ApiProperty({
          description: 'Filter by ${modelName} ${name} ${arg}',
          example: '${arg === 'Gte' ? '10' : '50'}',
          required: false,
          type: Number,
      })
      `;
    content += swaggerSchema;

    const classProp = `${name}${arg}?: ${arg === 'In' ? 'string' : 'number'}` + '\n';
    content += classProp;
  });

  return content;
};
