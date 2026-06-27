import { useEffect, useState } from 'react';
import { Button, Group, Loader, Select, Switch, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { useCatalog, useSettings, useUpdateSettings } from '../../apis/queries/admin.queries';

const SettingsPage = () => {
  const { data: settings, isLoading } = useSettings();
  const { data: cities } = useCatalog('cities');
  const update = useUpdateSettings();

  const [autoApprove, setAutoApprove] = useState(false);
  const [featuredCity, setFeaturedCity] = useState<string | null>(null);
  const [otpTemplate, setOtpTemplate] = useState('');
  const [supportEmail, setSupportEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setAutoApprove(settings.autoApproveListings);
      setFeaturedCity(settings.featuredCitySlug ?? null);
      setOtpTemplate(settings.otpMessageTemplate ?? '');
      setSupportEmail(settings.supportEmail ?? '');
    }
  }, [settings]);

  const save = () =>
    update.mutate(
      {
        autoApproveListings: autoApprove,
        featuredCitySlug: featuredCity || null,
        otpMessageTemplate: otpTemplate.trim() || null,
        supportEmail: supportEmail.trim() || null,
      },
      {
        onSuccess: () => notifications.show({ title: 'Saved', message: 'Settings updated' }),
        onError: (e) => notifications.show({ color: 'red', title: 'Error', message: (e as Error).message }),
      }
    );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="vc-wordmark text-xs text-gold-700">Configuration</p>
        <h1 className="mt-2 font-serif text-4xl text-primary-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Platform-wide controls.</p>
      </div>

      <div className="max-w-2xl space-y-6 rounded-lg border border-gold-200 bg-cream-25 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-medium text-primary-900">Auto-approve listings</p>
            <p className="text-xs text-gray-400">
              When on, new listings go live immediately instead of waiting for moderation.
            </p>
          </div>
          <Switch checked={autoApprove} onChange={(e) => setAutoApprove(e.currentTarget.checked)} color="primary" />
        </div>

        <Select
          label="Featured city"
          placeholder="None"
          clearable
          data={(cities ?? []).map((c) => ({ value: c.slug, label: c.name }))}
          value={featuredCity}
          onChange={setFeaturedCity}
        />

        <Textarea
          label="OTP message template"
          placeholder="Your VASTRIQ CLOSET code is {code}"
          autosize
          minRows={2}
          value={otpTemplate}
          onChange={(e) => setOtpTemplate(e.currentTarget.value)}
        />

        <TextInput
          label="Support email"
          placeholder="support@vastriq.example"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.currentTarget.value)}
        />

        <Group justify="flex-end">
          <Button color="primary" loading={update.isPending} onClick={save}>
            Save settings
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default SettingsPage;
