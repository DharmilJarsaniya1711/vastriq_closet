import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConsoleModule } from 'nestjs-console';
import { JoiPipeModule } from 'nestjs-joi';
import { joiConfig } from '../config/joi.config';
import { mailerConfig } from '../config/mailer.config';
import { BullConfigService } from '../config/queueConfig';
import { throttleConfig } from '../config/throttle.config';
import { AppCacheModule } from './app-cache/app-cache.module';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards';
import { ImagekitModule } from './imagekit/imagekit.module';
import { CatalogModule } from './catalog/catalog.module';
import { CmsModule } from './cms/cms.module';
import { ContactModule } from './contact/contact.module';
import { configOptions } from './config/config';
import { EmailModule } from './email/email.module';
import { FileModule } from './file/file.module';
import { NotificationModule } from './notification/notification.module';
import { OutfitsModule } from './outfits/outfits.module';
import { OtpModule } from './otp/otp.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SettingsModule } from './settings/settings.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { FixturesModule } from './shared/fixture/fixture.module';
import { SeederModule } from './shared/seeder/seeder.module';
import { UtilModule } from './shared/util/util.module';

@Module({
  imports: [
    AppConfigModule,
    JoiPipeModule.forRoot(joiConfig),
    ConfigModule.forRoot(configOptions),
    PrismaModule,
    MailerModule.forRootAsync(mailerConfig),
    EmailModule,
    FileModule,
    ImagekitModule,
    AuthModule,
    OtpModule,
    NotificationModule,
    UtilModule,
    BullModule.forRootAsync({ useClass: BullConfigService }),
    ConsoleModule,
    FixturesModule,
    ThrottlerModule.forRootAsync(throttleConfig),
    JwtModule.register({}),
    AppCacheModule,
    SeederModule,
    CatalogModule,
    OutfitsModule,
    AdminModule,
    ReportsModule,
    ReviewsModule,
    WishlistModule,
    CmsModule,
    ContactModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // All APIs require auth by default. For public APIs decorate it with @Public
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
