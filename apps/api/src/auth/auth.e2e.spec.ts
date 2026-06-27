import { AppModule } from '../app.module';
import { TestSuite } from '../test.suite';
import { AuthFixture } from './auth.fixture';
import { createMock } from '@golevelup/ts-jest';
import { RedisService } from '../shared/util/redis.service';
import { NotificationService } from '../notification/notification.service';
import { User } from '@prisma/client';
import { jwtDecode } from 'jwt-decode';
import { http, HttpResponse } from 'msw';

describe('Auth controller', () => {
  const mockRedisService = createMock<RedisService>({
    setData: jest.fn(),
    getData: jest.fn(),
    deleteData: jest.fn(),
  });
  const mockNotificationService = createMock<NotificationService>({
    sendNotification: jest.fn(),
  });

  const app = new TestSuite(
    AppModule,
    [AuthFixture],
    [
      {
        provide: RedisService,
        useValue: mockRedisService,
      },
      {
        provide: NotificationService,
        useValue: mockNotificationService,
      },
    ]
  );

  app.mockHttpServer.use(
    http.get(`https://oauth2.googleapis.com/tokeninfo`, ({ request }) => {
      const googleToken = new URL(request.url).searchParams.get('id_token');

      switch(googleToken){
        case 'existing_user_id_token': {
          const { email }: User = app.getReference(AuthFixture.GOOGLE_USER);
          return HttpResponse.json({ email });
        }
        case 'other_existing_user_id_token': {
          const { email }: User = app.getReference(AuthFixture.USER_1);
          return HttpResponse.json({ email });
        }
        case 'new_user_id_token': {
          return HttpResponse.json({
            email: 'new_google_user@example.com',
            given_name: 'Given_user_name',
            family_name: 'last_name',
          });
        }
        default: 
          return new HttpResponse(null, { status: 400 });
      }
    }),
    http.get(`https://graph.facebook.com/v16.0/me`, ({ request }) => {
      const fbToken = new URL(request.url).searchParams.get('access_token');

      switch(fbToken){
        case 'existing_user_id_token': {
          const { email }: User = app.getReference(AuthFixture.FACEBOOK_USER);
          return HttpResponse.json({ email });
        }
        case 'banned_user_id_token': {
          const { email }: User = app.getReference(AuthFixture.BANNED_FACEBOOK_USER);
          return HttpResponse.json({ email });
        }
        case 'new_user_id_token': {
          return HttpResponse.json({
            email: 'new_fb_user@example.com',
            first_name: 'first_name',
            last_name: 'last_name',
          });
        }
        case 'other_existing_user_id_token': {
          const { email }: User = app.getReference(AuthFixture.USER_1);
          return HttpResponse.json({ email });
        }
        default: 
          return new HttpResponse(null, { status: 400 });
      }
    })
  );

  const invalidCredentialError = 'Invalid credentials';
  const urlPrefix = '/auth';

  describe('Register with email and password', () => {
    const url = urlPrefix + '/register/email';

    it('should not allow to register user if email already exists', async () => {
      const { email }: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('POST', url, {
        data: {
          email,
          password: 'Pass@123',
        },
      });

      expect(res.status).toBe(409);
    });

    it('should not register user if password is invalid', async () => {
      const res = await app.exec('POST', url, {
        data: {
          email: 'jane@example.com',
          password: '123456',
        },
      });

      expect(res.status).toBe(400);
    });

    it('should register user if email and password are valid', async () => {
      const res = await app.exec('POST', url, {
        data: {
          email: 'jane@example.com',
          password: 'Pass@123',
        },
      });

      expect(res.status).toBe(201);
    });
  });

  describe('Resend email verification OTP', () => {
    const url = urlPrefix + '/verify/email/resend';

    it('should throw error if email does not exist', async () => {
      const res = await app.exec('POST', url, {
        data: {
          email: 'non_esisting_user@email.com',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should throw error if email is already verified', async () => {
      const user: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('POST', url, {
        data: {
          email: user.email,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('Email already verified');
    });

    it('should send email verification email', async () => {
      const user: User = app.getReference(AuthFixture.UNVERIFIED_USER);

      const res = await app.exec('POST', url, {
        data: {
          email: user.email,
        },
      });

      expect(res.status).toBe(201);
      expect(mockRedisService.setData).toBeCalledTimes(1);
      expect(mockRedisService.setData.mock.calls[0]).toHaveLength(3);
      expect(mockRedisService.setData.mock.calls[0][0]).toEqual(
        // 1st argument
        expect.stringMatching(new RegExp(`^Email-verification-otp-(\\d+)-${user.email}$`))
      );
      expect(mockRedisService.setData.mock.calls[0]).toEqual(
        // 2nd,3rd arguments
        expect.arrayContaining([user.email, 300])
      );

      expect(mockNotificationService.sendNotification).toBeCalledTimes(1);
      expect(mockNotificationService.sendNotification.mock.calls[0]).toHaveLength(1); //called with one arg
      expect(mockNotificationService.sendNotification.mock.calls[0][0]).toHaveProperty('email');
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'recipients'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.recipients[0]).toEqual(
        expect.objectContaining({
          email: user.email,
        })
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'context'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.context).toEqual(
        expect.objectContaining({
          email: user.email,
        })
      );
    });
  });

  describe('Login with email and password', () => {
    const url = urlPrefix + '/login/email';

    it('should throw error if email does not exist', async () => {
      const res = await app.exec('POST', url, {
        data: {
          email: 'non_esisting_user@email.com',
          password: 'invalidPassword@0',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should throw error if password does not match', async () => {
      const user: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('POST', url, {
        data: {
          email: user.email,
          password: 'invalidPassword@0',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should return tokens when successfully logged in', async () => {
      const user: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('POST', url, {
        data: {
          email: user.email,
          password: 'Pass@123',
        },
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(typeof res.body.data.tokens.accessToken).toBe('string');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(typeof res.body.data.tokens.refreshToken).toBe('string');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          tokenType: 'refresh',
        })
      );
    });
  });

  describe('Request Email change', () => {
    const url = urlPrefix + '/request-email-change';

    it('should throw error if new email is same as the old email', async () => {
      const user: User = app.getReference(AuthFixture.USER_1);
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);

      const res = await app.exec('POST', url, {
        data: { email: user.email },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual('New email id cannot be same as old email id');
    });

    it('should throw error if new email already exists in database', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const user: User = app.getReference(AuthFixture.UNVERIFIED_USER);

      const res = await app.exec('POST', url, {
        data: { email: user.email },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual('An user with same email id already exists');
    });

    it('should throw error if user signup method is other than email', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.GOOGLE_USER);

      const res = await app.exec('POST', url, {
        data: { email: 'newUser@example.com' },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual('You are not signed up using email and password');
    });

    it('Send change email notification when email is valid', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const { email }: User = app.getReference(AuthFixture.USER_1);
      const newEmail = 'newUser@example.com';

      const res = await app.exec('POST', url, {
        data: { email: newEmail },
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(201);

      expect(mockRedisService.setData).toBeCalledTimes(1);
      expect(mockRedisService.setData.mock.calls[0]).toHaveLength(3);
      expect(mockRedisService.setData.mock.calls[0][0]).toEqual(
        expect.stringMatching(new RegExp(`^Verify-email-change-(\\d+)-${email}$`))
      );

      expect(mockNotificationService.sendNotification).toBeCalledTimes(1);
      expect(mockNotificationService.sendNotification.mock.calls[0]).toHaveLength(1);
      expect(mockNotificationService.sendNotification.mock.calls[0][0]).toHaveProperty('email');
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'recipients'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.recipients[0]).toEqual(
        expect.objectContaining({ email })
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'context'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.context).toEqual(
        expect.objectContaining({ email })
      );
    });
  });

  describe('Return logged in user details', () => {
    const url = urlPrefix + '/me';

    it('should throw error if token is not provided', async () => {
      const res = await app.exec('GET', url);

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized');
    });

    it('should return user details when valid token is provided', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const user: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('GET', url, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data.user).toEqual(
        expect.objectContaining({
          type: user.type,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          signupMethod: user.signupMethod,
        })
      );
    });
  });

  describe('Refresh token', () => {
    const url = urlPrefix + '/refresh';

    it('should throw error if token is not provided', async () => {
      const res = await app.exec('GET', url);

      expect(res.status).toBe(401);
      expect(res.body.message).toEqual('Unauthorized');
    });

    it('should throw error if wrong type of token is provided', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);

      const res = await app.exec('GET', url, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('Invalid token');
    });

    it('should return valid refresh token when a valid token is provided', async () => {
      const { refreshToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const user: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('GET', url, {
        headers: {
          authorization: `Bearer ${refreshToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
          tokenType: 'refresh',
        })
      );
    });
  });

  describe('Authentication via google', () => {
    const url = urlPrefix + '/google';

    it('should throw error if token is not provided', async () => {
      const res = await app.exec('GET', url);

      expect(res.status).toBe(400);
    });

    it('should throw error if wrong token is provided', async () => {
      const res = await app.exec('GET', url, {
        query: {
          id_token: 'invalid_id_token',
        },
      });

      expect(res.status).toBe(403);
    });

    it('should return tokens when a valid id_token of an existing user is provided', async () => {
      const res = await app.exec('GET', url, {
        query: {
          id_token: 'existing_user_id_token',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should return tokens when a valid id_token of a new user is provided', async () => {
      const res = await app.exec('GET', url, {
        query: {
          id_token: 'new_user_id_token',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          email: 'new_google_user@example.com',
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          email: 'new_google_user@example.com',
          tokenType: 'refresh',
        })
      );
    });

    it('should allow a user to log in even if not signed up with google', async () => {
      const res = await app.exec('GET', url, {
        query: {
          id_token: 'other_existing_user_id_token',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });
  });

  describe('Forgot password', () => {
    const url = urlPrefix + '/forgot-password';

    it('should throw error if email is not provided', async () => {
      const res = await app.exec('POST', url);

      expect(res.status).toBe(400);
    });

    it('should throw error if user does not exist', async () => {
      const res = await app.exec('POST', url, {
        data: {
          email: 'non_existing_user@example.com',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('Send Email with OTP', async () => {
      const { email }: User = app.getReference(AuthFixture.USER_1);

      const res = await app.exec('POST', url, { data: { email } });

      expect(res.status).toBe(201);
      expect(mockRedisService.setData).toBeCalledTimes(1);
      expect(mockRedisService.setData.mock.calls[0]).toHaveLength(3);
      expect(mockRedisService.setData.mock.calls[0][0]).toEqual(
        expect.stringMatching(new RegExp(`^Forgot-password-otp-(\\d+)-${email}$`))
      );

      expect(mockNotificationService.sendNotification).toBeCalledTimes(1);
      expect(mockNotificationService.sendNotification.mock.calls[0]).toHaveLength(1);
      expect(mockNotificationService.sendNotification.mock.calls[0][0]).toHaveProperty('email');
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'recipients'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.recipients[0]).toEqual(
        expect.objectContaining({ email })
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'context'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.context).toEqual(
        expect.objectContaining({ email })
      );
    });

    it('should allow a user to be able to request forgot password even if not signed up using email and password', async () => {
      const { email }: User = app.getReference(AuthFixture.FACEBOOK_USER);

      const res = await app.exec('POST', url, { data: { email } });

      expect(res.status).toBe(201);
      expect(mockRedisService.setData).toBeCalledTimes(1);
      expect(mockRedisService.setData.mock.calls[0]).toHaveLength(3);
      expect(mockRedisService.setData.mock.calls[0][0]).toEqual(
        expect.stringMatching(new RegExp(`^Forgot-password-otp-(\\d+)-${email}$`))
      );

      expect(mockNotificationService.sendNotification).toBeCalledTimes(1);
      expect(mockNotificationService.sendNotification.mock.calls[0]).toHaveLength(1);
      expect(mockNotificationService.sendNotification.mock.calls[0][0]).toHaveProperty('email');
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'recipients'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.recipients[0]).toEqual(
        expect.objectContaining({ email })
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email).toHaveProperty(
        'context'
      );
      expect(mockNotificationService.sendNotification.mock.calls[0][0].email.context).toEqual(
        expect.objectContaining({ email })
      );
    });
  });

  describe('Reset Password', () => {
    const url = urlPrefix + '/reset-password';

    it('should throw error if email, otp are not provided', async () => {
      const res = await app.exec('POST', url );

      expect(res.status).toBe(400);
    });

    it('should throw error if user does not exist', async () => {
      mockRedisService.getData.mockImplementation(() => Promise.resolve(''));

      const res = await app.exec(
        'POST',
        url,
        {
          data:{
            email: 'non_existing_user@example.com',
            otp: '123456',
            password: 'Pass@123'
          }
        }
      );

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should delete data in Redis and update password', async () => {
      const { email }: User = app.getReference(AuthFixture.USER_1);
      mockRedisService.getData.mockImplementation(() => Promise.resolve(`"${email}"`));

      const res = await app.exec(
        'POST', 
        url, 
        { 
          data: {
            email,
            otp: '123456',
            password: 'Pass@123'
          } 
        }
      );
        
      expect(res.status).toBe(201);
      expect(mockRedisService.deleteData).toBeCalledTimes(1);
      expect(mockRedisService.deleteData.mock.calls[0]).toHaveLength(1);
      expect(mockRedisService.deleteData.mock.calls[0][0]).toEqual(    
        expect.stringMatching(new RegExp(`^Forgot-password-otp-(\\d+)-${email}$`))
      );
      
    });
  });

  describe('Authentication via facebook', () => {
    const url = urlPrefix + '/facebook';

    it('should throw error if access_token is not provided', async () => {
      const res = await app.exec('GET', url);

      expect(res.status).toBe(400);
    });

    it('should throw error if wrong token is provided', async () => {
      const res = await app.exec('GET', url, {
        query: {
          access_token: 'invalid_id_token',
        },
      });

      expect(res.status).toBe(403);
    });

    it('should throw error if user is banned', async () => {
      const res = await app.exec('GET', url, {
        query: {
          access_token: 'banned_user_id_token',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.message).toEqual('You have been banned from using the platform');
    });

    it('should return tokens when a valid id_token of an existing user is provided', async () => {
      const { email }: User = app.getReference(AuthFixture.FACEBOOK_USER);
      const res = await app.exec('GET', url, {
        query: {
          access_token: 'existing_user_id_token',
        },
      });


      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          email,
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          email,
          tokenType: 'refresh',
        })
      );
    });

    it('should return tokens when a valid id_token of a new user is provided', async () => {
      const res = await app.exec('GET', url, {
        query: {
          access_token: 'new_user_id_token',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          email: 'new_fb_user@example.com',
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          email: 'new_fb_user@example.com',
          tokenType: 'refresh',
        })
      );
    });

    it('should allow a user to log in even if not signed up with facebook', async () => {
      const res = await app.exec('GET', url, {
        query: {
          access_token: 'other_existing_user_id_token',
        },
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });
  });

  describe('Verify Email Id of the user', () => {
    const url = urlPrefix + '/verify/email';

    it('should throw error if email and otp are not provided', async () => {
      const res = await app.exec('POST', url);

      expect(res.status).toBe(400);
    });

    it('should throw error if user does not exist in redis', async () => {
      mockRedisService.getData.mockImplementation(() => Promise.resolve(''));

      const res = await app.exec(
        'POST',
        url,
        {
          data:{
            email: 'non_existing_user@example.com',
            otp: '123456'
          }
        }
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should throw error if user does not exist in db', async () => {
      mockRedisService.getData.mockImplementation(() => Promise.resolve('"non_existing_user@example.com"'));

      const res = await app.exec(
        'POST',
        url,
        {
          data:{
            email: 'non_existing_user@example.com',
            otp: '123456'
          }
        }
      );

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should delete data in Redis and return tokens', async () => {
      const { email }: User = app.getReference(AuthFixture.UNVERIFIED_USER);
      mockRedisService.getData.mockImplementation(() => Promise.resolve(`"${email}"`));

      const res = await app.exec(
        'POST', 
        url, 
        { 
          data: {
            email,
            otp: '123456'
          } 
        }
      );
        
      expect(res.status).toBe(201);
      expect(mockRedisService.deleteData).toBeCalledTimes(1);
      expect(mockRedisService.deleteData.mock.calls[0]).toHaveLength(1);
      expect(mockRedisService.deleteData.mock.calls[0][0]).toEqual(    
        expect.stringMatching(new RegExp(`^Email-verification-otp-(\\d+)-${email}$`))
      );
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(jwtDecode(res.body.data.tokens.accessToken)).toEqual(
        expect.objectContaining({
          email,
          tokenType: 'access',
        })
      );
      expect(jwtDecode(res.body.data.tokens.refreshToken)).toEqual(
        expect.objectContaining({
          email,
          tokenType: 'refresh',
        })
      );
    });
  });

  describe('Verify Email change', () => {
    const url = urlPrefix + '/verify-email-change';

    it('should throw error if email and otp are not provided', async () => {
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const res = await app.exec('POST', url, {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(400);
    });

    it('should throw error if data does not exist in redis', async () => {
      mockRedisService.getData.mockImplementation(() => Promise.resolve(''));

      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);
      const res = await app.exec(
        'POST',
        url,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          data:{
            email: 'non_existing_user@example.com',
            otp: '123456'
          }
        }
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(invalidCredentialError);
    });

    it('should delete data in Redis and update email', async () => {
      const { id, email }: User = app.getReference(AuthFixture.USER_1);
      mockRedisService.getData.mockImplementation(() => Promise.resolve(`"${id}"`));
      const { accessToken } = await app.generateTokensForUser(AuthFixture.USER_1);

      const res = await app.exec(
        'POST', 
        url, 
        { 
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
          data: {
            email,
            otp: '123456'
          } 
        }
      );
        
      expect(res.status).toBe(201);
      expect(mockRedisService.deleteData).toBeCalledTimes(1);
      expect(mockRedisService.deleteData.mock.calls[0]).toHaveLength(1);
      expect(mockRedisService.deleteData.mock.calls[0][0]).toEqual(    
        expect.stringMatching(new RegExp(`^Verify-email-change-(\\d+)-${email}$`))
      );
    });
  });
});