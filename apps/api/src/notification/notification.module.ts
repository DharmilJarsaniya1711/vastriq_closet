import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { NOTIFICATION_QUEUE } from './queue.config';

@Global()
@Module({
  providers: [NotificationService, NotificationProcessor],
  imports: [
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),
    EmailModule,
    PrismaModule,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
