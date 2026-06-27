import { Injectable } from '@nestjs/common';
import { AbstractFixture } from '../shared/fixture/abstractFixture.service';
import * as argon from 'argon2';
import { UserSignupMethod, UserType } from '@prisma/client';

@Injectable()
export class AuthFixture extends AbstractFixture {
  name = AuthFixture.name;
  static USER_1 = 'USER_1';
  static UNVERIFIED_USER = 'UNVERIFIED_USER';
  static GOOGLE_USER = 'GOOGLE_USER';
  static FACEBOOK_USER = 'FACEBOOK_USER';
  static BANNED_FACEBOOK_USER = 'BANNED_FACEBOOK_USER';

  async load(): Promise<void> {
    const user1 = await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'john@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'John',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.EMAIL,
        emailVerifiedAt: new Date(),
      },
    });
    this.addReference(AuthFixture.USER_1, user1);

    const unverifiedUser = await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'jason@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'Jason',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.EMAIL,
      },
    });
    this.addReference(AuthFixture.UNVERIFIED_USER, unverifiedUser);

    const googleUser = await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'google_user@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'Google',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.GOOGLE,
      },
    });
    this.addReference(AuthFixture.GOOGLE_USER, googleUser);

    const fbUser = await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'facebook_user@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'Facebook',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.FACEBOOK,
      },
    });
    this.addReference(AuthFixture.FACEBOOK_USER, fbUser);

    const bannedFBUser = await this.prismaService.user.create({
      data: {
        type: UserType.USER,
        email: 'banned_facebook_user@example.com',
        password: await argon.hash('Pass@123'),
        firstName: 'Facebook',
        lastName: 'Doe',
        signupMethod: UserSignupMethod.FACEBOOK,
        banned: true,
        bannedAt: new Date(),
      },
    });
    this.addReference(AuthFixture.BANNED_FACEBOOK_USER, bannedFBUser);
  }
}
