import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppConfigService } from '../app-config/app-config.service';

export interface ISendEmailOptions {
  email: string;
  from?: string;
  subject: string;
  template: string;
  context: object;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: AppConfigService,
  ) {}

  async sendEmail({
    email,
    subject,
    template,
    context,
    from = this.configService.smtp.from,
  }: ISendEmailOptions) {
    return await this.mailerService.sendMail({
      to: email,
      template,
      context: {
        ...context,
        subject,
      },
      subject,
      from: `"No reply" <${from}>`,
      /**
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, 'templates', 'assets', 'logo.png'), // the logo.png file should be present in src/email/templates/assets/logo.png
          cid: 'logo@iloho.com',
        }
      ],
       */
    });
  }
}
