import { useState } from 'react';
import { Badge, Button, Group, Loader, Select, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useReports, useResolveReport } from '../../apis/queries/admin.queries';

const statusColor: Record<string, string> = {
  OPEN: 'warning',
  REVIEWING: 'primary',
  ACTIONED: 'success',
  DISMISSED: 'gray',
};

const ReportsPage = () => {
  const [status, setStatus] = useState<string | null>('OPEN');
  const { data: reports, isLoading } = useReports(status ?? undefined);
  const resolve = useResolveReport();

  const act = (id: string, next: string) => {
    let resolution: string | undefined;
    if (next === 'ACTIONED' || next === 'DISMISSED') {
      // eslint-disable-next-line no-alert
      const note = window.prompt(`Resolution note for ${next.toLowerCase()} (optional):`);
      resolution = note || undefined;
    }
    resolve.mutate(
      { id, status: next, resolution },
      {
        onSuccess: () => notifications.show({ title: 'Updated', message: `Report set to ${next}` }),
        onError: (e) =>
          notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Trust &amp; Safety</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Reports queue</h1>
        <p className="mt-1 text-sm text-gray-500">Review reported listings, users and messages.</p>
      </div>

      <div className="max-w-xs">
        <Select
          label="Status"
          placeholder="All"
          clearable
          data={['OPEN', 'REVIEWING', 'ACTIONED', 'DISMISSED']}
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
                <Table.Th>Target</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Filed</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reports?.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>
                    <Badge variant="outline" color="primary">
                      {r.targetType}
                    </Badge>
                    <p className="mt-1 text-[10px] text-gray-400">{r.targetId}</p>
                  </Table.Td>
                  <Table.Td>
                    <p className="text-sm text-primary-900">{r.reason}</p>
                    {r.details && <p className="max-w-sm text-xs text-gray-500">{r.details}</p>}
                    {r.resolution && (
                      <p className="mt-1 text-xs text-gray-400">Resolution: {r.resolution}</p>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[r.status] ?? 'gray'} variant="light">
                      {r.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="light" onClick={() => act(r.id, 'REVIEWING')}>
                        Reviewing
                      </Button>
                      <Button
                        size="xs"
                        color="success"
                        variant="light"
                        onClick={() => act(r.id, 'ACTIONED')}>
                        Action
                      </Button>
                      <Button
                        size="xs"
                        color="gray"
                        variant="light"
                        onClick={() => act(r.id, 'DISMISSED')}>
                        Dismiss
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {reports?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={5} className="text-center text-sm text-gray-400">
                    No reports in this state.
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

export default ReportsPage;
