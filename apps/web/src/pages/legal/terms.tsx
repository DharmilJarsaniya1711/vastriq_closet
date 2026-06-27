import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';

const sections = [
  {
    title: '1. What VASTRIQ CLOSET is',
    body: 'VASTRIQ CLOSET is an online noticeboard that lets users list ethnic-wear outfits for rent and lets other users discover and contact them. We are an intermediary that provides discovery and a chat channel only. We are not a party to any rental agreement made between users.',
  },
  {
    title: '2. No transactions on the platform',
    body: 'We do not collect payments, hold security deposits, arrange delivery, or guarantee any listing, owner, or renter. All money, deposits, hand-over, and returns are arranged directly between users, off-platform, at their own risk.',
  },
  {
    title: '3. Eligibility & accounts',
    body: 'You must provide a valid mobile number to use the service. You are responsible for activity on your account and for the accuracy of your listings.',
  },
  {
    title: '4. Listings & conduct',
    body: 'You may only list outfits you own and are entitled to rent out. Listings are moderated and may be rejected or removed. Fraud, harassment, and misuse will result in removal and a ban.',
  },
  {
    title: '5. Liability',
    body: 'To the maximum extent permitted by law, VASTRIQ CLOSET is not liable for loss, damage, non-payment, or disputes arising from any rental arranged through the platform. You transact at your own risk.',
  },
];

const TermsPage = () => (
  <StoreShell>
    <NextSeo title="Terms of Use — VASTRIQ CLOSET" />
    <section className="container mx-auto max-w-3xl px-6 py-16">
      <p className="vc-wordmark text-xs text-gold-700">Legal</p>
      <h1 className="mt-2 font-serif text-4xl text-primary-900">Terms of Use</h1>
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

export default TermsPage;
