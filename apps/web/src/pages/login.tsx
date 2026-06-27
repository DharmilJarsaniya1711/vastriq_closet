import { useState } from 'react';
import { Alert, Button, PinInput, TextInput } from '@mantine/core';
import { setCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { requestPhoneOtp, verifyPhoneOtp } from '@/apis/requests/auth.requests';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/utils/constants';

type Step = 'phone' | 'otp';

const Login = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devHint, setDevHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPhone = async () => {
    setError(null);
    if (!/^\+?[1-9]\d{7,14}$/.test(phone.trim())) {
      setError('Enter a valid mobile number (e.g. +919876543210).');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPhoneOtp(phone.trim());
      // No SMS/WhatsApp provider yet — the API returns the generated code so we can
      // show it on screen for testing. Works for new and existing numbers alike.
      if (res?.data?.devCode) setDevHint(`Your OTP (dev): ${res.data.devCode}`);
      setStep('otp');
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await verifyPhoneOtp(phone.trim(), code);
      const { accessToken, refreshToken } = res.data.tokens;
      setCookie(ACCESS_TOKEN, accessToken);
      setCookie(REFRESH_TOKEN, refreshToken);
      // Return the user to the page they were trying to reach, if any.
      const next = router.query.next;
      const dest = typeof next === 'string' && next.startsWith('/') ? next : '/';
      router.push(dest);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream-50 px-4">
      <NextSeo title="Login — VASTRIQ CLOSET" />
      <div className="w-full max-w-md rounded-lg border border-gold-200 bg-cream-25 p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="vc-wordmark text-xs text-gold-700">
            Vastriq Closet
          </Link>
          <h1 className="mt-3 font-serif text-3xl text-primary-900">
            {step === 'phone' ? 'Login or sign up' : 'Enter the code'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {step === 'phone'
              ? 'Enter your mobile number. New numbers create an account automatically.'
              : `Code for ${phone}`}
          </p>
        </div>

        {error && (
          <Alert color="danger" mb="md" variant="light">
            {error}
          </Alert>
        )}

        {step === 'phone' && (
          <div className="space-y-5">
            <TextInput
              label="Mobile number"
              placeholder="+91 99999 00001"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
              size="md"
              autoFocus
            />
            <Button fullWidth size="md" color="primary" loading={loading} onClick={submitPhone}>
              Send OTP
            </Button>
            <div className="text-center text-xs text-gray-400">
              By continuing you agree to our{' '}
              <Link href="/legal/terms" className="text-primary-700 hover:underline">
                Terms
              </Link>
              .
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <PinInput
                length={6}
                size="md"
                oneTimeCode
                type="number"
                value={code}
                onChange={setCode}
              />
            </div>
            {devHint && (
              <p className="text-center text-xs text-gold-700">{devHint}</p>
            )}
            <Button
              fullWidth
              size="md"
              color="primary"
              loading={loading}
              disabled={code.length !== 6}
              onClick={submitOtp}
            >
              Verify & continue
            </Button>
            <button
              type="button"
              className="block w-full text-center text-xs text-gray-400 hover:text-primary-900"
              onClick={() => {
                setCode('');
                setStep('phone');
              }}
            >
              ← Use a different number
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Login;
