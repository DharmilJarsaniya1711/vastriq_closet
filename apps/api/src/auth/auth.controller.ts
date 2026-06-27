import { Body, Controller, Get, Patch, Post, Query, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { requestOtpSchema, RequestOtpDto, verifyOtpSchema, VerifyOtpDto } from '../otp/otp.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UtilService } from '../shared/util/util.service';
import {
  changeEmailSchema,
  ForgotPasswordDto,
  forgotPasswordSchema,
  tokenSchema,
  LoginDto,
  loginSchema,
  RequestChangeEmailDto,
  ResendEmailVerificationOtpDto,
  ResetPasswordDto,
  resetPasswordSchema,
  SignUpDto,
  signupSchema,
  VerifyEmailChangeDto,
  verifyEmailChangeSchema,
  VerifyEmailDto,
  UpdateProfileDto,
  updateProfileSchema,
} from './auth.dto';
import { AuthService, JwtPayload } from './auth.service';
import { GetCurrentUser, GetCurrentUserId, Public } from './decorators';
import { Refresh } from './decorators/refresh.decorator';
import { RtGuard } from './guards';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { TUniqueId } from '../shared/types/type';
import { IpRestrictionGuard } from '../guards/ip-restriction.guard';
import { IpRestrictionInterceptor } from '../interceptors/ip-restriction.interceptor';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Register with unique email',
  })
  @Post('register/email')
  @UsePipes(new JoiValidationPipe(signupSchema, 'body'))
  async signUpWithEmail(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUpWithEmail(signUpDto);
    return UtilService.buildResponse({ user });
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Resend email verification OTP',
  })
  @Post('verify/email/resend')
  @UsePipes(new JoiValidationPipe(changeEmailSchema, 'body'))
  async resendEmailVerificationOtp(
    @Body() resendEmailVerificationOtpDto: ResendEmailVerificationOtpDto
  ) {
    await this.authService.resendEmailVerificationOtp(resendEmailVerificationOtpDto);
    return UtilService.buildResponse({});
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Login with email and password',
  })
  @Post('login/email')
  @UsePipes(new JoiValidationPipe(loginSchema, 'body'))
  async loginWithEmailPassword(@Body() loginDto: LoginDto) {
    const tokens = await this.authService.loginWithEmailPassword(loginDto);
    return UtilService.buildResponse({ tokens });
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Send forgot password link to reset password',
  })
  @Post('forgot-password')
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema, 'body'))
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return UtilService.buildResponse({});
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh token',
  })
  @Refresh()
  @Get('refresh')
  @UseGuards(RtGuard)
  async refresh(@GetCurrentUser() userFromToken: JwtPayload) {
    const tokens = await this.authService.refreshToken(userFromToken);

    return UtilService.buildResponse({ tokens });
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Reset Password',
  })
  @Post('reset-password')
  @UsePipes(new JoiValidationPipe(resetPasswordSchema, 'body'))
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return UtilService.buildResponse({}, 'Password is reset successfully');
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'return logged in user details',
  })
  @Get('/me')
  async me(@GetCurrentUser() userFromToken: JwtPayload) {
    const user = await this.authService.me(userFromToken);
    return UtilService.buildResponse({ user });
  }

  @ApiOperation({ summary: 'Update the logged-in user profile (name, email)' })
  @Patch('/me')
  @UsePipes(new JoiValidationPipe(updateProfileSchema, 'body'))
  async updateMe(@GetCurrentUserId() userId: string, @Body() dto: UpdateProfileDto) {
    const user = await this.authService.updateProfile(userId, dto);
    return UtilService.buildResponse({ user });
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary:
      'Call this url with id_token to generate token after successful authentication by google internally',
  })
  @Get('google')
  @UsePipes(new JoiValidationPipe(tokenSchema, 'query'))
  async googleAuth(@Query('id_token') idToken: string) {
    const tokens = await this.authService.handleGoogleAuth(idToken);
    return UtilService.buildResponse({ tokens });
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    
    summary:
      'Call this url with fb access_token to generate token after successful authentication by facebook internally',
  })
  @Get('facebook')
  @UsePipes(new JoiValidationPipe(tokenSchema, 'query'))
  async fbAuth(@Query('access_token') accessToken: string) {
    const tokens = await this.authService.handleFbAuth(accessToken);
    return UtilService.buildResponse({ tokens });
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request Email change',
  })
  @Post('request-email-change')
  @UsePipes(new JoiValidationPipe(changeEmailSchema, 'body'))
  async requestChangeEmail(
    @GetCurrentUserId() userId: TUniqueId,
    @Body() requestChangeEmailDto: RequestChangeEmailDto
  ) {
    await this.authService.requestChangeEmail(userId, requestChangeEmailDto);
    return UtilService.buildResponse({});
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Verify Email change',
  })
  @Post('verify-email-change')
  @UsePipes(new JoiValidationPipe(verifyEmailChangeSchema, 'body'))
  async verifyChangeEmail(@Body() verifyEmailChangeDto: VerifyEmailChangeDto) {
    await this.authService.verifyEmailChange(verifyEmailChangeDto);
    return UtilService.buildResponse({});
  }

  @Public()
  @UseGuards(IpRestrictionGuard)
  @UseInterceptors(IpRestrictionInterceptor)
  @ApiOperation({
    summary: 'Verify Email Id of the user',
  })
  @Post('verify/email')
  @UsePipes(new JoiValidationPipe(verifyEmailChangeSchema, 'body'))
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user = await this.authService.verifyEmail(verifyEmailDto);
    const tokens = await this.authService.getTokens(user);
    return UtilService.buildResponse({ tokens });
  }

  @Public()
  @ApiOperation({
    summary: 'Request OTP for phone login/signup (WhatsApp in prod, dev bypass in non-prod)',
  })
  @Post('otp/request')
  @UsePipes(new JoiValidationPipe(requestOtpSchema, 'body'))
  async requestPhoneOtp(@Body() body: RequestOtpDto) {
    const result = await this.authService.requestPhoneOtp(body.phone, body.intent ?? 'LOGIN');
    return UtilService.buildResponse(result);
  }

  @Public()
  @ApiOperation({
    summary: 'Verify OTP and login/signup',
  })
  @Post('otp/verify')
  @UsePipes(new JoiValidationPipe(verifyOtpSchema, 'body'))
  async verifyPhoneOtp(@Body() body: VerifyOtpDto) {
    const result = await this.authService.verifyPhoneOtp(body.phone, body.code);
    return UtilService.buildResponse(result);
  }
}
