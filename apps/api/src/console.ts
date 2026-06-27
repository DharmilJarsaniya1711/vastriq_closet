import { BootstrapConsole } from 'nestjs-console';
import { AppModule } from './app.module';

const bootstrap = (module: AppModule) => {
  const bootstrap = new BootstrapConsole({
    module,
    useDecorators: true,
  });
  bootstrap.init().then(async (app) => {
    try {
      await app.init();
      app.enableShutdownHooks();

      await bootstrap.boot();
      await app.close();
    } catch (e) {
      console.error(e);
      await app.close();
      process.exit(1);
    }
  });
};

bootstrap(AppModule);
