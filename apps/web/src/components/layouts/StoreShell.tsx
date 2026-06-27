import { ReactNode } from 'react';
import { Button } from '@mantine/core';
import Link from 'next/link';

import HeaderAuth from '@/components/shared/HeaderAuth';

const navItems = [
  { href: '/outfits?category=bridal-lehenga', label: 'Bridal Lehenga' },
  { href: '/outfits?category=indo-western', label: 'Indo Western' },
  { href: '/outfits?category=saree', label: 'Saree' },
  { href: '/outfits?category=party-wear', label: 'Party Wear' },
  { href: '/owner/onboarding', label: 'List your outfit' },
];

const footerLinks = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact us' },
  { href: '/outfits', label: 'Browse outfits' },
  { href: '/owner/onboarding', label: 'List with us' },
  { href: '/legal/terms', label: 'Terms' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/safety', label: 'Safety' },
];

const StoreShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-cream-50 text-gray-700">
      <header className="border-b border-gold-200 bg-cream-50/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          <Link href="/" className="vc-wordmark text-xl text-primary-900">
            Vastriq Closet
          </Link>
          <nav className="hidden gap-8 text-sm font-medium text-gray-500 md:flex">
            {navItems.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-primary-900">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/outfits" className="text-sm font-medium text-primary-900 hover:underline">
              Search
            </Link>
            <HeaderAuth />
            <Button color="primary" radius="md" component={Link} href="/outfits" size="sm">
              Browse
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t border-gold-200 bg-cream-50 py-10 text-sm text-gray-400">
        <div className="container mx-auto flex flex-col items-center gap-6 px-6">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-primary-900">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-gold-100 pt-6 md:flex-row">
            <p className="vc-wordmark text-primary-900">Vastriq Closet</p>
            <p>© {new Date().getFullYear()} Vastriq Closet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreShell;
