import { getTransformedCmlNameByModelName } from '../../../utils/file';

export const getDeleteServiceContent = (modelName: string) => {
  const pModelName = getTransformedCmlNameByModelName(modelName);

  return `
    const ${pModelName} = await this.findOne(id);

    await this.prismaService.${pModelName}.delete({
        where: { id: ${pModelName}.id },
    });

    return ${pModelName};
    `;
};
