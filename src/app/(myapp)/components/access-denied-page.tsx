'use client';

import { IGRPButton } from '@igrp/igrp-framework-react-design-system';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AccessDeniedPageProps = {
  description?: string;
  status?: 401 | 403;
};

export function AccessDeniedPage({
  description = 'Não tem permissão para aceder a esta página.',
  status = 403,
}: AccessDeniedPageProps) {
  const router = useRouter();

  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl shadow-black/5">

        <div className="px-6 py-10 text-center sm:px-10">
          <div className="mb-6 mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
            <ShieldX className="size-10 text-destructive" aria-hidden="true" />
          </div>
          
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {status === 401 ? 'Autenticação necessária' : 'Acesso negado'}
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-muted-foreground">
            {description}
          </p>

          <div className="mt-8 border-t border-border pt-6">
            <IGRPButton
              name="backFromAccessDenied"
              variant="outline"
              className="min-w-40"
              onClick={() => router.back()}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar à página anterior
            </IGRPButton>
          </div> 
        </div>
      </div>
    </section>
  );
}
