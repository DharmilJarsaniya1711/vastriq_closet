import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TUniqueId } from '../types/type';
import { AppConfigService } from '../../app-config/app-config.service';

export interface IApiResponse<T> {
  data: T;
  message?: string;
}

interface IPaginationProps {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}

export interface IDbPaginationProps {
  skip: number;
  take: number;
  order?: object;
}

export interface IPaginationEntity {
  limit: number;
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

interface IExistsArgs {
  totalRequired: number;
  value: string | string[];
  modelName: Prisma.ModelName;
  additionalQuery: IAdditionalQuery[];
  message?: string;
}

export interface IValidateUniqueOptions {
  id?: TUniqueId;
  errors?: { [id: string]: string };
}

export interface IAdditionalQuery {
  [id: string]: string;
}

export interface IValidateExistsOptions {
  additionalQuery?: { [id: string]: IAdditionalQuery[] };
  errors?: { [id: string]: string };
}

const sensitiveKeys = {
  password: 1,
};

@Injectable()
export class UtilService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService
  ) {}

  static buildResponse<T>(data: T, message = 'Success'): IApiResponse<T> {
    this.deleteSensitiveFields(data);
    return {
      data,
      message,
    };
  }

  static deleteSensitiveFields(data) {
    if (Array.isArray(data)) {
      data.forEach((item) => {
        this.deleteSensitiveFields(item);
      });
    } else if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key]) || (typeof data[key] === 'object' && data[key] !== null)) {
          this.deleteSensitiveFields(data[key]);
        } else {
          if (sensitiveKeys[key]) {
            delete data[key];
          } else {
            this.deleteSensitiveFields(data[key]);
          }
        }
      });
    }
  }

  static inArrayGetValidation(options: any) {
    const func = (data: string | string[], helpers: any) => {
      const inputItems = Array.isArray(data)
        ? data
        : data
            .trim()
            .split(',')
            .map((s) => s.trim());
      for (let i = 0; i < inputItems.length; i++) {
        const item = inputItems[i];
        if (!Object.values(options).includes(item)) {
          return helpers.message(
            `Invalid value ${item} in field {{#label}}. It should be either one of these(${Object.values(
              options
            ).join(', ')}) separated by comma`
          );
        }
      }

      return inputItems;
    };

    return func;
  }

  static nextSerialNumber = (id: number) => {
    const zeroFilled = ('0000000000000000' + id).slice(String(id).length);
    return zeroFilled;
  };

  static paginationProps(args: IPaginationProps): { skip: number; take: number; orderBy: object } {
    const currentPage = args.page < 1 ? 1 : args.page;
    args.limit = args.limit < 0 ? 10 : args.limit > 500 ? 500 : args.limit;

    const orderBy = {};

    let temp = orderBy;

    // this code will convert 'unit.name' -> {unit:{name: <sortOrder>}}
    const sortByArr = args.sortBy.split('.');
    sortByArr.forEach((k, i) => {
      if (i !== sortByArr.length - 1) temp[k] = {};
      else temp[k] = args.sortOrder;

      temp = temp[k];
    });

    return {
      skip: (Number(currentPage) - 1) * Number(args.limit),
      take: Number(args.limit),
      orderBy,
    };
  }

  static paginate(count: number, args: IPaginationProps): IPaginationEntity {
    const totalDocs = count;
    const totalPages = Math.ceil(totalDocs / args.limit);
    const hasNextPage = args.page < totalPages;
    const hasPrevPage = totalPages > 1 && args.page > 1 && args.page <= totalPages;
    const pagination = {
      limit: args.limit,
      currentPage: args.page,
      totalDocs,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
    return pagination;
  }
  //

  async validateExists(
    dto: any,
    modelName: Prisma.ModelName,
    options: IValidateExistsOptions = { additionalQuery: {}, errors: {} }
  ) {
    const model = Prisma.dmmf.datamodel.models.find((m) => m.name === modelName);
    if (!model) throw new InternalServerErrorException('Invalid Model');

    const relatableFields = model.fields
      .filter((f) => f.relationName && f.relationFromFields && f.relationFromFields[0])
      .map((f) => ({
        name: f.name,
        relationColumn: f.relationFromFields[0],
        modelName: f.type,
      }));

    const relatableFieldsSerialized = relatableFields.map((f) => f.relationColumn);

    const dtoPropsToValidate: { [id: string]: IExistsArgs } = {};
    Object.keys(dto).forEach((key) => {
      const value = dto[key];

      if (relatableFieldsSerialized.includes(key)) {
        if (Array.isArray(value)) {
          dtoPropsToValidate[key] = {
            totalRequired: value.length,
            modelName: model.fields.find(
              (f) => f.relationFromFields && f.relationFromFields[0] === key
            ).type as Prisma.ModelName,
            value,
            additionalQuery: options.additionalQuery[key],
            message: options.errors[key],
          };
        } else if (value !== undefined) {
          dtoPropsToValidate[key] = {
            totalRequired: 1,
            modelName: model.fields.find(
              (f) => f.relationFromFields && f.relationFromFields[0] === key
            ).type as Prisma.ModelName,
            value,
            additionalQuery: options.additionalQuery[key],
            message: options.errors[key],
          };
        }
      }
    });

    if (!Object.keys(dtoPropsToValidate).length) return;

    await Promise.all(
      Object.values(dtoPropsToValidate).map((props: IExistsArgs) => this.validateExistsInDb(props))
    );
  }

  getTransformedCmlNameByModelName = (modelName: string) => {
    const transformedModelName = modelName
      .match(/[A-Z][a-z]+/g)
      .map((w, i) => (i === 0 ? w.toLocaleLowerCase() : w))
      .join('');

    return transformedModelName;
  };

  async validateExistsInDb({
    totalRequired,
    value,
    modelName,
    additionalQuery,
    message,
  }: IExistsArgs) {
    const modelTransformedName = this.getTransformedCmlNameByModelName(modelName);

    if (Array.isArray(value)) {
      const uniqueIds = [...new Set(value.filter((id) => id))];

      const whereArgs = {
        id: {
          in: uniqueIds,
        },
        ...(modelName !== 'Upload'
          ? {
              deletedAt: {
                isSet: false,
              },
            }
          : {}),
      };
      if (additionalQuery?.length) {
        additionalQuery.forEach((aq) => {
          Object.keys(aq).forEach((key) => {
            whereArgs[key] = aq[key];
          });
        });
      }

      const data = await this.prismaService[modelTransformedName].findMany({
        where: whereArgs,
      });
      if (data?.length !== totalRequired) {
        throw new NotFoundException(message || `Some of the ${modelName}(s) does not exist`);
      }
      return data;
    } else if (value) {
      const whereArgs = {
        id: value,
        ...(modelName !== 'Upload'
          ? {
              deletedAt: {
                isSet: false,
              },
            }
          : {}),
      };
      if (additionalQuery?.length) {
        additionalQuery.forEach((aq) => {
          Object.keys(aq).forEach((key) => {
            whereArgs[key] = aq[key];
          });
        });
      }

      const data = await this.prismaService[modelTransformedName].findFirst({
        where: whereArgs,
      });
      if (!data)
        throw new NotFoundException(message || `${modelName} with id \`${value}\` does not exist`);
      return data;
    }
  }

  async validateUnique(
    dto: any,
    modelName: Prisma.ModelName,
    options: IValidateUniqueOptions = { id: null, errors: {} }
  ) {
    const { id, errors } = options;
    const modelTransformedName = this.getTransformedCmlNameByModelName(modelName);
    const model = Prisma.dmmf.datamodel.models.find((m) => m.name === modelName);

    const { uniqueFields: uniqueFieldsSet } = model;

    await Promise.all(
      uniqueFieldsSet.map(async (uniqueFields) => {
        const args = {
          deletedAt: {
            isSet: false,
          },
          ...(id !== null ? { id: { not: id } } : {}),
        };
        uniqueFields.forEach((uniqueField) => {
          if (uniqueField !== 'deletedAt' && dto[uniqueField] !== undefined)
            args[uniqueField] = dto[uniqueField];
        });

        const item = await this.prismaService[modelTransformedName].findFirst({
          where: args,
        });

        if (item) {
          const errorMessage = errors[uniqueFields.join('-')];
          throw new ConflictException(
            errorMessage ||
              `${model.name} already exists with same ${uniqueFields
                .filter((f) => f !== 'deletedAt')
                .join(', ')}`
          );
        }
      })
    );
  }

  static genOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  genDeepLink(link: string, params: { [id: string]: string }) {
    const url = new URL(`${this.appConfigService.app.host}/deeplink/${link}`);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }

  static genDeepLinkIdentifier(link: string, params: { [id: string]: string }) {
    const url = new URL(`app://deeplink/${link}`);
    url.search = new URLSearchParams(params).toString();
    return url.toString();
  }
}
