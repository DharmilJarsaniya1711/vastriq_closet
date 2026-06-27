import { getTransformedCmlNameByModelName } from '../../../utils/file';
import { getPrismaModel } from '../../../utils/prismaUtils';

export const createServiceContent = (modelName: string) => {
  const model = getPrismaModel(modelName);
  const pModelName = getTransformedCmlNameByModelName(modelName);

  let fieldsContent = '';

  const fields = model.fields.filter((field) => {
    if (
      field.isId ||
      field.name === 'deletedAt' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt'
    )
      return false;

    if (field.kind === 'scalar') {
      const fieldRepresentsRelation = model.fields.find((f) =>
        f.relationFromFields?.includes(field.name),
      );
      if (fieldRepresentsRelation) return false;
    }
    return true;
  });

  fields.forEach((field) => {
    const { kind, isList, relationFromFields } = field;
    if (kind === 'scalar' || (kind === 'object' && !relationFromFields)) {
      fieldsContent += `${field.name}:create${modelName}Dto.${field.name},
        `;
    }

    if (kind === 'object' && relationFromFields && relationFromFields[0]) {
      if (isList) {
        fieldsContent += `${field.name}: {
          connect: create${modelName}Dto.${field.relationFromFields[0]}.map((itemId) => ({ id: itemId })),
        },
        `;
      } else {
        fieldsContent += `${field.name}: {
          connect: {
            id: create${modelName}Dto.${field.relationFromFields[0]}
          }
        },
        `;
      }
    }
  });

  const content = `
  await this.utilService.validateExists(create${modelName}Dto, '${modelName}');
  await this.utilService.validateUnique(create${modelName}Dto, '${modelName}');
  
  const ${pModelName} = await this.prismaService.${pModelName}.create({
    data: {
      ${fieldsContent}
    },
  });

  return ${pModelName};
  `;

  return content;
};
