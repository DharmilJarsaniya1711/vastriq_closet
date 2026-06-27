import { Injectable } from "@nestjs/common";
import { UserSignupMethod, UserType } from "@prisma/client";
import * as argon from 'argon2';
import { PrismaService } from "../prisma/prisma.service";
import { AbstractSeeder } from "../shared/seeder/abstractSeeder.service";

@Injectable()
export class AuthSeeder extends AbstractSeeder {
  public name = AuthSeeder.name;
  
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async seed(){
    await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'john1234@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'John',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.EMAIL,
        emailVerifiedAt: new Date(),
      },
    });
  }
}