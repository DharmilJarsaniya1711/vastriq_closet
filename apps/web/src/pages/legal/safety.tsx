import { NextSeo } from 'next-seo';

import StoreShell from '@/components/layouts/StoreShell';

const points = [
  {
    title: 'We only connect you — we never handle money',
    body: 'VASTRIQ CLOSET is a noticeboard. We do not collect rent, hold deposits, process payments, arrange delivery, or guarantee any listing. Everything is arranged directly between you and the other person.',
  },
  {
    title: 'Never pay in advance',
    body: 'Do not transfer money, deposits, or "booking fees" before you have seen and verified the outfit in person. Be wary of anyone who pressures you to pay quickly or move off the platform.',
  },
  {
    title: 'Verify the outfit and the person',
    body: 'Inspect the outfit for condition, size, and authenticity before paying. Meet in a safe, public place where possible, and keep your conversation within the app so there is a record.',
  },
  {
    title: 'Agree the terms in writing (in chat)',
    body: 'Confirm rent, refundable deposit, rental dates, pickup/return, and who pays for cleaning or damage — in chat — before handing over money or the outfit.',
  },
  {
    title: 'Report anything suspicious',
    body: 'Use the Report button on any listing, profile, or message to flag scams, fakes, or abuse. You can also block a user to stop them contacting you.',
  },
];

const SafetyPage = () => (
  <StoreShell>
    <NextSeo title="Safety tips — VASTRIQ CLOSET" />
    <section className="container mx-auto max-w-3xl px-6 py-16">
      <p className="vc-wordmark text-xs text-gold-700">Trust &amp; Safety</p>
      <h1 className="mt-2 font-serif text-4xl text-primary-900">Renting &amp; listing safely</h1>
      <p className="mt-4 text-gray-500">
        VASTRIQ CLOSET connects renters and owners directly. Because we are not party to any rental,
        your safety depends on a few sensible precautions. Please read these before you transact.
      </p>

      <div className="mt-10 space-y-6">
        {points.map((p) => (
          <div
            key={p.title}
            className="rounded-lg border border-gold-200 bg-cream-25 p-6 shadow-sm">
            <h2 className="font-serif text-xl text-primary-900">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-gold-300 bg-cream-50 p-6 text-sm text-gray-600">
        VASTRIQ CLOSET does not mediate payments, deposits, damage, or disputes. Use your own
        judgement. If something feels wrong, walk away and report it.
      </div>
    </section>
  </StoreShell>
);

export default SafetyPage;
