import { Button, Loader } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { useMe } from '@/apis/queries/auth.queries';
import { useWishlist } from '@/apis/queries/social.queries';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitCard from '@/components/shared/OutfitCard';

const WishlistPage = () => {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: items, isLoading } = useWishlist();

  if (userLoading || isLoading) {
    return (
      <StoreShell>
        <div className="flex h-96 items-center justify-center">
          <Loader color="primary" />
        </div>
      </StoreShell>
    );
  }

  if (!user) {
    return (
      <StoreShell>
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary-900">Please log in</h1>
          <p className="mt-3 text-sm text-gray-500">
            Sign in to see the outfits you&apos;ve saved.
          </p>
          <Button className="mt-6" color="primary" component={Link} href="/login">
            Login
          </Button>
        </section>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <NextSeo title="My wishlist — VASTRIQ CLOSET" />
      <section className="container mx-auto px-6 py-12">
        <p className="vc-wordmark text-xs text-gold-700">Saved</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">My wishlist</h1>
        <p className="mt-1 text-sm text-gray-500">
          {items?.length
            ? `${items.length} outfit${items.length === 1 ? '' : 's'} saved`
            : 'Outfits you save will appear here.'}
        </p>

        {!items || items.length === 0 ? (
          <div className="mt-8 rounded-lg border border-dashed border-gold-300 bg-cream-50 p-16 text-center">
            <p className="font-serif text-2xl text-primary-900">Nothing saved yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Tap the ♡ on any outfit to add it to your wishlist.
            </p>
            <Button className="mt-6" color="primary" component={Link} href="/outfits">
              Browse outfits
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.map((it) => (
              <OutfitCard
                key={it.id}
                id={it.outfit.id}
                slug={it.outfit.slug}
                title={it.outfit.title}
                category={it.outfit.category?.name}
                rentPerDay={it.outfit.rentPerDay}
                securityDeposit={it.outfit.securityDeposit}
                color={it.outfit.color ?? undefined}
                imageUrl={it.outfit.imageUrls?.[0]}
              />
            ))}
          </div>
        )}
      </section>
    </StoreShell>
  );
};

export default WishlistPage;
