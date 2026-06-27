import validator from 'validator';
import * as yup from 'yup';

yup.addMethod<yup.StringSchema>(yup.string, 'stripEmptyString', function transform() {
  return this.transform((value: string) => (value === '' ? undefined : value));
});

yup.addMethod<yup.StringSchema>(yup.string, 'password', function password() {
  return this.test({
    name: 'isPasswordValid',
    message:
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, 1 special character and minimum 6 characters',
    test: (value) =>
      validator.isStrongPassword(value ?? '', {
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }),
  });
});

export default yup;
