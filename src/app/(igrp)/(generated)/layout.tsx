'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IGRPToaster } from '@igrp/igrp-framework-react-design-system';

export default function GeneratedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <IGRPToaster richColors />
    </QueryClientProvider>
  );
}
