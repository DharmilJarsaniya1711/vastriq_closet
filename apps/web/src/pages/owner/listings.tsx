import { Badge, Button, Loader, Table } from '@mantine/core';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { useMyOutfits } from '@/apis/queries/outfit.queries';
import { OutfitStatus } from '@/apis/requests/outfit.requests';
import StoreShell from '@/components/layouts/StoreShell';
import OutfitImage from '@/components/shared/OutfitImage';

const STATUS_COLOR: Record<OutfitStatus, string> = {
  ACTIVE: 'green',
  PENDING: 'yellow',
  REJECTED: 'red',
  ARCHIVED: 'gray',
  DRAFT: 'gray',
};

const OwnerListings = () => {
  const { data: outfits, isLoading } = useMyOutfits();

  const liveCount = (outfits ?? []).filter((o) => o.status === 'ACTIVE').length;
  const pendingCount = (outfits ?? []).filter((o) => o.status === 'PENDING').length;

  return (
    <StoreShell>
      <NextSeo title="My listings — VASTRIQ CLOSET" />
      <section className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="vc-wordmark text-xs text-gold-700">Owner area</p>
            <h1 className="mt-2 font-serif text-4xl text-primary-900">My listings</h1>
            <p className="mt-1 text-sm text-gray-500">
              {liveCount} live · {pendingCount} pending
            </p>
          </div>
          <Button size="md" color="primary" radius="md" component={Link} href="/owner/listings/new">
            + Add outfit
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader color="primary" />
          </div>
        ) : !outfits || outfits.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gold-300 bg-cream-50 p-16 text-center">
            <p className="font-serif text-2xl text-primary-900">No listings yet</p>
            <p className="mt-2 text-sm text-gray-500">
              List your first outfit and start receiving enquiries.
            </p>
            <Button className="mt-6" color="primary" component={Link} href="/owner/listings/new">
              + Add your first outfit
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-gold-200 bg-cream-25 p-2 shadow-sm">
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Outfit</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Rent / day</Table.Th>
                  <Table.Th>Deposit</Table.Th>
                  <Table.Th>Views</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {outfits.map((o) => (
                  <Table.Tr key={o.id}>
                    <Table.Td>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded border border-gold-200">
                          {o.imageUrls?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={o.imageUrls[0]}
                              alt={o.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <OutfitImage
                              title={o.title}
                              color={o.color ?? ''}
                              withWatermark={false}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-primary-900">{o.title}</p>
                          {o.color && <p className="text-xs text-gray-400">{o.color}</p>}
                        </div>
                      </div>
                    </Table.Td>
                    <Table.Td className="capitalize">{o.category?.name ?? '—'}</Table.Td>
                    <Table.Td>₹ {o.rentPerDay.toLocaleString('en-IN')}</Table.Td>
                    <Table.Td>₹ {o.securityDeposit.toLocaleString('en-IN')}</Table.Td>
                    <Table.Td>{o.viewsCount}</Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLOR[o.status]} variant="light">
                        {o.status}
                      </Badge>
                      {o.status === 'REJECTED' && o.rejectionReason && (
                        <p className="mt-1 max-w-[180px] text-[10px] text-red-500">
                          {o.rejectionReason}
                        </p>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <div className="flex gap-1">
                        {o.status === 'ACTIVE' && (
                          <Button
                            variant="subtle"
                            size="xs"
                            color="primary"
                            component={Link}
                            href={`/outfit/${o.slug}`}>
                            View
                          </Button>
                        )}
                        <Button
                          variant="subtle"
                          size="xs"
                          color="primary"
                          component={Link}
                          href={`/owner/listings/${o.id}/edit`}>
                          Edit
                        </Button>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        )}
      </section>
    </StoreShell>
  );
};

export default OwnerListings;
