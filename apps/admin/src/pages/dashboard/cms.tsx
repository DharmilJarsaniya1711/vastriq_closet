import { useState } from 'react';
import {
  Button,
  FileInput,
  Group,
  Loader,
  NumberInput,
  Switch,
  Table,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useBannerMutations, useBanners } from '../../apis/queries/admin.queries';
import { Banner, uploadAdminImage } from '../../apis/requests/admin.requests';

const CmsPage = () => {
  const { data: banners, isLoading } = useBanners();
  const { create, update, remove } = useBannerMutations();

  const [title, setTitle] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [order, setOrder] = useState<number | string>(0);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const onCreate = async () => {
    if (!title.trim() || !file) {
      notifications.show({
        color: 'red',
        title: 'Missing',
        message: 'Title and image are required',
      });
      return;
    }
    setBusy(true);
    try {
      const imageUrl = await uploadAdminImage(file);
      await create.mutateAsync({
        title: title.trim(),
        imageUrl,
        ctaUrl: ctaUrl.trim() || undefined,
        order: Number(order) || 0,
      });
      notifications.show({ title: 'Added', message: 'Banner created' });
      setTitle('');
      setCtaUrl('');
      setOrder(0);
      setFile(null);
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const toggle = (b: Banner) =>
    update.mutate(
      { id: b.id, body: { isActive: !b.isActive } },
      {
        onError: (e) =>
          notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );

  const del = (b: Banner) =>
    remove.mutate(b.id, {
      onSuccess: () => notifications.show({ title: 'Removed', message: 'Banner deleted' }),
      onError: (e) =>
        notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
    });

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Storefront</p>
        <h1 className="mt-2 font-serif text-3xl text-primary-900 sm:text-4xl">CMS / Banners</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the hero banners shown on the storefront landing.
        </p>
      </div>

      {/* Create */}
      <div className="space-y-4 rounded-lg border border-gold-200 bg-cream-25 p-6 shadow-sm">
        <h2 className="font-serif text-xl text-primary-900">Add a banner</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Title"
            placeholder="Bridal season is here"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            required
          />
          <TextInput
            label="CTA link (optional)"
            placeholder="/c/bridal-lehenga"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.currentTarget.value)}
          />
          <NumberInput label="Order" min={0} value={order} onChange={setOrder} />
          <FileInput
            label="Banner image"
            placeholder="Select an image"
            accept="image/png,image/jpeg,image/webp"
            value={file}
            onChange={setFile}
            clearable
            required
          />
        </div>
        <Group justify="flex-end">
          <Button color="primary" loading={busy} onClick={onCreate}>
            Add banner
          </Button>
        </Group>
      </div>

      {/* List */}
      <div className="rounded-lg border border-gold-200 bg-cream-25 p-2 shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader color="primary" />
          </div>
        ) : (
          <Table.ScrollContainer minWidth={680}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Preview</Table.Th>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>CTA</Table.Th>
                  <Table.Th>Order</Table.Th>
                  <Table.Th>Active</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {banners?.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>
                      {}
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="h-12 w-24 rounded border border-gold-200 object-cover"
                      />
                    </Table.Td>
                    <Table.Td className="font-medium text-primary-900">{b.title}</Table.Td>
                    <Table.Td className="text-xs text-gray-400">{b.ctaUrl ?? '—'}</Table.Td>
                    <Table.Td>{b.order}</Table.Td>
                    <Table.Td>
                      <Switch checked={b.isActive} onChange={() => toggle(b)} color="primary" />
                    </Table.Td>
                    <Table.Td>
                      <Button size="xs" color="danger" variant="light" onClick={() => del(b)}>
                        Delete
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {banners?.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={6} className="text-center text-sm text-gray-400">
                      No banners yet — add one above.
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

export default CmsPage;
