import { AppModule } from '../app.module';
import { TestSuite } from '../test.suite';

describe('Auth - Password Validation', () => {
  const app = new TestSuite(AppModule, [], []);
  const url = '/auth/register/email';
  const email = 'jane@example.com';
  it('should throw error if password does not contain a capital letter', async () => {
    const res = await app.exec('POST', url, {
      data: {
        email,
        password: 'pass@123',
      },
    });

    expect(res.status).toBe(400);
  });

  it('should throw error if password does not contain a small letter', async () => {
    const res = await app.exec('POST', url, {
      data: {
        email,
        password: 'PASS@123',
      },
    });
    expect(res.status).toBe(400);
  });

  it('should throw error if password does not contain a special character', async () => {
    const res = await app.exec('POST', url, {
      data: {
        email,
        password: 'Pass1234',
      },
    });

    expect(res.status).toBe(400);
  });

  it('should throw error if password does not contain a number', async () => {
    const res = await app.exec('POST', url, {
      data: {
        email,
        password: 'Pass@',
      },
    });

    expect(res.status).toBe(400);
  });

  it('should register user if password is valid', async () => {
    const res = await app.exec('POST', url, {
      data: {
        email,
        password: 'Pass@123',
      },
    });

    expect(res.status).toBe(201);
  });
});
