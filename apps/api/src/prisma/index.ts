/**
 * this seeder scripts add the following
 * 1. Admin
 */

import { PrismaClient } from '@prisma/client';
import * as data from './seeder/data';
const prisma = new PrismaClient();

async function main(): Promise<any> {
  await data.user(prisma);
  await data.vastriq(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
