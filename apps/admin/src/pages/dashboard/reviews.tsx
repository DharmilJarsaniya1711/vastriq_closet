import { Badge, Button, Group, Loader, Rating, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useModerateReview, usePendingReviews } from '../../apis/queries/admin.queries';

const ReviewsPage = () => {
  const { data: reviews, isLoading } = usePendingReviews();
  const { approve, hide } = useModerateReview();

  const act = (
    fn: typeof approve,
    id: string,
    okMsg: string
  ) =>
    fn.mutate(id, {
      onSuccess: () => notifications.show({ title: 'Done', message: okMsg }),
      onError: (e) => notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
    });

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Trust &amp; Safety</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Reviews moderation</h1>
        <p className="mt-1 text-sm text-gray-500">Approve reviews to publish them, or hide them.</p>
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
                <Table.Th>Rating</Table.Th>
                <Table.Th>Review</Table.Th>
                <Table.Th>Author</Table.Th>
                <Table.Th>Outfit</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reviews?.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>
                    <Rating value={r.rating} readOnly size="xs" />
                  </Table.Td>
                  <Table.Td>
                    {r.title && <p className="font-medium text-primary-900">{r.title}</p>}
                    {r.body && <p className="max-w-sm text-xs text-gray-500">{r.body}</p>}
                  </Table.Td>
                  <Table.Td>
                    <span className="text-sm text-gray-500">
                      {[r.author?.firstName, r.author?.lastName].filter(Boolean).join(' ') || 'Anonymous'}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span className="text-xs text-gray-400">{r.outfit?.title ?? '—'}</span>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="success"
                        variant="light"
                        loading={approve.isPending && approve.variables === r.id}
                        onClick={() => act(approve, r.id, 'Review approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        color="danger"
                        variant="light"
                        loading={hide.isPending && hide.variables === r.id}
                        onClick={() => act(hide, r.id, 'Review hidden')}
                      >
                        Hide
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {reviews?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} className="text-center text-sm text-gray-400">
                    <Badge color="success" variant="light">
                      All caught up
                    </Badge>{' '}
                    — no reviews awaiting moderation.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
