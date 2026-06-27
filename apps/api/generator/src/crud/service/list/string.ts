import { Prisma } from '@prisma/client';

export const getStringTypeContent = (modelName, field: Prisma.DMMF.Field) => {
  const { name, isList } = field;

  const isId = name.search(/id/i) > -1;
  if (!isId) return;

  const content = `
  if(list${modelName}Dto.${name}?.length) {
    args.push({
        ${name}: {
        ${isList ? 'hasSome' : 'in'}: list${modelName}Dto.${name}
            .trim()
            .split(',')
            .map((id) => id.trim()),
        },
    });
    }
  `;

  return content;
};
