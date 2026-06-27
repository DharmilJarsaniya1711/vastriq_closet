import { useEffect, useState } from 'react';
import { Alert, Button, Loader, TextInput } from '@mantine/core';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { useMe, useUpdateMe } from '@/apis/queries/auth.queries';
import StoreShell from '@/components/layouts/StoreShell';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/utils/constants';

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex justify-between border-b border-gold-100 py-3 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-medium text-primary-900">{value || '—'}</span>
  </div>
);

const AccountPage = () => {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();
  const updateMe = useUpdateMe();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName([user.firstName, user.lastName].filter(Boolean).join(' '));
      setEmail(user.email ?? '');
    }
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const [firstName, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
    try {
      await updateMe.mutateAsync({
        firstName: firstName ?? '',
        lastName: rest.join(' '),
        email: email.trim(),
      });
      setMsg('Profile updated.');
    } catch (err) {
      setMsg((err as Error).message || 'Could not update profile.');
    }
  };

  const logout = () => {
    deleteCookie(ACCESS_TOKEN);
    deleteCookie(REFRESH_TOKEN);
    router.push('/');
  };

  if (isLoading) {
    return (
      <StoreShell>
        <div className="flex h-96 items-center justify-center">
          <Loader color="primary" />
        </div>
      </StoreShell>
    );
  }

  if (isError || !user) {
    return (
      <StoreShell>
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary-900">Please log in</h1>
          <p className="mt-3 text-sm text-gray-500">
            You need to be signed in to view your account.
          </p>
          <Button className="mt-6" color="primary" component={Link} href="/login">
            Login
          </Button>
        </section>
      </StoreShell>
    );
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Vastriq member';

  return (
    <StoreShell>
      <NextSeo title="My account — VASTRIQ CLOSET" />
      <section className="container mx-auto max-w-3xl px-6 py-12">
        <p className="vc-wordmark text-xs text-gold-700">Account</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">{name}</h1>

        <form
          onSubmit={saveProfile}
          className="mt-8 space-y-4 rounded-lg border border-gold-200 bg-cream-25 p-6 shadow-sm">
          {msg && (
            <Alert color="primary" variant="light">
              {msg}
            </Alert>
          )}
          <Row label="Phone (login)" value={user.phone} />
          <TextInput
            label="Full name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.currentTarget.value)}
          />
          <TextInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" color="primary" loading={updateMe.isPending}>
              Save profile
            </Button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/wishlist"
            className="rounded-lg border border-gold-200 bg-cream-25 p-5 text-center hover:border-gold-500">
            <p className="font-serif text-lg text-primary-900">My wishlist</p>
            <p className="mt-1 text-xs text-gray-400">Outfits you saved</p>
          </Link>
          <Link
            href="/owner/listings"
            className="rounded-lg border border-gold-200 bg-cream-25 p-5 text-center hover:border-gold-500">
            <p className="font-serif text-lg text-primary-900">My listings</p>
            <p className="mt-1 text-xs text-gray-400">Manage outfits you rent out</p>
          </Link>
          <Link
            href="/owner/listings/new"
            className="rounded-lg border border-gold-200 bg-cream-25 p-5 text-center hover:border-gold-500">
            <p className="font-serif text-lg text-primary-900">List an outfit</p>
            <p className="mt-1 text-xs text-gray-400">Earn from your closet</p>
          </Link>
          <Link
            href="/outfits"
            className="rounded-lg border border-gold-200 bg-cream-25 p-5 text-center hover:border-gold-500">
            <p className="font-serif text-lg text-primary-900">Browse</p>
            <p className="mt-1 text-xs text-gray-400">Discover outfits to rent</p>
          </Link>
        </div>

        <div className="mt-10">
          <Button variant="outline" color="red" onClick={logout}>
            Log out
          </Button>
        </div>
      </section>
    </StoreShell>
  );
};

export default AccountPage;
