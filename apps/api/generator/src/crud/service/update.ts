import { getTransformedCmlNameByModelName } from '../../../utils/file';
import { getPrismaModel } from '../../../utils/prismaUtils';

export const updateServiceContent = (modelName: string) => {
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
    const { kind, isList } = field;
    if (kind === 'scalar') {
      fieldsContent += `
        if (update${modelName}Dto.${field.name} !== undefined) {
          payload.${field.name} = update${modelName}Dto.${field.name};
        }
      `;
    }

    if (kind === 'object' && field.relationFromFields && field.relationFromFields[0]) {
      if (isList) {
        fieldsContent += `
          if (Array.isArray(update${modelName}Dto.${field.relationFromFields[0]})) {
            payload.${field.name} = {
              disconnect: ${pModelName}.${field.relationFromFields[0]}.map((id) => ({ id })),
              connect: update${modelName}Dto.${field.relationFromFields[0]}.map((itemId) => ({ id: itemId })),
            }
          }
        `;
      } else {
        fieldsContent += `
          if (update${modelName}Dto.${field.relationFromFields[0]} !== undefined) {
            payload.${field.name} = {
              connect: {
                id: update${modelName}Dto.${field.relationFromFields[0]},
              },
            };
          }
        `;
      }
    }

    if (kind === 'object' && !field.relationFromFields) {
      if (isList) {
        fieldsContent += `
          if (Array.isArray(update${modelName}Dto.${field.name})) {
            payload.${field.name} = update${modelName}Dto.${field.name};
          }
        `;
      } else {
        fieldsContent += `
          if (update${modelName}Dto.${field.name} !== undefined) {
            payload.${field.name} = update${modelName}Dto.${field.name};
          }
        `;
      }
    }
  });

  const content = `
    const ${pModelName} = await this.findOne(id);
    
    await this.utilService.validateExists(update${modelName}Dto, '${modelName}');
    await this.utilService.validateUnique(update${modelName}Dto, '${modelName}', {id: ${pModelName}.id});

    const payload: Prisma.${modelName}UpdateInput = {};
    ${fieldsContent}
    const updated${modelName} = await this.prismaService.${pModelName}.update({
      where: {
        id: ${pModelName}.id,
      },
      data: payload,
    });
    return updated${modelName};
  `;

  return content;
};
