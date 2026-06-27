import { useState } from 'react';
import { Button, ColorSwatch, Group, Loader, Switch, Table, Tabs, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useCatalog, useCatalogMutations } from '../../apis/queries/admin.queries';
import { CatalogItem, CatalogType } from '../../apis/requests/admin.requests';

interface TabConfig {
  type: CatalogType;
  activeKey: 'isActive' | 'isServiceable';
  extraLabel?: string; // colors -> hex, cities -> state
  extraKey?: 'hex' | 'state';
}

const CatalogTab = ({ type, activeKey, extraLabel, extraKey }: TabConfig) => {
  const { data: items, isLoading } = useCatalog(type);
  const { create, update } = useCatalogMutations(type);

  const [name, setName] = useState('');
  const [extra, setExtra] = useState('');

  const onCreate = () => {
    if (name.trim().length < 1) return;
    const body: Record<string, unknown> = { name: name.trim() };
    if (extraKey && extra.trim()) body[extraKey] = extra.trim();
    create.mutate(body, {
      onSuccess: () => {
        notifications.show({ title: 'Added', message: `${name.trim()} created` });
        setName('');
        setExtra('');
      },
      onError: (e) => notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
    });
  };

  const toggle = (item: CatalogItem) => {
    const current = (item[activeKey] ?? true) as boolean;
    update.mutate(
      { id: item.id, body: { [activeKey]: !current } },
      {
        onError: (e) => notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );
  };

  return (
    <div className="space-y-4 pt-4">
      <Group align="flex-end" gap="sm">
        <TextInput
          label="Name"
          placeholder={`New ${type.slice(0, -1)}`}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {extraKey && (
          <TextInput
            label={extraLabel}
            placeholder={extraKey === 'hex' ? '#0F4C3A' : 'State'}
            value={extra}
            onChange={(e) => setExtra(e.currentTarget.value)}
          />
        )}
        <Button color="primary" loading={create.isPending} onClick={onCreate}>
          Add
        </Button>
      </Group>

      <div className="rounded-lg border border-gold-200 bg-cream-25 p-2 shadow-sm">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader color="primary" />
          </div>
        ) : (
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Slug</Table.Th>
                {extraKey && <Table.Th>{extraLabel}</Table.Th>}
                <Table.Th>Enabled</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td className="font-medium text-primary-900">{item.name}</Table.Td>
                  <Table.Td className="text-xs text-gray-400">{item.slug}</Table.Td>
                  {extraKey && (
                    <Table.Td>
                      {extraKey === 'hex' && item.hex ? (
                        <Group gap="xs">
                          <ColorSwatch color={item.hex} size={16} />
                          <span className="text-xs text-gray-500">{item.hex}</span>
                        </Group>
                      ) : (
                        <span className="text-sm text-gray-500">{item.state ?? '—'}</span>
                      )}
                    </Table.Td>
                  )}
                  <Table.Td>
                    <Switch
                      checked={(item[activeKey] ?? true) as boolean}
                      onChange={() => toggle(item)}
                      color="primary"
                    />
                  </Table.Td>
                </Table.Tr>
              ))}
              {items?.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4} className="text-center text-sm text-gray-400">
                    Nothing here yet.
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

const CatalogPage = () => (
  <div className="space-y-6">
    <div>
      <p className="vc-wordmark text-xs text-gold-700">Master data</p>
      <h1 className="mt-2 font-serif text-4xl text-primary-900">Catalog master</h1>
      <p className="mt-1 text-sm text-gray-500">
        Add or disable categories, colors, occasions and cities. Disabling hides an item from new
        listings &amp; filters; existing listings are untouched.
      </p>
    </div>

    <Tabs defaultValue="categories" color="primary">
      <Tabs.List>
        <Tabs.Tab value="categories">Categories</Tabs.Tab>
        <Tabs.Tab value="colors">Colors</Tabs.Tab>
        <Tabs.Tab value="occasions">Occasions</Tabs.Tab>
        <Tabs.Tab value="cities">Cities</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="categories">
        <CatalogTab type="categories" activeKey="isActive" />
      </Tabs.Panel>
      <Tabs.Panel value="colors">
        <CatalogTab type="colors" activeKey="isActive" extraLabel="Hex" extraKey="hex" />
      </Tabs.Panel>
      <Tabs.Panel value="occasions">
        <CatalogTab type="occasions" activeKey="isActive" />
      </Tabs.Panel>
      <Tabs.Panel value="cities">
        <CatalogTab type="cities" activeKey="isServiceable" extraLabel="State" extraKey="state" />
      </Tabs.Panel>
    </Tabs>
  </div>
);

export default CatalogPage;
