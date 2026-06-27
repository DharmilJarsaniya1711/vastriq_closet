import { getTransformedCmlNameByModelName } from '../../../utils/file';
import { pluralize } from '../../../utils/pluralize';
import { getPrismaModel } from '../../../utils/prismaUtils';
import { FieldWithSearchableFields } from '../dto/list';
import { getEnumTypeContent } from './list/enum';
import { getNumberTypeContent } from './list/number';
import { getStringTypeContent } from './list/string';

export const findAllServiceContent = (
  modelName: string,
  selectedOptionsForSearch: FieldWithSearchableFields[],
) => {
  const model = getPrismaModel(modelName);

  let fieldsContent = '';

  if (selectedOptionsForSearch.length) {
    let searchArgsItems = '';
    selectedOptionsForSearch.forEach((field) => {
      if (!field.relationName) {
        searchArgsItems += `
          searchOrArgs.push({
              ${field.name}: {
                contains: list${modelName}Dto.search,
                mode: 'insensitive',
              },
            });
          `;
      } else {
        if (field.searchableFelids.length) {
          if (field.isList) {
            let someContent = '';
            field.searchableFelids.forEach((sf) => {
              someContent += `
              ${sf}: {
                contains: list${modelName}Dto.search,
                mode: 'insensitive',
              },
            `;
            });
            searchArgsItems += `
            if(list${modelName}Dto.search?.length) {
              searchOrArgs.push({
                ${field.name}: {
                  some: {
                    OR: [
                      {
                        ${someContent}
                      },
                    ],
                  },
                },
              });
            }
            `;
          } else {
            let someContent = '';
            field.searchableFelids.forEach((sf) => {
              someContent += `
              {
                ${sf}: {
                  contains: list${modelName}Dto.search,
                  mode: 'insensitive',
                },
              },
            `;
            });
            searchArgsItems += `
            if(list${modelName}Dto.search?.length) {
              searchOrArgs.push({
                ${field.name}: {
                  is: {
                    OR: [
                      ${someContent}
                    ],
                  },
                },
              });
            }
            `;
          }
        }
      }
    });

    const searchArgsContent = `
      if(list${modelName}Dto.search?.length) {
        const searchOrArgs: Prisma.Enumerable<Prisma.${modelName}WhereInput> = [];
        ${searchArgsItems}

        args.push({
          OR: searchOrArgs,
        });
      }
    `;
    fieldsContent += searchArgsContent;
  }

  const pModelName = getTransformedCmlNameByModelName(modelName);
  const pluralizedModelName = pluralize(pModelName);

  model.fields.forEach((field) => {
    const { type, kind } = field;

    if (kind === 'scalar' && type === 'String') {
      const mContent = getStringTypeContent(modelName, field);
      if (mContent) fieldsContent += mContent;
    }
    if (kind === 'scalar' && (type === 'Int' || type === 'BigInt')) {
      const mContent = getNumberTypeContent(modelName, field);
      if (mContent) fieldsContent += mContent;
    }

    if (kind === 'enum') {
      const mContent = getEnumTypeContent(modelName, field);
      if (mContent) fieldsContent += mContent;
    }
  });

  const content = `
    const args: Prisma.Enumerable<Prisma.${modelName}WhereInput> = [{
      deletedAt: {isSet: false,}
    }];
    const whereInput: Prisma.${modelName}WhereInput = {};

    ${fieldsContent}

    if (args.length) {
      whereInput.AND = args;
    }
    const where = {
      where: whereInput,
    };

    const [count, ${pluralizedModelName}] = await this.prismaService.$transaction([
      this.prismaService.${pModelName}.count({ ...where }),
      this.prismaService.${pModelName}.findMany({
        ...where,
        ...UtilService.paginationProps(list${modelName}Dto),
      }),
    ]);

    const pagination = UtilService.paginate(count, list${modelName}Dto);

    return { pagination, ${pluralizedModelName} };
  `;

  return content;
};
