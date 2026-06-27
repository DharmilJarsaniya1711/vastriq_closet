import { Prisma } from '@prisma/client';
import { getPrismaModel } from '../../../utils/prismaUtils';

export const subClassDtoContent = (modelName: string) => {
  const model = getPrismaModel(modelName);

  const classesArr = [];
  const embeddedTypeClassNamesArr = [];

  model.fields.forEach((field) => {
    if (field.isId) return;

    const { kind, relationFromFields } = field;

    if (kind === 'object' && !relationFromFields) {
      const objType = Prisma.dmmf.datamodel.types.find((e) => e.name === field.type);
      genContent(objType, classesArr, embeddedTypeClassNamesArr);
    }
  });

  return classesArr.join('');
};

const genContent = (
  field: Prisma.DMMF.Model,
  classesArr: string[],
  embeddedTypeClassNamesArr: string[],
) => {
  let itemContent = '';
  field.fields.forEach((typeField) => {
    const { name, kind, isList, type, isRequired, relationFromFields } = typeField;
    const isId = name.search(/id/i) > -1;
    if (isId) return '';

    if (type === 'String') {
      itemContent += `
      @ApiProperty({
        required: ${isRequired},
        type: ${isList ? 'Array<string>' : 'String'},
        isArray: ${isList},
      })
      ${name}${isRequired ? '' : ''}: string${isList ? '[]' : ''};
      `;
    }
    if (type === 'DateTime') {
      itemContent += `
      @ApiProperty({
        required: ${isRequired},
        type: ${isList ? 'Array<string>' : 'String'},
        isArray: ${isList},
      })
      ${name}${isRequired ? '' : ''}: string${isList ? '[]' : ''};
      `;
    }
    if (type === 'Boolean') {
      itemContent += `
      @ApiProperty({
        required: ${isRequired},
        type: ${isList ? 'Array<boolean>' : 'Boolean'},
        isArray: ${isList},
      })
      ${name}${isRequired ? '' : ''}: boolean${isList ? '[]' : ''};
      `;
    }
    if (type === 'Int' || type === 'BigInt') {
      itemContent += `
      @ApiProperty({
        required: ${isRequired},
        type: ${isList ? 'Array<number>' : 'Number'},
        isArray: ${isList},
      })
      ${name}${isRequired ? '' : ''}: Number${isList ? '[]' : ''};
      `;
    }
    if (kind === 'enum') {
      itemContent += `
      @ApiProperty({
        required: ${isRequired},
        type: ${isList ? 'Array<string>' : 'String'},
        isArray: ${isList},
        enum: ${type}
      })
      ${name}${isRequired ? '' : ''}: string${isList ? '[]' : ''};
      `;
    }
    if (kind === 'object' && !relationFromFields) {
      const typeName = `${type}SubType`;

      itemContent += `
        @ApiProperty({
          description: '${type} details',
          required: ${isRequired},
          type: () => ${typeName},
          isArray: ${isList},
        })
        ${name}${isRequired ? '' : '?'}: ${type}${isList ? '[]' : ''};
      `;
    }
  });

  classesArr.push(`
    class ${field.name}SubType {
      ${itemContent}
    }
  `);
  field.fields.forEach((typeField) => {
    if (typeField.kind === 'object' && !typeField.relationFromFields) {
      const typeName = `${typeField.type}SubType`;
      if (embeddedTypeClassNamesArr.includes(typeName)) return;
      embeddedTypeClassNamesArr.push(typeName);
      const objType = Prisma.dmmf.datamodel.types.find((e) => e.name === typeField.type);
      genContent(objType, classesArr, embeddedTypeClassNamesArr);
    }
  });
};
