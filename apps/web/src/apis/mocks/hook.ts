import { useEffect, useState } from 'react';

function useMSWMockServer() {
  const [shouldRender, setShouldRender] = useState(
    process.env.NEXT_PUBLIC_ENABLE_API_MOCKING !== 'true'
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_API_MOCKING === 'true') {
      if (typeof window !== 'undefined') {
        import('./browser')
          .then(async ({ worker }) => {
            await worker.start();
            setShouldRender(true);
            return null;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }, []);

  return shouldRender;
}

export default useMSWMockServer;
