import { useEffect, useState } from 'react';
import { Alert, Button, Textarea, TextInput } from '@mantine/core';
import { NextSeo } from 'next-seo';

import { useMe } from '@/apis/queries/auth.queries';
import { useSubmitContact } from '@/apis/queries/contact.queries';
import StoreShell from '@/components/layouts/StoreShell';

const ContactPage = () => {
  const { data: user } = useMe();
  const submit = useSubmitContact();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Prefill from the signed-in user once it loads.
  useEffect(() => {
    if (!user) return;
    setName((n) => n || [user.firstName, user.lastName].filter(Boolean).join(' '));
    setEmail((e) => e || user.email || '');
    setPhone((p) => p || user.phone || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2 || !email.trim() || message.trim().length < 5) {
      setError('Please add your name, email and a short message.');
      return;
    }
    try {
      await submit.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message || 'Could not send your message. Please try again.');
    }
  };

  return (
    <StoreShell>
      <NextSeo title="Contact us — VASTRIQ CLOSET" />
      <section className="container mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:items-start">
          {/* Intro */}
          <div>
            <p className="vc-wordmark text-xs text-gold-700">Get in touch</p>
            <h1 className="mt-2 font-serif text-4xl text-primary-900">Contact us</h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Questions about listing, renting, or your account? Send us a message and our team
              will get back to you by email. We usually reply within one working day.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div>
                <p className="font-medium text-primary-900">Email</p>
                <a href="mailto:support@vastriqcloset.com" className="text-primary-700 hover:underline">
                  support@vastriqcloset.com
                </a>
              </div>
              <div>
                <p className="font-medium text-primary-900">Hours</p>
                <p className="text-gray-500">Mon–Sat, 10:00 AM – 7:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-gold-200 bg-cream-25 p-7 shadow-sm">
            {done ? (
              <div className="py-10 text-center">
                <p className="font-serif text-2xl text-primary-900">Message sent ✓</p>
                <p className="mt-2 text-sm text-gray-500">
                  Thanks for reaching out — we&apos;ve received your query and will reply by email soon.
                </p>
                <Button
                  className="mt-6"
                  variant="outline"
                  color="primary"
                  onClick={() => {
                    setSubject('');
                    setMessage('');
                    setDone(false);
                  }}
                >
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert color="red" variant="light">
                    {error}
                  </Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput
                    label="Phone (optional)"
                    placeholder="+91 99999 00001"
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                  />
                  <TextInput
                    label="Subject (optional)"
                    placeholder="What's this about?"
                    value={subject}
                    onChange={(e) => setSubject(e.currentTarget.value)}
                  />
                </div>
                <Textarea
                  label="Message"
                  placeholder="How can we help?"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" color="primary" loading={submit.isPending}>
                    Send message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </StoreShell>
  );
};

export default ContactPage;
