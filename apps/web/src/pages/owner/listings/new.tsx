import { useState } from 'react';
import { Button } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { useCreateOutfit } from '@/apis/queries/outfit.queries';
import { uploadImages } from '@/apis/requests/outfit.requests';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitForm, { OutfitFormValues } from '@/components/shared/OutfitForm';

const NewListing = () => {
  const createOutfit = useCreateOutfit();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values: OutfitFormValues, files: File[]) => {
    const imageUrls = await uploadImages(files);
    await createOutfit.mutateAsync({ ...values, imageUrls });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <StoreShell>
        <section className="container mx-auto px-6 py-20 text-center">
          <p className="vc-wordmark text-xs text-gold-700">Saved</p>
          <h1 className="mt-3 font-serif text-4xl text-primary-900">Listing submitted</h1>
          <p className="mt-2 max-w-md mx-auto text-sm text-gray-500">
            Depending on settings, your listing is either live now or queued for moderation. We&apos;ll
            notify you once it&apos;s live.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button color="primary" component={Link} href="/owner/listings">
              View my listings
            </Button>
            <Button variant="outline" color="primary" onClick={() => setSubmitted(false)}>
              Add another
            </Button>
          </div>
        </section>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <NextSeo title="Add a new outfit — VASTRIQ CLOSET" />
      <section className="container mx-auto max-w-3xl px-6 py-12">
        <p className="vc-wordmark text-xs text-gold-700">Owner</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Add an outfit</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill out the details below. Your listing goes into moderation before it&apos;s visible to renters.
        </p>
        <OutfitForm requireImages submitLabel="Submit for review" onSubmit={handleSubmit} />
      </section>
    </StoreShell>
  );
};

export default NewListing;
