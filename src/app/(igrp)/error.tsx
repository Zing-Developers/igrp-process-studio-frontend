'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold">Ocorreu um erro inesperado.</h1>
        <p className="mt-2 text-muted-foreground">
          A nossa equipa foi notificada e está a trabalhar para resolver o problema.
        </p>
        <p className="mt-4 rounded-lg bg-muted p-3 text-sm">
          {error.message || 'Erro desconhecido'}
        </p>
        <button
          className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={reset}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
