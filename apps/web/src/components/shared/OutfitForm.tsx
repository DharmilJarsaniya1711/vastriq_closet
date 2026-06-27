import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ColorSwatch,
  FileInput,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from '@mantine/core';
import Link from 'next/link';

import { useCategories, useCities, useColors, useOccasions } from '@/apis/queries/catalog.queries';

export interface OutfitFormValues {
  title: string;
  description?: string;
  categorySlug: string;
  occasionSlugs: string[];
  color?: string;
  mrp?: number;
  rentPerDay: number;
  securityDeposit?: number;
  citySlugs: string[];
  availabilityNote?: string;
}

interface OutfitFormProps {
  initial?: Partial<OutfitFormValues>;
  existingImageUrls?: string[];
  requireImages?: boolean;
  submitLabel: string;
  // Parent handles image upload + the API call. Returns when persisted.
  onSubmit: (values: OutfitFormValues, files: File[]) => Promise<void>;
}

const OutfitForm = ({
  initial,
  existingImageUrls = [],
  requireImages = true,
  submitLabel,
  onSubmit,
}: OutfitFormProps) => {
  const { data: categories } = useCategories();
  const { data: occasions } = useOccasions();
  const { data: cities } = useCities();
  const { data: colors } = useColors();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categorySlug, setCategorySlug] = useState<string | null>(initial?.categorySlug ?? null);
  const [occasionSlugs, setOccasionSlugs] = useState<string[]>(initial?.occasionSlugs ?? []);
  const [color, setColor] = useState<string | null>(initial?.color ?? null);
  const [files, setFiles] = useState<File[]>([]);
  const [mrp, setMrp] = useState<number | string>(initial?.mrp ?? '');
  const [rentPerDay, setRentPerDay] = useState<number | string>(initial?.rentPerDay ?? '');
  const [securityDeposit, setSecurityDeposit] = useState<number | string>(
    initial?.securityDeposit ?? ''
  );
  const [citySlugs, setCitySlugs] = useState<string[]>(initial?.citySlugs ?? []);
  const [availabilityNote, setAvailabilityNote] = useState(initial?.availabilityNote ?? '');

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // name -> hex, so we can show a color swatch next to each option (like the admin panel).
  const hexByColor = new Map((colors ?? []).map((c) => [c.name, c.hex]));

  // Object-URL previews for newly selected files (revoked on change/unmount).
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !categorySlug || !rentPerDay) {
      setError('Please fill in the title, category and rent / day.');
      return;
    }
    if (requireImages && files.length === 0 && existingImageUrls.length === 0) {
      setError('Please add at least one photo.');
      return;
    }
    if (citySlugs.length === 0) {
      setError('Please select at least one city.');
      return;
    }

    setBusy(true);
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          categorySlug,
          occasionSlugs,
          color: color || undefined,
          mrp: mrp ? Number(mrp) : undefined,
          rentPerDay: Number(rentPerDay),
          securityDeposit: securityDeposit ? Number(securityDeposit) : 0,
          citySlugs,
          availabilityNote: availabilityNote.trim() || undefined,
        },
        files
      );
    } catch (err) {
      setError((err as Error).message || 'Could not save the listing. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="mt-10 space-y-6 rounded-lg border border-gold-200 bg-cream-25 p-8 shadow-sm"
      onSubmit={handleSubmit}>
      {error && (
        <Alert color="red" variant="light">
          {error}
        </Alert>
      )}

      <TextInput
        label="Title"
        placeholder="e.g. Emerald Bandhani Bridal Lehenga"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        required
      />
      <Textarea
        label="Description"
        placeholder="Tell renters about the fabric, work, sizing tips…"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.currentTarget.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Category"
          placeholder="Pick one"
          data={(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))}
          value={categorySlug}
          onChange={setCategorySlug}
          searchable
          required
        />
        <Select
          label="Color"
          placeholder="Pick one"
          data={(colors ?? []).map((c) => ({ value: c.name, label: c.name }))}
          value={color}
          onChange={setColor}
          searchable
          clearable
          leftSection={
            color && hexByColor.get(color) ? (
              <ColorSwatch color={hexByColor.get(color)!} size={16} withShadow={false} />
            ) : undefined
          }
          renderOption={({ option }) => (
            <Group gap="xs" wrap="nowrap">
              {hexByColor.get(option.value) && (
                <ColorSwatch color={hexByColor.get(option.value)!} size={16} withShadow={false} />
              )}
              <span>{option.label}</span>
            </Group>
          )}
        />
      </div>

      <MultiSelect
        label="Occasions"
        placeholder="Pick all that apply"
        data={(occasions ?? []).map((o) => ({ value: o.slug, label: o.name }))}
        value={occasionSlugs}
        onChange={setOccasionSlugs}
        searchable
        clearable
      />

      <div className="grid gap-4 md:grid-cols-3">
        <NumberInput label="MRP (₹)" min={0} step={500} value={mrp} onChange={setMrp} />
        <NumberInput
          label="Rent / day (₹)"
          min={0}
          step={50}
          value={rentPerDay}
          onChange={setRentPerDay}
          required
        />
        <NumberInput
          label="Refundable deposit (₹)"
          min={0}
          step={500}
          value={securityDeposit}
          onChange={setSecurityDeposit}
        />
      </div>

      <MultiSelect
        label="Available in cities"
        placeholder="Select cities"
        data={(cities ?? []).map((c) => ({
          value: c.slug,
          label: c.state ? `${c.name} (${c.state})` : c.name,
        }))}
        value={citySlugs}
        onChange={setCitySlugs}
        searchable
        clearable
        required
      />

      <TextInput
        label="Availability note"
        placeholder="e.g. Available weekdays; book 3 days ahead"
        value={availabilityNote}
        onChange={(e) => setAvailabilityNote(e.currentTarget.value)}
      />

      <div>
        <FileInput
          label="Outfit photos"
          placeholder={
            existingImageUrls.length
              ? `Replace ${existingImageUrls.length} current photo(s) — optional`
              : 'Click to select images'
          }
          description="Set & collected by the owner — the platform does not handle payment."
          accept="image/png,image/jpeg,image/webp"
          multiple
          value={files}
          onChange={setFiles}
          clearable
        />

        {/* New selections preview */}
        {previews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`New outfit ${i + 1}`}
                className="h-24 w-20 rounded-md border border-gold-300 object-cover"
              />
            ))}
          </div>
        )}

        {/* Current images (edit mode) — shown when no new files chosen */}
        {previews.length === 0 && existingImageUrls.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-400">Current photos</p>
            <div className="flex flex-wrap gap-3">
              {existingImageUrls.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`Current outfit ${i + 1}`}
                  className="h-24 w-20 rounded-md border border-gold-200 object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" color="primary" component={Link} href="/owner/listings">
          Cancel
        </Button>
        <Button type="submit" color="primary" loading={busy}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default OutfitForm;
