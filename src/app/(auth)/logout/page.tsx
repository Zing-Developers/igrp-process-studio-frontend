'use client';

import { useEffect } from 'react';
import { signOut } from '@igrp/framework-next-auth/client';

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      await signOut({ redirect: false });
    })();
  }, []);

  // TODO: apply design
  return <div>A terminar a sessão...</div>;
}
