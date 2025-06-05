'use client';

import { useEffect, useState } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return null on the first render (server-side)
  if (!isClient) {
    return null;
  }

  // Return children on subsequent renders (client-side)
  return <>{children}</>;
}
