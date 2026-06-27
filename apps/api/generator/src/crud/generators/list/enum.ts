import { Prisma } from '@prisma/client';

export const getEnumTypeContent = (modelName: string, field: Prisma.DMMF.Field) => {
  const { name, type } = field;
  const fTypeEnum = Prisma.dmmf.datamodel.enums.find((e) => e.name === type);

  let content = '';

  const swaggerSchema = `@ApiProperty({
    description: 'Filter by ${modelName} ${name}',
    example: '${fTypeEnum.values.map((v) => v.name).join(',')}',
    required: false,
    type: String,
  })
  `;
  content += swaggerSchema;

  const classProp = `${name}?: string` + '\n';
  content += classProp;

  return content;
};
