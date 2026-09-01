'use client';

import { IGRPButton } from '@igrp/igrp-framework-react-design-system';
import { useRouter } from 'next/navigation';

type AccessDeniedPageProps = {
  description?: string;
};

export function AccessDeniedPage({
  description = 'Não tem permissão para aceder a esta página.',
}: AccessDeniedPageProps) {
  const router = useRouter();

  return (
    <div className="page">
      <div className="section flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md space-y-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">Erro 403</p>
          <h1 className="text-2xl font-semibold">Acesso negado</h1>
          <p className="text-muted-foreground">{description}</p>
          <IGRPButton name="backFromAccessDenied" variant="outline" onClick={() => router.back()}>
            Voltar
          </IGRPButton>
        </div>
      </div>
    </div>
  );
}
