import { Button } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';

const benefits = [
  {
    icon: '👜',
    title: 'Earn from your closet',
    body: 'Turn bridal and festive outfits sitting in your wardrobe into rental income.',
  },
  {
    icon: '✨',
    title: 'Premium curation',
    body: 'Every listing is reviewed before going live, so your piece sits on a hand-picked catalogue — not a discount bazaar.',
  },
  {
    icon: '🪙',
    title: 'You set the terms',
    body: 'You decide the rent per day, the refundable deposit and the rental dates. Listing is free.',
  },
  {
    icon: '🤝',
    title: 'Connect directly',
    body: 'We help renters discover your outfit and reach out. Price, deposit, handover and returns are arranged directly between you and the renter.',
  },
];

const steps = [
  { n: '01', title: 'Verify your mobile', body: 'Sign in with your mobile number — a 6-digit OTP is all it takes.' },
  { n: '02', title: 'Add your outfit', body: 'Upload photos, write a short description and set your rent per day and refundable deposit.' },
  { n: '03', title: 'Get approved', body: 'Our team reviews your listing to keep the catalogue trustworthy, then it goes live.' },
  { n: '04', title: 'Connect with renters', body: 'Interested renters reach out — you agree the details and hand over the outfit directly.' },
];

const OwnerOnboarding = () => (
  <StoreShell>
    <NextSeo title="List with VASTRIQ CLOSET — Earn from your closet" />

    {/* Hero */}
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="vc-wordmark text-xs text-gold-700">Become an owner</p>
          <h1 className="mt-3 font-serif text-5xl text-primary-900 md:text-6xl">
            Earn from the outfits already in your closet.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
            Vastriq Closet partners with brides, designers, and brands to rent out their bridal &amp; festive collections — beautifully, and on terms you control.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" color="primary" radius="md" component={Link} href="/owner/listings/new">
              Start listing
            </Button>
            <Button size="lg" variant="outline" color="primary" radius="md" component={Link} href="#how">
              How it works
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-lg border border-gold-200 bg-cream-25 p-5 shadow-sm"
            >
              <div className="text-2xl">{b.icon}</div>
              <h3 className="mt-3 font-serif text-lg text-primary-900">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <div className="container mx-auto px-6">
      <div className="vc-hairline border-t" />
    </div>

    {/* Steps */}
    <section id="how" className="container mx-auto px-6 py-16">
      <div className="mb-12 text-center">
        <p className="vc-wordmark text-xs text-gold-700">Get started</p>
        <h2 className="mt-2 font-serif text-4xl text-primary-900">Four steps to your first booking</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-lg border border-gold-200 bg-cream-50 p-6">
            <p className="vc-wordmark text-xs text-gold-700">{s.n}</p>
            <h3 className="mt-3 font-serif text-2xl text-primary-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Final CTA */}
    <section className="bg-primary-900 py-16 text-cream-50">
      <div className="container mx-auto px-6 text-center">
        <h2 className="font-serif text-4xl">Ready to list?</h2>
        <p className="mt-3 text-cream-100/80">It takes less than 5 minutes to add your first outfit.</p>
        <div className="mt-6">
          <Button size="lg" color="gold" radius="md" component={Link} href="/owner/listings/new">
            Continue
          </Button>
        </div>
      </div>
    </section>
  </StoreShell>
);

export default OwnerOnboarding;
