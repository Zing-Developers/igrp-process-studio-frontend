'use client';

import { useEffect } from 'react';
import { signOut } from '@igrp/framework-next-auth/client';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {

      const baseUrl = process.env.NEXTAUTH_URL;

      const endSessionUrl = baseUrl ? `${baseUrl}/login` : '/login';

      await signOut({ redirect: false });

      window.location.href = endSessionUrl;
    })();
  }, []);

  // TODO: apply design
  return <div>Logout in progress</div>;
}
