import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';

const sections = [
  {
    title: 'What we collect',
    body: 'Your mobile number (for login), the display name and city you provide, your listings, wishlist, reviews, reports, and the messages you exchange with other users.',
  },
  {
    title: 'How we use it',
    body: 'To operate the service: authenticate you, show your listings, connect you with other users, moderate content, and keep the platform safe.',
  },
  {
    title: 'Chat privacy',
    body: 'We do not read your conversations by default. A conversation is only surfaced to our moderators when a report references it, and such access is logged.',
  },
  {
    title: 'Sharing',
    body: 'Your public profile and listings are visible to other users. We do not sell your personal data. We may share data where required by law.',
  },
  {
    title: 'Your choices',
    body: 'You can edit your profile, archive your listings, block other users, and request account deletion.',
  },
];

const PrivacyPage = () => (
  <StoreShell>
    <NextSeo title="Privacy Policy — VASTRIQ CLOSET" />
    <section className="container mx-auto max-w-3xl px-6 py-16">
      <p className="vc-wordmark text-xs text-gold-700">Legal</p>
      <h1 className="mt-2 font-serif text-4xl text-primary-900">Privacy Policy</h1>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-serif text-xl text-primary-900">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  </StoreShell>
);

export default PrivacyPage;
