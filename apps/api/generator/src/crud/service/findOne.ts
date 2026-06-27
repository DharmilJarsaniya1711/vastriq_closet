import { getTransformedCmlNameByModelName } from '../../../utils/file';
import { getPrismaModel } from '../../../utils/prismaUtils';

export const getFindOneServiceContent = (modelName: string) => {
  const pModelName = getTransformedCmlNameByModelName(modelName);
  const model = getPrismaModel(modelName);

  let includeContent = '';
  model.fields.forEach((f) => {
    if (f.relationName) {
      includeContent += f.isList
        ? `${f.name}: {
        where: {
          deletedAt: {isSet: false,}
        }
      },`
        : `${f.name}: true,`;
    }
  });

  return `
    const ${pModelName} = await this.prismaService.${pModelName}.findFirst({
        where: {
          id,
          deletedAt: {isSet: false,}
        },
        ${
          includeContent.length
            ? `
        include: {
            ${includeContent}
        }
        `
            : ''
        }
        
    });
    if (!${pModelName}) throw new NotFoundException('${modelName} not found');
    return ${pModelName};
    `;
};
