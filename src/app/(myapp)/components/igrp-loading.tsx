import { IRNSpinner } from '@irn/irn-backoffice-design-system';

function IgrpLoading({
  loading,
  message = 'A carregar definições de processo...',
}: {
  loading: boolean;
  message?: string;
}) {
  if (!loading) return null;
  return (
    <div className="flex items-center gap2 flex-col">
      <IRNSpinner size="lg" />
      <span>{message}</span>
    </div>
  );
}

export { IgrpLoading };
