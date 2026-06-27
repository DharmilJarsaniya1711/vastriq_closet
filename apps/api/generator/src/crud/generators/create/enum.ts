import { Prisma } from '@prisma/client';

export const getEnumTypeContent = (
  modelName: string,
  field: Prisma.DMMF.Field,
  isUpdate = false,
) => {
  const { isList, name, isRequired, type } = field;

  let content = '';

  const fTypeEnum = Prisma.dmmf.datamodel.enums.find((e) => e.name === type);

  if (!isList) {
    const swaggerSchema = `@ApiProperty({
        description: '${modelName} ${name}',
        example: '${fTypeEnum.values[0].name}',
        required: ${isRequired && !isUpdate},
        enum: ${type},
        type: String,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: ${type}` + '\n';
    content += classProp;
  } else {
    const swaggerSchema = `@ApiProperty({
        description: 'Array of ${modelName} ${name}',
        example: [${fTypeEnum.values.map((v) => `'${v.name}'`).join(', ')}],
        required: ${isRequired && !isUpdate},
        type: Array<string>,
    })
    `;
    content += swaggerSchema;

    const classProp = `${name}${isRequired && !isUpdate ? '' : '?'}: ${type}[]` + '\n';
    content += classProp;
  }
  return content;
};
