import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppCacheModule } from '../app-cache/app-cache.module';
import { OtpModule } from '../otp/otp.module';
import { AuthController } from './auth.controller';
import { AuthFixture } from './auth.fixture';
import { AuthSeeder } from './auth.seeder';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({}), HttpModule, AppCacheModule, OtpModule],
  providers: [AuthService, AuthSeeder, AtStrategy, RtStrategy, AuthFixture],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
