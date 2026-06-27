import { Prisma } from '@prisma/client';

const genContent = (typeField: Prisma.DMMF.Field, options: any = {}) => {
  const { name, kind, isList, type, isRequired, relationFromFields } = typeField;

  const isId = name.search(/id/i) > -1;
  if (isId) return '';

  if (type === 'String') {
    if (isList) {
      return `${name}: Joi.array().items(Joi.string().required())${
        isRequired ? '.required(),' : ','
      }`;
    } else {
      return `${name}: Joi.string()${isRequired ? '.required(),' : ','}`;
    }
  }

  if (type === 'DateTime') {
    if (isList) {
      return `${name}: Joi.array().items(Joi.date().format('YYYY-MM-DD').utc())${
        isRequired ? '.required(),' : ','
      }`;
    } else {
      return `${name}: Joi.date().format('YYYY-MM-DD').utc()${
        name === 'startDate' && options.isDateRange ? ".less(Joi.ref('endDate'))" : ''
      }${isRequired ? '.required(),' : ','}`;
    }
  }

  if (type === 'Int' || type === 'BigInt') {
    if (isList) {
      return `${name}: Joi.array().items(Joi.number().required())${
        isRequired ? '.required(),' : ','
      }`;
    } else {
      return `${name}: Joi.number()${isRequired ? '.required(),' : ','}`;
    }
  }

  if (kind === 'enum') {
    if (isList) {
      return `${name}: Joi.array().items(Joi.string().valid(...Object.values(${type})).required())${
        isRequired ? '.required(),' : ','
      }`;
    } else {
      return `${name}: Joi.string().valid(...Object.values(${type}))${
        isRequired ? '.required(),' : ','
      }`;
    }
  }

  if (type === 'Boolean') {
    if (isList) {
      return `${name}: Joi.array().items(Joi.boolean().required())${
        isRequired ? '.required(),' : ','
      }`;
    } else {
      return `${name}: Joi.boolean()${isRequired ? '.required(),' : ','}`;
    }
  }

  if (kind === 'object' && !relationFromFields) {
    const isDateRange = type === 'DateRange';

    const objType = Prisma.dmmf.datamodel.types.find((e) => e.name === type);
    let schemaContent = '';
    objType.fields.forEach((typeField) => {
      schemaContent += genContent(typeField, { isDateRange });
    });
    let rootContent = '';
    if (!isList) {
      rootContent = `
      ${name}: Joi.object().keys({
        ${schemaContent}
      })${isRequired ? '.required(),' : ','}
      `;
    } else {
      rootContent = `
      ${name}: Joi.array().items(
        Joi.object().keys({
          ${schemaContent}
        })
      )${isRequired ? '.required(),' : ','}
      `;
    }
    return rootContent;
  }

  return '';
};

export const getEmbeddedTypeContent = (
  modelName: string,
  field: Prisma.DMMF.Field,
  isUpdate = false,
) => {
  const { isList, name, isRequired, type } = field;

  // eslint-disable-next-line prefer-const
  let schemaContent = '';

  const objType = Prisma.dmmf.datamodel.types.find((e) => e.name === type);
  objType.fields.forEach((typeField) => {
    schemaContent += genContent(typeField);
  });

  let rootContent = '';

  if (!isList) {
    rootContent = `
    Joi.object().keys({
      ${schemaContent}
    })${isRequired && !isUpdate ? '.required(),' : ','}
    `;
  } else {
    rootContent = `
    Joi.array().items(
      Joi.object().keys({
        ${schemaContent}
      })
    )${isRequired && !isUpdate ? '.required(),' : ','}
    `;
  }

  const content = `
  @JoiSchema(
    ${rootContent}
  )
  @ApiProperty({
    description: '${type} details',
    required: ${isRequired && !isUpdate},
    type: () => ${type}SubType,
    isArray: ${isList},
  })
  ${name}${isRequired && !isUpdate ? '' : '?'}: ${type}${isList ? '[]' : ''};
  `;

  return content;
};
