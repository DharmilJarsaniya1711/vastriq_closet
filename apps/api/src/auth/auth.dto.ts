import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

const passwordSchema = Joi.string()
  .trim()
  .min(8)
  .max(32)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
  .messages({
    'string.pattern.base':
      'password must be contain at least 1 uppercase letter, 1 lowercase letter, 1 digit and 1 special character',
  })
  .required();

const identifierErrorCode = 'password.identifier';
const identifierError = 'Password cannot contain values from email';

// Put it in the parent schema to access both password and identifier
const checkForIdentifier =
  (passwordKey: string, identifierKey: string): Joi.CustomValidator =>
  (valueObj, helper) => {
    const password = valueObj[passwordKey]?.trim?.().toLowerCase();
    let identifier = valueObj[identifierKey]?.trim?.().toLowerCase();

    // Email
    if (identifier?.includes('@')) {
      identifier = identifier.split('@')[0];
    }

    if (password?.includes?.(identifier)) {
      return helper.error(identifierErrorCode);
    }

    return valueObj;
  };

export const signupSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: passwordSchema,
})
  .custom(checkForIdentifier('password', 'email'))
  .messages({
    [identifierErrorCode]: identifierError,
  });

export class SignUpDto {
  @ApiProperty({
    example: 'john@doe.com',
  })
  email: string;

  @ApiProperty({
    example: 'Pass@123',
  })
  password: string;
}

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});
export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email to send password reset link',
    example: 'john@doe.com',
  })
  email: string;
}

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.number().integer().positive().required(),
  password: passwordSchema,
})
  .custom(checkForIdentifier('password', 'email'))
  .messages({
    [identifierErrorCode]: identifierError,
  });

export class ResetPasswordDto {
  @ApiProperty({
    example: '123456',
  })
  otp: string;

  @ApiProperty({
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    example: 'Pass@123',
    description: 'New Password',
  })
  password: string;
}

export const loginSchema = Joi.object({
  email: Joi.string().trim().required(),
  password: passwordSchema,
});

export class LoginDto {
  @ApiProperty({
    example: 'test@user.com',
  })
  email: string;

  @ApiProperty({
    example: 'Pass@123',
  })
  password: string;
}

export const verifyEmailSchema = Joi.object({
  otp: Joi.number().integer().positive().required(),
  email: Joi.string().trim().email().required(),
});

export class VerifyEmailDto {
  @ApiProperty({
    example: '123456',
  })
  otp: string;

  @ApiProperty({
    example: 'test@test.com',
  })
  email: string;
}

export const changeEmailSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

export class ResendEmailVerificationOtpDto {
  @ApiProperty({
    example: 'john@doe.com',
  })
  email: string;
}

export class RequestChangeEmailDto {
  @ApiProperty({
    description: 'New email id',
    example: 'john@doe.com',
  })
  email: string;
}

export const verifyEmailChangeSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.number().integer().positive().required(),
});

export class VerifyEmailChangeDto {
  @ApiProperty({
    example: '123456',
  })
  otp: string;
  @ApiProperty({
    example: 'test@test.com',
  })
  email: string;
}

export const tokenSchema = Joi.string().required();
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().max(60).allow('', null),
  lastName: Joi.string().trim().max(60).allow('', null),
  // tlds.allow=false → accept any well-formed email (incl. .local test domains)
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .allow('', null),
}).min(1);

export interface UpdateProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}
