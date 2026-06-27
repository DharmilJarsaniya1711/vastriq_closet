import { AppConfigService } from '../src/app-config/app-config.service';
import * as path from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

const emailConfig = (appConfigService) => ({
  transport: {
    host: appConfigService.smtp.host,
    port: appConfigService.smtp.port,
    secure: false,
    auth: {
      user: appConfigService.smtp.username,
      pass: appConfigService.smtp.password,
    },
  },
  defaults: {
    from: `"No Reply" <${appConfigService.smtp.from}>`,
  },
  template: {
    dir: path.join(__dirname, '..', 'src', 'email', 'templates'),
    adapter: new HandlebarsAdapter(),
  },
  options: {
    strict: true,
    partials: {
      dir: path.join(__dirname, 'email', 'templates', 'partials'),
      options: {
        strict: true,
      },
    },
  },
});

export const mailerConfig = {
  inject: [AppConfigService],
  useFactory: (appConfigService: AppConfigService) => emailConfig(appConfigService),
};
