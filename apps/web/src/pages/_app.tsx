import '@/styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/dates/styles.css';

import { useState } from 'react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { AppProps } from 'next/app';
// eslint-disable-next-line camelcase -- next/font export names are fixed by Next.js
import { Cinzel, Cormorant_Garamond, Inter } from 'next/font/google';

import RouterTransition from '@/components/RouterTransition';
import theme from '@/styles/theme';

import useMSWMockServer from '../apis/mocks/hook';
import type { NextPageWithLayout } from '../types';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const [queryClient] = useState(() => new QueryClient());

  const getLayout = Component.getLayout || ((page) => page);

  // TODO: Remove this hook when the mock server is no longer needed.
  const shouldRender = useMSWMockServer();

  if (shouldRender === false) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <ColorSchemeScript defaultColorScheme="light" />
        <MantineProvider theme={theme} defaultColorScheme="light">
          <div className={`${inter.variable} ${cormorant.variable} ${cinzel.variable}`}>
            <RouterTransition />
            <Notifications />
            <ReactQueryDevtools initialIsOpen={false} />
            {getLayout(<Component {...pageProps} />)}
          </div>
        </MantineProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default App;
