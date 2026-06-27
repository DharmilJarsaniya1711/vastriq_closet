import { useState } from 'react';
import { Badge, Button, Group, Loader, Select, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useContactQueries, useResolveContactQuery } from '../../apis/queries/admin.queries';

const statusColor: Record<string, string> = {
  NEW: 'warning',
  RESOLVED: 'success',
};

const ContactPage = () => {
  const [status, setStatus] = useState<string | null>('NEW');
  const { data: queries, isLoading } = useContactQueries(status ?? undefined);
  const resolve = useResolveContactQuery();

  const setStatusFor = (id: string, next: string) =>
    resolve.mutate(
      { id, status: next },
      {
        onSuccess: () =>
          notifications.show({ title: 'Updated', message: `Query marked ${next.toLowerCase()}` }),
        onError: (e) =>
          notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Support</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Contact queries</h1>
        <p className="mt-1 text-sm text-gray-500">
          Messages submitted from the public “Contact us” form.
        </p>
      </div>

      <div className="max-w-xs">
        <Select
          label="Status"
          placeholder="All"
          clearable
          data={['NEW', 'RESOLVED']}
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
                <Table.Th>From</Table.Th>
                <Table.Th>Subject &amp; message</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Received</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {queries?.map((qr) => (
                <Table.Tr key={qr.id}>
                  <Table.Td>
                    <p className="text-sm font-medium text-primary-900">{qr.name}</p>
                    <a
                      href={`mailto:${qr.email}`}
                      className="text-xs text-primary-700 hover:underline">
                      {qr.email}
                    </a>
                    {qr.phone && <p className="text-xs text-gray-400">{qr.phone}</p>}
                  </Table.Td>
                  <Table.Td>
                    {qr.subject && (
                      <p className="text-sm font-medium text-primary-900">{qr.subject}</p>
                    )}
                    <p className="max-w-md whitespace-pre-wrap text-xs text-gray-500">
                      {qr.message}
                    </p>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[qr.status] ?? 'gray'} variant="light">
                      {qr.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <span className="text-xs text-gray-400">
                      {new Date(qr.createdAt).toLocaleString('en-IN')}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {qr.status === 'NEW' ? (
                        <Button
                          size="xs"
                          color="success"
                          variant="light"
                          onClick={() => setStatusFor(qr.id, 'RESOLVED')}>
                          Mark resolved
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          color="gray"
                          variant="light"
                          onClick={() => setStatusFor(qr.id, 'NEW')}>
                          Reopen
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {queries?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} className="text-center text-sm text-gray-400">
                    No queries in this state.
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

export default ContactPage;
