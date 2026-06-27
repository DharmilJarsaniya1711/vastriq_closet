import { useState } from 'react';
import { Button, Loader } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import { useMyOutfit, useUpdateOutfit } from '@/apis/queries/outfit.queries';
import { uploadImages } from '@/apis/requests/outfit.requests';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitForm, { OutfitFormValues } from '@/components/shared/OutfitForm';

const EditListing = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const { data: outfit, isLoading, isError } = useMyOutfit(id);
  const updateOutfit = useUpdateOutfit(id);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (values: OutfitFormValues, files: File[]) => {
    // Only re-upload if the owner picked new images; otherwise keep the existing set.
    const imageUrls = files.length ? await uploadImages(files) : outfit?.imageUrls;
    await updateOutfit.mutateAsync({ ...values, ...(imageUrls ? { imageUrls } : {}) });
    setSaved(true);
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

  if (isError || !outfit) {
    return (
      <StoreShell>
        <section className="container mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl text-primary-900">Listing not found</h1>
          <p className="mt-3 text-sm text-gray-500">
            It may not exist or isn&apos;t yours.{' '}
            <Link href="/owner/listings" className="text-primary-700 hover:underline">
              Back to my listings
            </Link>
          </p>
        </section>
      </StoreShell>
    );
  }

  if (saved) {
    return (
      <StoreShell>
        <section className="container mx-auto px-6 py-20 text-center">
          <p className="vc-wordmark text-xs text-gold-700">Saved</p>
          <h1 className="mt-3 font-serif text-4xl text-primary-900">Changes saved</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Edited listings re-enter moderation before going live again.
          </p>
          <div className="mt-6">
            <Button color="primary" component={Link} href="/owner/listings">
              Back to my listings
            </Button>
          </div>
        </section>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <NextSeo title={`Edit ${outfit.title} — VASTRIQ CLOSET`} />
      <section className="container mx-auto max-w-3xl px-6 py-12">
        <p className="vc-wordmark text-xs text-gold-700">Owner</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Edit listing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Saving changes sends the listing back for review.
        </p>
        <OutfitForm
          requireImages={false}
          existingImageUrls={outfit.imageUrls ?? []}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          initial={{
            title: outfit.title,
            description: outfit.description ?? undefined,
            categorySlug: outfit.category?.slug,
            occasionSlugs: outfit.occasionSlugs ?? [],
            color: outfit.color ?? undefined,
            mrp: outfit.mrp ?? undefined,
            rentPerDay: outfit.rentPerDay,
            securityDeposit: outfit.securityDeposit,
            citySlugs: outfit.citySlugs ?? [],
            availabilityNote: outfit.availabilityNote ?? undefined,
          }}
        />
      </section>
    </StoreShell>
  );
};

export default EditListing;
