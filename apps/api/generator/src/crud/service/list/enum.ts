import { Prisma } from '@prisma/client';

export const getEnumTypeContent = (modelName, field: Prisma.DMMF.Field) => {
  const { name, isList, type } = field;

  const content = `
    if(list${modelName}Dto.${name}?.length) {
      args.push({
        ${name}: {
          ${isList ? 'hasSome' : 'in'}: list${modelName}Dto.${name}
            .trim()
            .split(',')
            .map((item: ${type}) => item.trim() as ${type}),
        },
      });
    }
  `;

  return content;
};
