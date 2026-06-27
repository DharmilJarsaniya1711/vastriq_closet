import { Button } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';

const values = [
  {
    title: 'Discovery, not middlemen',
    body: 'We are a noticeboard that connects people who own beautiful ethnic wear with people who want to rent it. Owners and renters deal with each other directly.',
  },
  {
    title: 'Curated, not cluttered',
    body: 'Every listing is moderated before it goes live, so the catalogue stays premium and trustworthy — bridal lehengas, sherwanis, sarees and statement pieces.',
  },
  {
    title: 'You stay in control',
    body: 'Owners set their own rent, deposit and terms. Renters pick what fits their occasion and budget, and arrange everything directly with the owner.',
  },
  {
    title: 'Sustainable by design',
    body: 'Renting an outfit for the few days you actually need it means less waste, more wears, and a wardrobe that earns instead of gathering dust.',
  },
];

const AboutPage = () => (
  <StoreShell>
    <NextSeo
      title="About us — VASTRIQ CLOSET"
      description="VASTRIQ CLOSET is a curated noticeboard for renting premium ethnic wear directly between owners and renters."
    />

    {/* Hero */}
    <section className="container mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
      <p className="vc-wordmark text-xs text-gold-700">Our story</p>
      <h1 className="mt-3 font-serif text-5xl text-primary-900 md:text-6xl">
        Ethnic wear, worn more than once.
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
        VASTRIQ CLOSET began with a simple thought: the most beautiful outfits in India spend most
        of their lives in a wardrobe. We built a place where those pieces can be discovered, rented
        and loved again — connecting owners and renters, beautifully and on their own terms.
      </p>
    </section>

    <div className="container mx-auto px-6">
      <div className="vc-hairline border-t" />
    </div>

    {/* Values */}
    <section className="container mx-auto px-6 py-16">
      <div className="mb-12 text-center">
        <p className="vc-wordmark text-xs text-gold-700">What we believe</p>
        <h2 className="mt-2 font-serif text-4xl text-primary-900">How VASTRIQ works</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {values.map((v) => (
          <div
            key={v.title}
            className="rounded-lg border border-gold-200 bg-cream-25 p-7 shadow-sm">
            <h3 className="font-serif text-2xl text-primary-900">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{v.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary-900 py-16 text-cream-50">
      <div className="container mx-auto grid items-center gap-8 px-6 text-center md:grid-cols-2 md:text-left">
        <div>
          <h2 className="font-serif text-4xl">Have a question or an idea?</h2>
          <p className="mt-3 max-w-md text-cream-100/80">
            We&apos;d love to hear from you — whether you&apos;re an owner, a renter, or just
            curious.
          </p>
        </div>
        <div className="md:text-right">
          <Button size="lg" color="gold" radius="md" component={Link} href="/contact">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  </StoreShell>
);

export default AboutPage;
