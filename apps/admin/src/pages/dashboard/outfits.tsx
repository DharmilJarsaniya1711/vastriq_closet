import { ReactNode, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Group,
  Loader,
  Modal,
  Select,
  Table,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useAdminOutfits, useModerateOutfit } from '../../apis/queries/admin.queries';
import { AdminOutfit } from '../../apis/requests/admin.requests';

const fmt = (n?: number | null) => (n == null ? '—' : `₹ ${n.toLocaleString('en-IN')}`);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-b border-gold-100 py-2 last:border-0">
    <p className="text-[11px] uppercase tracking-wide text-gold-700">{label}</p>
    <div className="mt-0.5 text-sm text-primary-900">{children || '—'}</div>
  </div>
);

const statusColor: Record<string, string> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  DRAFT: 'gray',
  REJECTED: 'danger',
  ARCHIVED: 'gray',
};

const OutfitsPage = () => {
  const [status, setStatus] = useState<string | null>('PENDING');
  const { data, isLoading } = useAdminOutfits({ status: status ?? undefined });
  const { approve, reject } = useModerateOutfit();

  const [opened, { open, close }] = useDisclosure(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const [reviewOutfit, setReviewOutfit] = useState<AdminOutfit | null>(null);

  const onApprove = (id: string) =>
    approve.mutate(id, {
      onSuccess: () => notifications.show({ title: 'Approved', message: 'Listing is now live' }),
      onError: (e) =>
        notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
    });

  const openReject = (id: string) => {
    setRejectId(id);
    setReason('');
    open();
  };

  const submitReject = () => {
    if (!rejectId || reason.trim().length < 3) return;
    reject.mutate(
      { id: rejectId, reason: reason.trim() },
      {
        onSuccess: () => {
          notifications.show({ title: 'Rejected', message: 'Listing was rejected' });
          close();
        },
        onError: (e) =>
          notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Inventory</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Listings moderation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Approve or reject listings before they go live.
        </p>
      </div>

      <div className="max-w-xs">
        <Select
          label="Status"
          placeholder="All"
          clearable
          data={['DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED']}
          value={status}
          onChange={setStatus}
        />
      </div>

      <div className="rounded-lg border border-gold-200 bg-cream-25 p-2 shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader color="primary" />
          </div>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Outfit</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Category</Table.Th>
                <Table.Th>Rent / day</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.items.map((o) => (
                <Table.Tr key={o.id}>
                  <Table.Td>
                    <div className="flex items-center gap-3">
                      {o.imageUrls?.[0] && (
                        <img
                          src={o.imageUrls[0]}
                          alt={o.title}
                          className="h-12 w-10 rounded border border-gold-200 object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-primary-900">{o.title}</p>
                        <p className="text-xs text-gray-400">{o.slug}</p>
                      </div>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <p className="text-sm text-gray-500">
                      {o.owner?.ownerProfile?.brandName ??
                        [o.owner?.firstName, o.owner?.lastName].filter(Boolean).join(' ') ??
                        '—'}
                    </p>
                  </Table.Td>
                  <Table.Td>{o.category?.name ?? '—'}</Table.Td>
                  <Table.Td>₹ {o.rentPerDay?.toLocaleString('en-IN')}</Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[o.status] ?? 'gray'} variant="light">
                      {o.status}
                    </Badge>
                    {o.status === 'REJECTED' && o.rejectionReason && (
                      <p className="mt-1 max-w-[160px] text-[10px] text-red-500">
                        {o.rejectionReason}
                      </p>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" onClick={() => setReviewOutfit(o)}>
                        Review
                      </Button>
                      <Button
                        size="xs"
                        color="success"
                        variant="light"
                        disabled={o.status === 'ACTIVE'}
                        loading={approve.isPending && approve.variables === o.id}
                        onClick={() => onApprove(o.id)}>
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        color="danger"
                        variant="light"
                        disabled={o.status === 'REJECTED'}
                        onClick={() => openReject(o.id)}>
                        Reject
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {data?.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6} className="text-center text-sm text-gray-400">
                    No listings match the filter.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </div>

      <Modal opened={opened} onClose={close} title="Reject listing" centered>
        <Textarea
          label="Reason"
          placeholder="Tell the owner why this listing was rejected"
          minRows={3}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button
            color="danger"
            disabled={reason.trim().length < 3}
            loading={reject.isPending}
            onClick={submitReject}>
            Reject listing
          </Button>
        </Group>
      </Modal>

      {/* Full review drawer */}
      <Drawer
        opened={!!reviewOutfit}
        onClose={() => setReviewOutfit(null)}
        position="right"
        size="lg"
        title="Review listing">
        {reviewOutfit && (
          <div className="space-y-4">
            {(reviewOutfit.imageUrls?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {reviewOutfit.imageUrls!.map((src, i) => (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img
                    key={src}
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="h-32 w-28 rounded-md border border-gold-200 object-cover"
                  />
                ))}
              </div>
            )}

            <h2 className="font-serif text-2xl text-primary-900">{reviewOutfit.title}</h2>
            <Badge color={statusColor[reviewOutfit.status] ?? 'gray'} variant="light">
              {reviewOutfit.status}
            </Badge>

            <div className="rounded-lg border border-gold-200 bg-cream-25 p-4">
              <Field label="Owner">
                {reviewOutfit.owner?.ownerProfile?.brandName ??
                  [reviewOutfit.owner?.firstName, reviewOutfit.owner?.lastName]
                    .filter(Boolean)
                    .join(' ')}
                {reviewOutfit.owner?.phone ? ` · ${reviewOutfit.owner.phone}` : ''}
              </Field>
              <Field label="Category">{reviewOutfit.category?.name}</Field>
              <Field label="Color">{reviewOutfit.color}</Field>
              <Field label="Occasions">{(reviewOutfit.occasionSlugs ?? []).join(', ')}</Field>
              <Field label="Available cities">{(reviewOutfit.citySlugs ?? []).join(', ')}</Field>
              <Field label="Rent / day">{fmt(reviewOutfit.rentPerDay)}</Field>
              <Field label="Refundable deposit">{fmt(reviewOutfit.securityDeposit)}</Field>
              <Field label="MRP">{fmt(reviewOutfit.mrp)}</Field>
              <Field label="Availability note">{reviewOutfit.availabilityNote}</Field>
              <Field label="Description">
                <span className="whitespace-pre-wrap">{reviewOutfit.description}</span>
              </Field>
              {reviewOutfit.status === 'REJECTED' && (
                <Field label="Rejection reason">
                  <span className="text-red-500">{reviewOutfit.rejectionReason}</span>
                </Field>
              )}
            </div>

            <Group justify="flex-end">
              <Button
                color="success"
                disabled={reviewOutfit.status === 'ACTIVE'}
                onClick={() => {
                  onApprove(reviewOutfit.id);
                  setReviewOutfit(null);
                }}>
                Approve
              </Button>
              <Button
                color="danger"
                variant="light"
                disabled={reviewOutfit.status === 'REJECTED'}
                onClick={() => {
                  const { id } = reviewOutfit;
                  setReviewOutfit(null);
                  openReject(id);
                }}>
                Reject
              </Button>
            </Group>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default OutfitsPage;
