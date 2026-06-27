import { useEffect, useMemo, useState } from 'react';
import { Button, ColorSwatch, Drawer, Loader, RangeSlider, Select, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

import {
  useCategories,
  useCities,
  useColors,
  useOccasions,
  useOutfits,
} from '@/apis/queries/catalog.queries';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitCard from '@/components/shared/OutfitCard';

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gold-700">{title}</p>
    {children}
  </div>
);

const Pill = ({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? 'border-primary-900 bg-primary-900 text-cream-50'
        : 'border-gold-200 bg-cream-25 text-gray-600 hover:border-gold-500 hover:text-primary-900'
    }`}>
    {children}
  </button>
);

const OutfitsPage = () => {
  const router = useRouter();
  const query = router.query as Record<string, string | undefined>;
  const { category, occasion, color, city, min, max, q } = query;
  const sort = query.sort ?? 'newest';

  const { data: categories } = useCategories();
  const { data: occasions } = useOccasions();
  const { data: colors } = useColors();
  const { data: cities } = useCities();

  // ----- URL is the single source of truth for every filter -----
  const setParams = (patch: Record<string, string | undefined>) => {
    const next = { ...router.query };
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '') delete next[k];
      else next[k] = v;
    });
    router.replace({ pathname: '/outfits', query: next }, undefined, { shallow: true });
  };
  const setParam = (key: string, value?: string) => setParams({ [key]: value });
  // Pills toggle: clicking the active value clears it.
  const toggle = (key: string, value: string) =>
    setParam(key, query[key] === value ? undefined : value);
  const clearAll = () => router.replace('/outfits', undefined, { shallow: true });

  // Search box keeps its own draft text; commits to the URL on submit.
  const [term, setTerm] = useState(q ?? '');
  useEffect(() => setTerm(q ?? ''), [q]);

  // Price slider is local while dragging, written to the URL on release.
  const [price, setPrice] = useState<[number, number]>([
    min ? Number(min) : PRICE_MIN,
    max ? Number(max) : PRICE_MAX,
  ]);
  useEffect(() => {
    setPrice([min ? Number(min) : PRICE_MIN, max ? Number(max) : PRICE_MAX]);
  }, [min, max]);

  const { data, isLoading } = useOutfits({
    category,
    occasion,
    color,
    city,
    q: q || undefined,
    minPrice: min ? Number(min) : undefined,
    maxPrice: max ? Number(max) : undefined,
    limit: 48,
  });

  // Server returns newest-first; sort the fetched page client-side.
  const items = useMemo(() => {
    const list = [...(data?.items ?? [])];
    if (sort === 'price_asc') list.sort((a, b) => a.rentPerDay - b.rentPerDay);
    else if (sort === 'price_desc') list.sort((a, b) => b.rentPerDay - a.rentPerDay);
    else if (sort === 'oldest') list.reverse();
    return list;
  }, [data, sort]);

  const [drawer, drawerCtl] = useDisclosure(false);

  // ----- Active-filter summary chips -----
  const catName = categories?.find((c) => c.slug === category)?.name ?? category;
  const occName = occasions?.find((o) => o.slug === occasion)?.name ?? occasion;
  const cityName = cities?.find((c) => c.slug === city)?.name ?? city;
  const activeChips = [
    category && { key: 'category', label: catName! },
    occasion && { key: 'occasion', label: occName! },
    color && { key: 'color', label: color },
    city && { key: 'city', label: cityName! },
    (min || max) && {
      key: 'price',
      label: `${inr(Number(min) || PRICE_MIN)} – ${inr(Number(max) || PRICE_MAX)}`,
    },
    q && { key: 'q', label: `“${q}”` },
  ].filter(Boolean) as { key: string; label: string }[];

  const removeChip = (key: string) =>
    key === 'price' ? setParams({ min: undefined, max: undefined }) : setParam(key, undefined);

  // ----- Sidebar filter groups (reused in the mobile drawer) -----
  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Occasion">
        <div className="flex flex-wrap gap-2">
          {(occasions ?? []).map((o) => (
            <Pill
              key={o.slug}
              active={occasion === o.slug}
              onClick={() => toggle('occasion', o.slug)}>
              {o.name}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2">
          {(colors ?? []).map((c) => {
            const active = color === c.name;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle('color', c.name)}
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs transition ${
                  active
                    ? 'border-primary-900 bg-primary-900 text-cream-50'
                    : 'border-gold-200 bg-cream-25 text-gray-600 hover:border-gold-500'
                }`}>
                <ColorSwatch color={c.hex ?? '#ccc'} size={16} withShadow={false} />
                {c.name}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Available city">
        <Select
          placeholder="Any city"
          searchable
          clearable
          value={city ?? null}
          data={(cities ?? []).map((c) => ({
            value: c.slug,
            label: c.state ? `${c.name} (${c.state})` : c.name,
          }))}
          onChange={(v) => setParam('city', v ?? undefined)}
        />
      </FilterGroup>

      <FilterGroup title="Rent / day">
        <RangeSlider
          color="primary"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={250}
          value={price}
          onChange={setPrice}
          onChangeEnd={(v) =>
            setParams({
              min: v[0] > PRICE_MIN ? String(v[0]) : undefined,
              max: v[1] < PRICE_MAX ? String(v[1]) : undefined,
            })
          }
          label={inr}
          marks={[
            { value: PRICE_MIN, label: inr(PRICE_MIN) },
            { value: PRICE_MAX, label: `${inr(PRICE_MAX)}+` },
          ]}
        />
        <div className="mt-6 flex justify-between text-xs text-gray-500">
          <span>{inr(price[0])}</span>
          <span>{price[1] >= PRICE_MAX ? `${inr(PRICE_MAX)}+` : inr(price[1])}</span>
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <StoreShell>
      <NextSeo title="Browse outfits — VASTRIQ CLOSET" />
      <section className="container mx-auto px-6 py-10">
        {/* Heading + sort */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="vc-wordmark text-xs text-gold-700">Collection</p>
            <h1 className="mt-2 font-serif text-4xl text-primary-900">Browse outfits</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isLoading
                ? 'Loading…'
                : `${items.length} outfit${items.length === 1 ? '' : 's'} on rent`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" radius="md" className="lg:hidden" onClick={drawerCtl.open}>
              Filters{activeChips.length ? ` (${activeChips.length})` : ''}
            </Button>
            <Select
              aria-label="Sort"
              radius="md"
              w={200}
              data={SORTS}
              value={sort}
              onChange={(v) => setParam('sort', v && v !== 'newest' ? v : undefined)}
              allowDeselect={false}
            />
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', term.trim() || undefined);
          }}
          className="mt-6 max-w-xl">
          <TextInput
            radius="md"
            placeholder="Search by name — e.g. lehenga, emerald, bridal"
            value={term}
            onChange={(e) => setTerm(e.currentTarget.value)}
            rightSection={
              <button
                type="submit"
                aria-label="Search"
                className="text-gray-400 hover:text-primary-900">
                ⏎
              </button>
            }
          />
        </form>

        {/* Category quick-pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Pill active={!category} onClick={() => setParam('category', undefined)}>
            All
          </Pill>
          {(categories ?? []).map((c) => (
            <Pill
              key={c.slug}
              active={category === c.slug}
              onClick={() => toggle('category', c.slug)}>
              {c.name}
            </Pill>
          ))}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeChip(chip.key)}
                className="flex items-center gap-1.5 rounded-full border border-gold-300 bg-cream-25 px-3 py-1 text-xs text-primary-900 hover:border-primary-900">
                {chip.label}
                <span className="text-gray-400">✕</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="px-2 text-xs font-medium text-primary-700 hover:underline">
              Clear all
            </button>
          </div>
        )}

        {/* Body: sidebar + grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-lg border border-gold-200 bg-cream-25 p-6">
              {filterPanel}
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="flex h-80 items-center justify-center">
                <Loader color="primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gold-300 bg-cream-50 p-16 text-center">
                <p className="font-serif text-2xl text-primary-900">No outfits found</p>
                <p className="mt-2 text-sm text-gray-500">
                  Try clearing a filter or widening your price range.
                </p>
                {activeChips.length > 0 && (
                  <Button className="mt-6" variant="outline" color="primary" onClick={clearAll}>
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
                {items.map((o) => (
                  <OutfitCard
                    key={o.slug}
                    id={o.id}
                    slug={o.slug}
                    title={o.title}
                    category={o.category?.name}
                    rentPerDay={o.rentPerDay}
                    securityDeposit={o.securityDeposit}
                    color={o.color}
                    imageUrl={o.imageUrls?.[0]}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <Drawer opened={drawer} onClose={drawerCtl.close} title="Filters" position="left" size="xs">
        {filterPanel}
        <div className="mt-8 flex gap-3">
          <Button variant="outline" color="primary" fullWidth onClick={clearAll}>
            Clear
          </Button>
          <Button color="primary" fullWidth onClick={drawerCtl.close}>
            Show results
          </Button>
        </div>
      </Drawer>
    </StoreShell>
  );
};

export default OutfitsPage;
