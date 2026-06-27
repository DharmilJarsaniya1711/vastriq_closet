import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<Prisma.PrismaClientOptions, 'query'> {
  private static instance: PrismaService | undefined;

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    /***********************************/
    /* SOFT DELETE MIDDLEWARE */
    /***********************************/
    this.$use(async (params, next) => {
      if (process.env.FIXTURE_ENV === 'true') {
        return next(params);
      }
      // Upload, WishlistItem and Banner are hard-deleted (no deletedAt column).
      if (!['Upload', 'WishlistItem', 'Banner'].includes(params.model)) {
        // Check incoming query type
        if (params.action === 'delete') {
          // Delete queries
          // Change action to an update
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          // Delete many queries
          params.action = 'updateMany';
          if (params.args.data !== undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
      }
      return next(params);
    });
  }
}
