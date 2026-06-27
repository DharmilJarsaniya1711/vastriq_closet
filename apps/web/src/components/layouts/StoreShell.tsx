import { ReactNode } from 'react';
import { Burger, Button, Drawer } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
  const [menu, menuCtl] = useDisclosure(false);

  return (
    <div className="min-h-screen bg-cream-50 text-gray-700">
      <header className="border-b border-gold-200 bg-cream-50/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <Link href="/" className="vc-wordmark text-lg text-primary-900 sm:text-xl">
            Vastriq Closet
          </Link>
          <nav className="hidden gap-8 text-sm font-medium text-gray-500 md:flex">
            {navItems.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-primary-900">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/outfits"
              className="hidden text-sm font-medium text-primary-900 hover:underline sm:inline">
              Search
            </Link>
            <HeaderAuth />
            <Button
              color="primary"
              radius="md"
              component={Link}
              href="/outfits"
              size="sm"
              className="hidden sm:inline-block">
              Browse
            </Button>
            <Burger
              opened={menu}
              onClick={menuCtl.toggle}
              size="sm"
              className="md:hidden"
              aria-label="Open navigation"
            />
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <Drawer
        opened={menu}
        onClose={menuCtl.close}
        position="right"
        size="xs"
        title={<span className="vc-wordmark text-primary-900">Vastriq Closet</span>}
        className="md:hidden">
        <nav className="flex flex-col gap-1">
          {navItems.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={menuCtl.close}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cream-100 hover:text-primary-900">
              {n.label}
            </Link>
          ))}
          <Link
            href="/outfits"
            onClick={menuCtl.close}
            className="rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-cream-100 hover:text-primary-900">
            Search
          </Link>
        </nav>
        <Button
          color="primary"
          radius="md"
          component={Link}
          href="/outfits"
          fullWidth
          className="mt-4"
          onClick={menuCtl.close}>
          Browse outfits
        </Button>
      </Drawer>

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
