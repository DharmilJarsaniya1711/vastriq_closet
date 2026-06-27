import Link from 'next/link';

import { useBanners } from '@/apis/queries/cms.queries';

// Storefront hero banners managed from Admin → CMS. Renders nothing if there are none.
const BannerHero = () => {
  const { data: banners } = useBanners();

  if (!banners || banners.length === 0) return null;

  return (
    <section className="container mx-auto px-6 pt-8">
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {banners.map((b) => {
          const card = (
            <div className="relative h-56 w-full overflow-hidden rounded-lg border border-gold-200 md:h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <h2 className="font-serif text-2xl text-cream-50 md:text-3xl">{b.title}</h2>
                {b.ctaUrl && (
                  <span className="mt-2 inline-block rounded-md bg-gold-500 px-4 py-1.5 text-sm font-medium text-primary-900">
                    Explore
                  </span>
                )}
              </div>
            </div>
          );
          return (
            <div key={b.id} className="w-[85%] flex-shrink-0 snap-start md:w-[60%]">
              {b.ctaUrl ? (
                <Link href={b.ctaUrl} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default BannerHero;
