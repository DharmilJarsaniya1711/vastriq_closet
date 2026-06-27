# NestApp

This NestApp mejjos-boilerplate made using nest js frame work.

## Installation Guide

To install all the dependencies of the project, run the following command:
```sh
cd apps/api
pnpm install
```
## Usage

To start the application,run the following command:
```sh
cd apps/api
pnpm copy-env
pnpm dev:mongo
pnpm dev:redis
pnpm dev:fixtures
pnpm dev
```

Connect to the API using Postman on port 5000.

# production mode
```
$ pnpm run start:prod
```

## 1. What is included in the API?

| HTTP method | Endpoints                          | Action                                 |
| ---------- | -----------------------------------| -------------------------------------- |
| POST       | /api/auth/register/email | Allows users to sign up using email and password |
| POST       | /api/auth/login/email | Allows users to sign in using email and password  |
| POST     | /api/auth/forgot-password | Initiates the process to reset password using OTP |
| POST     | /api/auth/reset-password |  Resets user password using OTP |
| GET        | /api/auth/google| Allows users to sign in using Google |
| GET        | /api/auth/facebook| Allows users to sign in using Facebook |
| POST        | /files/upload| Uploads a file to Amazon S3 |
| DELETE        | /files/delete/:id| Deletes a file from Amazon S3|

## Rate Limiting

Rate limiting is automatically applied to all routes by default .

**Rate limiting config is set in .env with following variables**

`DEFAULT_THROTTLE_TIME= 60 #minutes`  
`DEFAULT_THROTTLE_LIMIT=60 #Total calls allowed per time`

**To disable a route or controller from rate limiting use**

```
@SkipThrottle()
```

Example:

```
@SkipThrottle()
@Controller('users')
export class UsersController {
  // Rate limiting is applied to this route.
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // This route will skip rate limiting.
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

**Override default configuration for Rate limiting and duration.**

```
@Throttle({ default: { limit: 3, ttl: 60000 } })
@Get()
findAll() {
  return "List users works with custom rate limiting.";
}
```
The above route will have a rate limit of 3 calls per minute.

[Read more in documentation](https://www.npmjs.com/package/@nestjs/throttler)

## Brute force prevention

To guard public routes against brute force attacks use IpRestrictionGuard

```Javascript
@Public()
@UseGuards(IpRestrictionGuard)
@ApiOperation({
   summary: 'Login with email and password',
})
@Post('login/email')
async loginWithEmailPassword(@Body() loginDto: LoginDto) {
  const tokens = await this.authService.loginWithEmailPassword(loginDto);
  return UtilService.buildResponse({ tokens });
}
```
## Tech stack
* NodeJS
* NestJs
* ExpressJS
* MongoDB
* Prisma 
* Redis 
* AWS 
