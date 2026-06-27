import { Prisma, PrismaClient, UserSignupMethod, UserType } from '@prisma/client';
import * as argon from 'argon2';

export default async (
  client: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation
  >,
) => {
  const admin = await client.user.findFirst({
    where: {
      type: UserType.USER,
      email: 'test@admin.com',
      deletedAt: {
        isSet: false,
      },
    },
  });
  if (!admin)
    await client.user.createMany({
      data: [
        {
          type: UserType.USER,
          email: 'developer@codebuddy.co',
          password: await argon.hash('Pass@123'),
          signupMethod: UserSignupMethod.EMAIL,
        },
      ],
    });
};
