import { PrismaClient, UserSignupMethod, UserType } from '@prisma/client';
import * as argon from 'argon2';
const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const inquirer = require('inquirer');

async function main(): Promise<any> {
  const { firstName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter firstName',
    },
  ]);
  const { lastName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter lastName',
    },
  ]);
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Enter email',
    },
  ]);
  const { password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'password',
      message: 'Enter password',
    },
  ]);

  const admin = await prisma.user.findFirst({
    where: {
      type: UserType.ADMIN,
      email,
      deletedAt: {
        isSet: false,
      },
    },
  });
  if (!admin)
    await prisma.user.createMany({
      data: [
        {
          firstName,
          lastName,
          type: UserType.USER,
          email,
          password: await argon.hash(password),
          signupMethod: UserSignupMethod.EMAIL,
        },
      ],
    });
  else throw new Error('User already exists');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
