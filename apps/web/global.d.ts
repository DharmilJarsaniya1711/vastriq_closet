declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_DOMAINS: string;
      NEXT_PUBLIC_ENABLE_API_MOCKING: string;
    }
  }
}

export {};
