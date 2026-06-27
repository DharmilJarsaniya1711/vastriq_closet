import { useMemo, useState } from 'react';
import { Alert, Badge, Button, Loader, Rating, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { useOutfit } from '@/apis/queries/catalog.queries';
import { useCreateReview, useFileReport, useOutfitReviews } from '@/apis/queries/social.queries';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitImage from '@/components/shared/OutfitImage';
import WishlistButton from '@/components/shared/WishlistButton';
import { ACCESS_TOKEN } from '@/utils/constants';
import { CATEGORY_LABELS, SAMPLE_OUTFITS } from '@/utils/sampleOutfits';

const displayName = (a?: { firstName?: string | null; lastName?: string | null }) =>
  [a?.firstName, a?.lastName].filter(Boolean).join(' ') || 'Anonymous';

const OutfitDetail = () => {
  const router = useRouter();
  const slug = router.query.slug as string;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: live, isLoading, isError } = useOutfit(slug);
  const { data: reviews } = useOutfitReviews(slug);

  const isLoggedIn = !!getCookie(ACCESS_TOKEN);
  const outfitId = live?.id;

  const fileReport = useFileReport();
  const createReview = useCreateReview(slug);

  const [reported, setReported] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  const outfit = useMemo(() => {
    if (live) {
      return {
        slug: live.slug,
        title: live.title,
        description: live.description ?? '',
        color: live.color,
        occasions: live.occasionSlugs ?? [],
        rentPerDay: live.rentPerDay,
        securityDeposit: live.securityDeposit,
        mrp: live.mrp,
        imageUrls: live.imageUrls ?? [],
        avgRating: live.avgRating ?? 0,
        totalReviews: live.totalReviews ?? 0,
        availabilityNote: live.availabilityNote ?? null,
        category: live.category?.slug ?? 'lehenga',
      };
    }
    const fallback = SAMPLE_OUTFITS.find((o) => o.slug === slug);
    if (!fallback) return null;
    return {
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      color: fallback.color,
      occasions: fallback.occasions,
      rentPerDay: fallback.rentPerDay,
      securityDeposit: fallback.securityDeposit,
      mrp: fallback.mrp,
      imageUrls: [] as string[],
      avgRating: 0,
      totalReviews: 0,
      availabilityNote: null,
      category: fallback.category,
    };
  }, [live, slug]);

  if (isLoading) {
    return (
      <StoreShell>
        <div className="flex h-96 items-center justify-center">
          <Loader color="primary" />
        </div>
      </StoreShell>
    );
  }

  if (!outfit && (isError || !isLoading)) {
    return (
      <StoreShell>
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary-900">Outfit not found</h1>
          <p className="mt-3 text-sm text-gray-500">
            The piece you&apos;re looking for is unavailable.{' '}
            <Link href="/outfits" className="text-primary-700 hover:underline">
              Browse the collection
            </Link>
            .
          </p>
        </div>
      </StoreShell>
    );
  }

  if (!outfit) return null;

  const [from, to] = dateRange;
  const days = from && to ? Math.max(1, Math.round((+to - +from) / 86400000) + 1) : 0;
  const rentTotal = outfit.rentPerDay * days;
  const gallery = outfit.imageUrls.length ? outfit.imageUrls : [];

  const reportListing = async () => {
    if (!isLoggedIn || !outfitId) {
      router.push('/login');
      return;
    }
    // eslint-disable-next-line no-alert
    const reason = window.prompt('Why are you reporting this listing?');
    if (!reason) return;
    try {
      await fileReport.mutateAsync({ targetType: 'LISTING', targetId: outfitId, reason });
      setReported(true);
    } catch {
      /* ignore */
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg(null);
    if (!isLoggedIn || !outfitId) {
      router.push('/login');
      return;
    }
    try {
      await createReview.mutateAsync({
        outfitId,
        rating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim() || undefined,
      });
      setReviewTitle('');
      setReviewBody('');
      setRating(5);
      setReviewMsg('Thanks! Your review will appear once a moderator approves it.');
    } catch (err) {
      setReviewMsg((err as Error).message || 'Could not submit your review.');
    }
  };

  return (
    <StoreShell>
      <NextSeo title={`${outfit.title} — VASTRIQ CLOSET`} description={outfit.description} />
      <section className="container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            {gallery.length ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gallery[0]}
                  alt={outfit.title}
                  className="w-full rounded-lg border border-gold-200 object-cover"
                />
                {gallery.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {gallery.slice(1, 5).map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt={outfit.title}
                        className="aspect-square rounded-md border border-gold-200 object-cover"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <OutfitImage
                title={outfit.title}
                color={outfit.color}
                className="rounded-lg border border-gold-200"
              />
            )}
          </div>

          {/* Details */}
          <div>
            <p className="vc-wordmark text-xs text-gold-700">
              {CATEGORY_LABELS[outfit.category] ?? outfit.category}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-primary-900 sm:text-4xl">
              {outfit.title}
            </h1>

            {outfit.totalReviews > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <Rating value={outfit.avgRating} fractions={2} readOnly size="sm" />
                <span className="text-xs text-gray-400">
                  {outfit.avgRating.toFixed(1)} · {outfit.totalReviews} review
                  {outfit.totalReviews === 1 ? '' : 's'}
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {outfit.occasions.map((occ) => (
                <Badge key={occ} variant="outline" color="primary" radius="sm">
                  {occ}
                </Badge>
              ))}
            </div>

            <p className="mt-6 leading-relaxed text-gray-500">{outfit.description}</p>

            <div className="mt-8 rounded-lg border border-gold-200 bg-cream-25 p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-serif text-3xl text-primary-900">
                  ₹ {outfit.rentPerDay.toLocaleString('en-IN')}
                  <span className="ml-1 text-sm text-gray-400">/ day</span>
                </p>
                {outfit.mrp ? (
                  <p className="text-xs text-gray-400">
                    MRP ₹ {outfit.mrp.toLocaleString('en-IN')}
                  </p>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Refundable security deposit ₹ {outfit.securityDeposit.toLocaleString('en-IN')}
              </p>
            </div>

            {outfit.availabilityNote && (
              <p className="mt-4 text-sm text-gray-500">
                <span className="font-medium text-primary-900">Availability:</span>{' '}
                {outfit.availabilityNote}
              </p>
            )}

            {/* Rental dates — the renter picks the window they want */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-primary-900">Rental dates</p>
              <DatePickerInput
                type="range"
                placeholder="Pick your rental start & end dates"
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
                numberOfColumns={isMobile ? 1 : 2}
                clearable
                valueFormat="DD MMM YYYY"
              />
              <p className="mt-1 text-xs text-gray-400">
                Share these dates with the owner in chat to confirm availability.
              </p>
            </div>

            {/* Estimate — owner-declared, arranged directly with the owner */}
            <div className="mt-8 space-y-2 rounded-lg border border-gold-200 bg-cream-50 p-5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>
                  {days
                    ? `Est. rent (${days} day${days === 1 ? '' : 's'})`
                    : 'Est. rent (pick dates)'}
                </span>
                <span>₹ {rentTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Security deposit (owner-set)</span>
                <span>₹ {outfit.securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <p className="pt-1 text-xs text-gray-400">
                Price &amp; deposit are set and collected by the owner — not the platform. Confirm
                everything in chat.
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                size="lg"
                color="primary"
                radius="md"
                className="flex-1"
                onClick={() =>
                  notifications.show({
                    color: 'primary',
                    title: 'Coming soon',
                    message: 'Chat with owner is a feature we are building. Stay tuned!',
                  })
                }>
                Chat with owner
              </Button>
              <WishlistButton outfitId={outfitId} variant="full" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Never pay in advance —{' '}
                <Link href="/legal/safety" className="text-primary-700 hover:underline">
                  see our safety tips
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={reportListing}
                disabled={reported}
                className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50">
                {reported ? 'Reported' : 'Report listing'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 border-t border-gold-200 pt-10">
          <h2 className="font-serif text-3xl text-primary-900">Reviews</h2>

          <div className="mt-6 space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-gold-200 bg-cream-25 p-5">
                  <div className="flex items-center gap-2">
                    <Rating value={r.rating} readOnly size="sm" />
                    <span className="text-sm font-medium text-primary-900">
                      {displayName(r.author)}
                    </span>
                  </div>
                  {r.title && <p className="mt-2 font-medium text-primary-900">{r.title}</p>}
                  {r.body && <p className="mt-1 text-sm text-gray-500">{r.body}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            )}
          </div>

          {/* Submit */}
          <form
            onSubmit={submitReview}
            className="mt-8 max-w-xl space-y-4 rounded-lg border border-gold-200 bg-cream-25 p-6">
            <h3 className="font-serif text-xl text-primary-900">Leave a review</h3>
            {reviewMsg && (
              <Alert color="primary" variant="light">
                {reviewMsg}
              </Alert>
            )}
            <div>
              <p className="mb-1 text-sm font-medium text-primary-900">Your rating</p>
              <Rating value={rating} onChange={setRating} />
            </div>
            <TextInput
              label="Title"
              placeholder="Summarise your experience"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.currentTarget.value)}
            />
            <Textarea
              label="Review"
              placeholder="How was the outfit and the owner?"
              rows={3}
              value={reviewBody}
              onChange={(e) => setReviewBody(e.currentTarget.value)}
            />
            <Button type="submit" color="primary" loading={createReview.isPending}>
              {isLoggedIn ? 'Submit review' : 'Login to review'}
            </Button>
          </form>
        </div>
      </section>
    </StoreShell>
  );
};

export default OutfitDetail;
