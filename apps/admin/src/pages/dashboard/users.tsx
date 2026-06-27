import { useState } from 'react';
import { Badge, Loader, Select, Table, TextInput } from '@mantine/core';

import { useAdminUsers } from '../../apis/queries/admin.queries';

const UsersPage = () => {
  const [banned, setBanned] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const { data, isLoading } = useAdminUsers({
    banned: banned ?? undefined,
    q: q || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">People</p>
        <h1 className="mt-2 font-serif text-3xl text-primary-900 sm:text-4xl">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          {data ? `${data.total} total` : 'Loading'} · search and inspect every account.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Select
          label="Status"
          placeholder="All"
          clearable
          data={[{ value: 'true', label: 'Banned' }]}
          value={banned}
          onChange={setBanned}
        />
        <TextInput
          label="Search"
          placeholder="Name, email, phone"
          value={q}
          onChange={(e) => setQ(e.currentTarget.value)}
          className="md:col-span-3"
        />
      </div>

      <div className="rounded-lg border border-gold-200 bg-cream-25 p-2 shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader color="primary" />
          </div>
        ) : (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Contact</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Joined</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data?.items.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>
                      <p className="font-medium text-primary-900">
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                      </p>
                    </Table.Td>
                    <Table.Td>
                      <p className="text-xs text-gray-500">{u.email ?? '—'}</p>
                      <p className="text-xs text-gray-400">{u.phone ?? '—'}</p>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={u.type === 'ADMIN' ? 'gold' : 'primary'} variant="light">
                        {u.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {u.banned ? (
                        <Badge color="danger">Banned</Badge>
                      ) : (
                        <Badge color="success" variant="light">
                          Active
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <span className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {data?.items.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={5} className="text-center text-sm text-gray-400">
                      No users match those filters.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
