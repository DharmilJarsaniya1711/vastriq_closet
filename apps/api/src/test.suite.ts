/* eslint-disable @typescript-eslint/no-unused-vars */
import { ClassProvider, INestApplication, Logger, Type, ValueProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FixturesService } from './shared/fixture/fixture.service';
import { FixtureReferenceService } from './shared/fixture/fixtureReference.service';
import * as request from 'supertest';
import { User } from '@prisma/client';
import { http, passthrough } from 'msw';
import { setupServer } from 'msw/node';

export class TestSuite {
  public app: INestApplication;
  private testingModule: TestingModule;
  public references?: FixtureReferenceService;
  public mockHttpServer?: any;

  constructor(
    AppModule: any,
    fixtures: any[],
    overrideProviders: (ClassProvider | ValueProvider)[] = []
  ) {
    this.mockHttpServer = setupServer(
      http.post('*', (_) => passthrough()),
      http.get('*', (_) => passthrough())
    );

    beforeAll(async () => {
      process.env.__MONGO_TEST_COUNT = (process.env.__MONGO_TEST_COUNT || '1') + 1;
      const dbName =
        'test_' + process.env.__MONGO_TEST_COUNT + '_' + Math.random().toString(36).substring(2);

      const uri = process.env.__DATABASE_URL;
      const uriWithDb = uri.replace('/?', `/${dbName}?`);
      process.env.DATABASE_URL = uriWithDb;

      this.mockHttpServer.listen({
        onUnhandledRequest: 'bypass',
      });
    });

    beforeEach(async () => {
      const testingModuleBuilder = Test.createTestingModule({
        imports: [AppModule],
      });

      for (const provider of overrideProviders) {
        if ('useClass' in provider) {
          testingModuleBuilder.overrideProvider(provider.provide).useClass(provider.useClass);
        } else if ('useValue' in provider) {
          testingModuleBuilder.overrideProvider(provider.provide).useValue(provider.useValue);
        }
      }

      this.testingModule = await testingModuleBuilder.compile();

      this.app = this.testingModule.createNestApplication({
        rawBody: true,
      });
      // Disable logging during tests:
      Logger.overrideLogger([]);

      await this.app.init();

      await this.app.get(FixturesService).importFixtures(fixtures.map((f: any) => this.app.get(f)));

      this.references = this.app.get(FixtureReferenceService);
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await this.app.close();
    });

    afterAll(() => this.mockHttpServer.close());
  }

  getHttpServer() {
    return this.app.getHttpServer();
  }

  getReference(name): any {
    return this.references.getReference(name);
  }

  get<T>(typeOrToken: Type<T>): T {
    return this.testingModule.get<T>(typeOrToken);
  }

  async exec(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    options?: { data?: any; headers?: any; query?: any }
  ): Promise<any> {
    const server = request(this.app.getHttpServer());

    // Use the specified HTTP method dynamically
    const requestBuilder = server[method.toLowerCase()](url);

    if (options?.headers) {
      requestBuilder.set(options.headers);
    }

    if (options?.query) {
      requestBuilder.query(options.query);
    }

    if (
      !['GET', 'DELETE'].includes(method) &&
      options &&
      (options?.data !== undefined || options?.data !== null)
    ) {
      requestBuilder.send(options.data);
    }

    const response = await requestBuilder;
    return response;
  }

  async generateTokensForUser(
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email }: User = this.getReference(userId);

    const res = await this.exec('POST', '/auth/login/email', {
      data: {
        email,
        password: 'Pass@123',
      },
    });

    return res.body.data.tokens;
  }
}
