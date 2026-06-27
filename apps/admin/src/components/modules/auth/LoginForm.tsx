import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, PasswordInput, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useLogin } from '@/apis/queries/auth.queries';
import { ILoginRequest } from '@/types/entities/auth.types';
import { cn } from '@/utils/helper';
import yup from '@/utils/yup';

import useZStore from '../../../store';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../../utils/constants';

const schema: yup.ObjectSchema<ILoginRequest> = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required().min(6),
});

interface LoginFormProps {
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const form = useForm<ILoginRequest>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const login = useLogin();
  const navigate = useNavigate();
  const { updateUser } = useZStore();

  const handleSubmit = form.handleSubmit((data) => {
    login.mutate(data, {
      onSuccess: ({ user, tokens }) => {
        notifications.show({
          title: 'Success',
          message: 'Login successful',
        });

        localStorage.setItem(ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN, tokens.refreshToken);

        form.reset();

        updateUser(user);

        navigate('/dashboard');
      },
    });
  });

  return (
    <form onSubmit={handleSubmit} className={cn(className)}>
      <TextInput
        {...form.register('email')}
        error={form.formState.errors.email?.message}
        type="email"
        placeholder="Email"
        required
        className="mb-4"
      />
      <PasswordInput
        {...form.register('password')}
        error={form.formState.errors.password?.message}
        placeholder="Password"
        type="password"
        required
        className="mb-4"
      />

      <Button type="submit" fullWidth loading={login.isPending}>
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
