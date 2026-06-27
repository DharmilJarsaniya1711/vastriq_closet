import { Button } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';
import BannerHero from '@/components/shared/BannerHero';
import OutfitImage from '@/components/shared/OutfitImage';

const occasions = [
  { slug: 'bridal', label: 'Bridal', color: 'maroon' },
  { slug: 'sangeet', label: 'Sangeet', color: 'pink' },
  { slug: 'haldi', label: 'Haldi', color: 'yellow' },
  { slug: 'mehendi', label: 'Mehendi', color: 'green' },
  { slug: 'reception', label: 'Reception', color: 'emerald' },
];

const categories = [
  { slug: 'lehenga', label: 'Lehenga', color: 'emerald' },
  { slug: 'sherwani', label: 'Sherwani', color: 'ivory' },
  { slug: 'saree', label: 'Saree', color: 'maroon' },
  { slug: 'choli', label: 'Choli', color: 'pink' },
  { slug: 'kids', label: 'Kids', color: 'yellow' },
  { slug: 'jewellery', label: 'Jewellery', color: 'gold' },
];

const steps = [
  { n: '01', title: 'Browse', body: 'Discover curated ethnic wear for every occasion.' },
  { n: '02', title: 'Pick your dates', body: 'Choose the rental window that suits your event.' },
  { n: '03', title: 'Connect with the owner', body: 'Agree the rent, deposit and handover directly with the owner.' },
  { n: '04', title: 'Wear & celebrate', body: 'Collect your outfit, look stunning, and return it as agreed.' },
];

const Home = () => (
  <StoreShell>
    <NextSeo title="VASTRIQ CLOSET — Ethnic Wear on Rent" description="Premium ethnic wear on rent. Lehenga, sherwani, saree and more — delivered to your door." />

    {/* CMS banners (managed from Admin → CMS) */}
    <BannerHero />

    {/* Hero */}
    <section className="relative overflow-hidden">
      <div className="container mx-auto grid gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <p className="vc-wordmark mb-4 text-xs text-gold-700">Premium Ethnic Wear · On Rent</p>
          <h1 className="text-5xl leading-tight text-primary-900 md:text-6xl">
            Royal couture for the moments that matter.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-500">
            Hand-picked lehengas, sherwanis and statement jewellery — discover pieces to rent for the days you need them, directly from their owners.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" color="primary" radius="md" component={Link} href="/outfits">
              Explore Collection
            </Button>
            <Button size="lg" variant="outline" color="primary" radius="md" component={Link} href="/owner/onboarding">
              List your outfits
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-gray-400">
            <span>✓ Curated &amp; moderated listings</span>
            <span>✓ Deal directly with owners</span>
          </div>
        </div>
        <div className="relative">
          <OutfitImage
            title="Emerald Bandhani Bridal Lehenga"
            color="emerald"
            className="rounded-lg border border-gold-200 vc-card-shadow"
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-md border border-gold-200 bg-cream-50/95 p-5 backdrop-blur vc-card-shadow">
            <p className="vc-wordmark text-[10px] text-gold-700">Featured</p>
            <p className="mt-1 font-serif text-2xl text-primary-900">Emerald Bandhani Lehenga</p>
            <p className="mt-1 text-sm text-gray-500">₹ 1,050 / day · Deposit ₹ 8,000</p>
          </div>
        </div>
      </div>
    </section>

    {/* Hairline */}
    <div className="container mx-auto px-6">
      <div className="vc-hairline border-t" />
    </div>

    {/* Shop by Occasion */}
    <section className="container mx-auto px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="vc-wordmark text-xs text-gold-700">Curated</p>
          <h2 className="mt-2 text-4xl text-primary-900">Shop by Occasion</h2>
        </div>
        <Link href="/occasions" className="text-sm font-medium text-primary-700 hover:underline">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {occasions.map((o) => (
          <Link
            key={o.slug}
            href={`/outfits?occasion=${o.slug}`}
            className="group relative overflow-hidden rounded-lg border border-gold-200 transition hover:border-gold-500"
          >
            <OutfitImage title={o.label} color={o.color} withWatermark={false} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-900/60 via-primary-900/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="font-serif text-2xl text-cream-50">{o.label}</p>
              <p className="vc-wordmark mt-1 text-[10px] text-gold-200">Shop now →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Shop by Category */}
    <section className="bg-cream-100 py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10 text-center">
          <p className="vc-wordmark text-xs text-gold-700">Categories</p>
          <h2 className="mt-2 text-4xl text-primary-900">Find your fit</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/outfits?category=${c.slug}`}
              className="group flex flex-col items-center rounded-lg border border-gold-200 bg-cream-50 p-6 text-center transition hover:border-gold-500 hover:shadow-sm"
            >
              <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border border-gold-300">
                <OutfitImage
                  title={c.label}
                  color={c.color}
                  ratio="square"
                  withWatermark={false}
                />
              </div>
              <p className="font-serif text-lg text-primary-900">{c.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="container mx-auto px-6 py-20">
      <div className="mb-12 text-center">
        <p className="vc-wordmark text-xs text-gold-700">How it works</p>
        <h2 className="mt-2 text-4xl text-primary-900">Four steps to your moment</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.n} className="rounded-lg border border-gold-200 bg-cream-50 p-6">
            <p className="vc-wordmark text-xs text-gold-700">{s.n}</p>
            <h3 className="mt-3 font-serif text-2xl text-primary-900">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Owner CTA */}
    <section className="bg-primary-900 py-20 text-cream-50">
      <div className="container mx-auto grid items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="vc-wordmark text-xs text-gold-200">For Owners</p>
          <h2 className="mt-2 font-serif text-4xl">Earn from your closet.</h2>
          <p className="mt-4 max-w-md leading-relaxed text-cream-100/80">
            List your bridal and festive outfits with VASTRIQ CLOSET and reach renters across the country.
          </p>
        </div>
        <div className="md:text-right">
          <Button size="lg" color="gold" radius="md" component={Link} href="/owner/onboarding">
            Start listing
          </Button>
        </div>
      </div>
    </section>
  </StoreShell>
);

export default Home;
