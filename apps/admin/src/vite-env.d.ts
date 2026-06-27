/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string;
  VITE_ENABLE_API_MOCKING: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
