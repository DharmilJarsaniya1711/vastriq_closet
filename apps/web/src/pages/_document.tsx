import { ColorSchemeScript } from '@mantine/core';
import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => (
  <Html lang="en">
    <Head>
      <meta name="application-name" content="VASTRIQ CLOSET" />
      <meta name="theme-color" content="#0F4C3A" />
      <ColorSchemeScript defaultColorScheme="light" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
