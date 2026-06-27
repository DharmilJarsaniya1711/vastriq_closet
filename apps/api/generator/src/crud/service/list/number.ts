import { Prisma } from '@prisma/client';

export const getNumberTypeContent = (modelName, field: Prisma.DMMF.Field) => {
  const { name, isList } = field;

  if (isList) return;

  let content = '';
  const options = ['Gte', 'Lte'];

  options.forEach((option) => {
    content += `
      if(list${modelName}Dto.${name}${option} !== undefined) {
        args.push({
          ${name}: {
            ${option.toLocaleLowerCase()}: list${modelName}Dto.${name}${option},
          },
        });
      }
    `;
  });

  return content;
};
