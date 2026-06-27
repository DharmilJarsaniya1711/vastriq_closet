import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dropzone/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Router from './Router';
import theme from './theme';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme} forceColorScheme="light">
      <ModalsProvider>
        <ColorSchemeScript forceColorScheme="light" />
        <Notifications />
        <ReactQueryDevtools initialIsOpen={false} />

        <Router />
      </ModalsProvider>
    </MantineProvider>
  </QueryClientProvider>
);

export default App;
