import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './app-config/app-config.service';

async function bootstrap() {
  BigInt.prototype['toJSON'] = function () {
    return Number(this.toString());
  };
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'Bearer',
    })
    .build();

  const options: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, options);

  const loggerService = new Logger('Main');
  const appConfigService: AppConfigService = app.get(AppConfigService);

  const corsOptions = {
    origin: appConfigService.cors.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };

  app.enableCors(corsOptions);

  // Hosts like Render/Railway inject the port via $PORT; fall back to APP_PORT locally.
  const port = process.env.PORT || appConfigService.app.port;
  await app.listen(port, '0.0.0.0').then(() => {
    loggerService.debug(`\n\n\nAPP started on port ${port}/api`);
  });
}
bootstrap();
