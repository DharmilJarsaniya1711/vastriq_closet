import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { ISendNotificationOption } from './notification.service';
import { NOTIFICATION_QUEUE } from './queue.config';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {}
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('add')
  async handleTranscode(job: Job) {
    const { data } = job;
    const options = data as ISendNotificationOption;

    const promises = [];

    Object.keys(options).map((optionName) => {
      const option = options[optionName];

      const { template, context, subject, from } = option;

      if (optionName === 'email') {
        option.recipients.forEach(({ email }) => {
          promises.push(
            this.emailService.sendEmail({
              email,
              from,
              subject,
              template,
              context,
            })
          );
        });
      }
      if (optionName === 'inApp') {
        const { title, body, meta } = option;
        option.recipients.forEach(({ id }) => {
          promises.push(
            this.prismaService.notification.create({
              data: {
                forId: id,
                title,
                body,
                meta: JSON.stringify(meta),
              },
            })
          );
        });
      }
    });

    if (promises.length) {
      await Promise.allSettled(promises);
    }
  }
}
