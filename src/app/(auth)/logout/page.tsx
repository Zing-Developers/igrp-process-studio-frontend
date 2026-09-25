'use client';

import { useEffect } from 'react';
import { signOutIRN } from '@irn/irn-core-framework/client';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      await signOutIRN({ redirect: false });
    })();
  }, []);

  // TODO: apply design
  return <div>A terminar a sessão...</div>;
}
