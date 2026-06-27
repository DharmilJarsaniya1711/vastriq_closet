import { Loader } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { useOccasions } from '@/apis/queries/catalog.queries';
import StoreShell from '@/components/layouts/StoreShell';

const OccasionsPage = () => {
  const { data: occasions, isLoading } = useOccasions();

  return (
    <StoreShell>
      <NextSeo title="Shop by occasion — VASTRIQ CLOSET" />
      <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <p className="vc-wordmark text-xs text-gold-700">Browse</p>
        <h1 className="mt-2 font-serif text-3xl text-primary-900 sm:text-4xl">Shop by occasion</h1>
        <p className="mt-1 text-sm text-gray-500">Find the perfect outfit for every celebration.</p>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader color="primary" />
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(occasions ?? []).map((o) => (
              <Link
                key={o.slug}
                href={`/outfits?occasion=${o.slug}`}
                className="rounded-lg border border-gold-200 bg-cream-25 p-5 text-center transition hover:border-gold-500 hover:shadow-sm sm:p-8">
                <p className="font-serif text-lg text-primary-900 sm:text-xl">{o.name}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </StoreShell>
  );
};

export default OccasionsPage;
