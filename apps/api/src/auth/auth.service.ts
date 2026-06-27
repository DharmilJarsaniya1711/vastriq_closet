import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpIntent, Prisma, User, UserSignupMethod, UserType } from '@prisma/client';
import * as argon from 'argon2';
import { AxiosError } from 'axios';
import { Profile } from 'passport-google-oauth20';
import { catchError, firstValueFrom } from 'rxjs';
import { AppCacheService } from '../app-cache/app-cache.service';
import { AppConfigService } from '../app-config/app-config.service';
import { NotificationService } from '../notification/notification.service';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { TUniqueId } from '../shared/types/type';
import { UtilService } from '../shared/util/util.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RequestChangeEmailDto,
  ResendEmailVerificationOtpDto,
  ResetPasswordDto,
  SignUpDto,
  VerifyEmailChangeDto,
  VerifyEmailDto,
} from './auth.dto';
import { FBProfileJSON, JWTTokenType } from './types';

export type JwtPayload = {
  email: string;
  type: UserType;
  sub: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
    private readonly utilService: UtilService,
    private readonly cacheService: AppCacheService,
    private readonly otpService: OtpService
  ) {}

  async requestPhoneOtp(phone: string, intent: 'LOGIN' | 'SIGNUP' = 'LOGIN') {
    return this.otpService.requestOtp(phone, OtpIntent[intent]);
  }

  // Single user type: any phone-verified user can both list and rent. No roles.
  async verifyPhoneOtp(phone: string, code: string) {
    await this.otpService.verifyOtp(phone, code);

    let user = await this.prismaService.user.findFirst({
      where: { phone, deletedAt: { isSet: false } },
    });

    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          type: UserType.USER,
          signupMethod: UserSignupMethod.PHONE,
          phone,
          phoneVerifiedAt: new Date(),
        },
      });
    } else if (!user.phoneVerifiedAt) {
      user = await this.prismaService.user.update({
        where: { id: user.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    const tokens = await this.getTokens(user);
    delete user.password;
    return { tokens, user };
  }

  async getTokens(user: User) {
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: user.type,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { ...jwtPayload, tokenType: JWTTokenType.ACCESS },
        {
          secret: this.appConfigService.jwt.atSecret,
          expiresIn: '5m',
        }
      ),
      this.jwtService.signAsync(
        { ...jwtPayload, tokenType: JWTTokenType.REFRESH },
        {
          secret: this.appConfigService.jwt.rtSecret,
          expiresIn: '7d',
        }
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  // Update the logged-in user's own profile (display name + email).
  async updateProfile(
    userId: string,
    dto: { firstName?: string | null; lastName?: string | null; email?: string | null }
  ) {
    const data: Record<string, unknown> = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName?.trim() || null;
    if (dto.lastName !== undefined) data.lastName = dto.lastName?.trim() || null;
    if (dto.email !== undefined) {
      const email = dto.email?.trim() || null;
      if (email) {
        const clash = await this.prismaService.user.findFirst({
          where: { email, deletedAt: { isSet: false }, id: { not: userId } },
        });
        if (clash) throw new BadRequestException('That email is already in use.');
      }
      data.email = email;
    }

    const user = await this.prismaService.user.update({ where: { id: userId }, data });
    delete user.password;
    return user;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.findEmailRegUserByEmail(forgotPasswordDto.email);

      const otp = UtilService.genOtp();
      const deeplink = this.utilService.genDeepLink('forgot-password', {
        token: String(otp),
        email: user.email,
      });

      await this.cacheService.set(
        `Forgot-password-otp-${otp}-${user.email}`,
        user.email,
        this.appConfigService.otp.expiry * 60 * 1000
      );

      await this.notificationService.sendNotification({
        email: {
          recipients: [user],
          subject: 'Reset password',
          template: 'forgot-password',
          context: {
            email: user.email,
            deeplink,
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Invalid credentials');
      }

      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const email = await this.cacheService.get(
        `Forgot-password-otp-${resetPasswordDto.otp}-${resetPasswordDto.email}`
      );

      if (!email) throw new NotFoundException('Invalid credentials');

      const user = await this.findEmailRegUserByEmail(email as string);

      await this.cacheService.del([
        `Forgot-password-otp-${resetPasswordDto.otp}-${resetPasswordDto.email}`,
      ]);

      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password: await argon.hash(resetPasswordDto.password),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Invalid credentials');
      }

      throw error;
    }
  }

  async findEmailRegUserByEmail(email: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email,
        deletedAt: {
          isSet: false,
        },
      },
    });
    if (!user) throw new NotFoundException('Invalid credentials');
    return user;
  }

  async loginWithEmailPassword(loginDto: LoginDto) {
    try {
      const user = await this.findEmailRegUserByEmail(loginDto.email);
      if (!user || !user.password) throw new NotFoundException('Invalid credentials');

      const isPasswordMatch = await argon.verify(user.password, loginDto.password);
      if (!isPasswordMatch) throw new ForbiddenException('Invalid credentials');

      const tokens = await this.getTokens(user);
      return tokens;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Invalid credentials');
      }

      throw error;
    }
  }

  async me(userFromToken: JwtPayload) {
    const user = await this.prismaService.user.findFirst({
      where: { id: userFromToken.sub, deletedAt: { isSet: false } },
    });
    if (!user) throw new UnauthorizedException('Invalid token');

    delete user.password;
    return user;
  }

  async refreshToken(userFromToken: JwtPayload) {
    const user = await this.prismaService.user.findFirst({ where: { id: userFromToken.sub } });
    return await this.getTokens(user);
  }

  async signUpWithEmail(signUpDto: SignUpDto) {
    await this.checkIfUserExists(signUpDto.email, UserSignupMethod.EMAIL);
    const user = await this.createUser({
      type: UserType.USER,
      signupMethod: UserSignupMethod.EMAIL,
      email: signUpDto.email,
      password: await argon.hash(signUpDto.password),
    });
    delete user.password;

    if (user.signupMethod === UserSignupMethod.EMAIL) {
      this.sendVerificationOtp(user);
    }

    return user;
  }

  async checkIfUserExists(email: string, signupMethod: UserSignupMethod, ignoreSame = false) {
    const signupMethods = Prisma.dmmf.datamodel.enums
      .find((e) => e.name === 'UserSignupMethod')
      .values.filter((sm) => (ignoreSame ? sm.name !== signupMethod : true))
      .map((sm) => sm.name);

    await Promise.all(
      signupMethods.map(async (sm: UserSignupMethod) => {
        const user = await this.prismaService.user.findFirst({
          where: {
            deletedAt: {
              isSet: false,
            },
            email,
            signupMethod: sm,
          },
        });
        if (user) {
          throw new ConflictException(
            sm === signupMethod
              ? 'User with same email id already exists'
              : 'User already exists with same email address and different signup method!'
          );
        }
      })
    );
  }

  async createUser(data: Prisma.UserCreateInput) {
    return await this.prismaService.user.create({
      data,
    });
  }

  async sendVerificationOtp(user: User) {
    const otp = UtilService.genOtp();

    const deeplink = this.utilService.genDeepLink('signup-verify-email', {
      token: String(otp),
      email: user.email,
    });

    await this.cacheService.set(
      `Email-verification-otp-${otp}-${user.email}`,
      user.email,
      this.appConfigService.otp.expiry * 60 * 1000
    );

    await this.notificationService.sendNotification({
      email: {
        recipients: [user],
        subject: 'Verify your email',
        template: 'signup-verify-email',
        context: {
          email: user.email,
          deeplink,
        },
      },
    });
  }

  async resendEmailVerificationOtp(resendEmailVerificationOtpDto: ResendEmailVerificationOtpDto) {
    try {
      const user = await this.findEmailRegUserByEmail(resendEmailVerificationOtpDto.email);

      if (user.emailVerifiedAt) throw new BadRequestException('Email already verified');

      this.sendVerificationOtp(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new ForbiddenException('Invalid credentials');
      }

      throw error;
    }
  }

  async handleGoogleAuth(idToken: string) {
    const googleUserData = await firstValueFrom(
      this.httpService.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`).pipe(
        catchError((error: AxiosError) => {
          throw new ForbiddenException(error.message || 'Access Denied');
        })
      )
    );

    const googleUser = googleUserData.data as Profile['_json'];

    const user = await this.prismaService.user.findFirst({
      where: {
        email: googleUser?.email,
        deletedAt: { isSet: false },
      },
    });

    //If valid registered user exists i.e. if user is logging in, return accessToken
    if (user) {
      if (user.banned === true) throw new UserBannedException();

      return await this.getTokens(user);
    }

    //register new user
    const newUser = await this.createUser({
      type: UserType.USER,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      email: googleUser.email,
      signupMethod: UserSignupMethod.GOOGLE,
      emailVerifiedAt: new Date(),
    });

    //return accessToken for new user
    return await this.getTokens(newUser);
  }

  async handleFbAuth(accessToken: string) {
    const fbUserData = await firstValueFrom(
      this.httpService
        .get(
          `https://graph.facebook.com/v16.0/me?access_token=${accessToken}&fields=first_name,last_name,email`
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new ForbiddenException(error.message || 'Access Denied');
          })
        )
    );

    if (fbUserData.status >= 400) throw new ForbiddenException('Access Denied');

    const fbUser = fbUserData.data as FBProfileJSON;

    const user = await this.prismaService.user.findFirst({
      where: {
        email: fbUser.email,
        deletedAt: { isSet: false },
      },
    });

    //If valid registered user exists i.e. if user is logging in, return accessToken
    if (user) {
      if (user.banned === true) throw new UserBannedException();

      return await this.getTokens(user);
    }

    //register new user
    const newUser = await this.createUser({
      type: UserType.USER,
      firstName: fbUser.first_name,
      lastName: fbUser.last_name,
      email: fbUser.email,
      signupMethod: UserSignupMethod.FACEBOOK,
      emailVerifiedAt: new Date(),
    });

    //return accessToken for new user
    return await this.getTokens(newUser);
  }

  async getUserById(id: TUniqueId) {
    const user = await this.prismaService.user.findFirst({
      where: { id, deletedAt: { isSet: false } },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async requestChangeEmail(userId: TUniqueId, requestChangeEmailDto: RequestChangeEmailDto) {
    const user = await this.getUserById(userId);
    if (user.email === requestChangeEmailDto.email)
      throw new ConflictException('New email id cannot be same as old email id');
    const userExistsWithTempEmail = await this.checkIfOtherUserExistsWithSameEmail(
      requestChangeEmailDto.email,
      userId
    );
    if (userExistsWithTempEmail)
      throw new ConflictException('An user with same email id already exists');

    if (user.signupMethod !== UserSignupMethod.EMAIL)
      throw new BadRequestException('You are not signed up using email and password');
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailTemp: requestChangeEmailDto.email,
      },
    });

    const otp = UtilService.genOtp();
    const deeplink = this.utilService.genDeepLink('verify-email-change', {
      token: String(otp),
      email: user.email,
    });
    await this.cacheService.set(`Verify-email-change-${otp}-${user.email}`, user.id, 60 * 5 * 1000);

    await this.notificationService.sendNotification({
      email: {
        recipients: [user],
        subject: 'Verify email change',
        template: 'verify-email-change',
        context: {
          email: user.email,
          deeplink,
        },
      },
    });
  }

  async checkIfOtherUserExistsWithSameEmail(email: string, exceptId: TUniqueId) {
    return await this.prismaService.user.findFirst({
      where: {
        id: {
          not: exceptId,
        },
        email,
        deletedAt: {
          isSet: false,
        },
      },
    });
  }

  async verifyEmailChange(verifyEmailChangeDto: VerifyEmailChangeDto) {
    const id = await this.cacheService.get(
      `Verify-email-change-${verifyEmailChangeDto.otp}-${verifyEmailChangeDto.email}`
    );
    if (!id) throw new BadRequestException('Invalid credentials');
    const user = await this.getUserById(id as string);

    await this.cacheService.del([
      `Verify-email-change-${verifyEmailChangeDto.otp}-${verifyEmailChangeDto.email}`,
    ]);

    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.emailTemp,
      },
    });
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const email = await this.cacheService.get(
      `Email-verification-otp-${verifyEmailDto.otp}-${verifyEmailDto.email}`
    );

    if (!email) throw new BadRequestException('Invalid credentials');
    const user = await this.findEmailRegUserByEmail(email as string);
    if (!user) throw new NotFoundException('Invalid credentials');
    await this.cacheService.del([
      `Email-verification-otp-${verifyEmailDto.otp}-${verifyEmailDto.email}`,
    ]);

    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });
  }
}

export class UserBannedException extends HttpException {
  constructor() {
    super('You have been banned from using the platform', HttpStatus.FORBIDDEN);
  }
}
