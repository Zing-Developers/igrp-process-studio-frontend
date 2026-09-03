import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system';

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
      <IGRPLoadingSpinner />
      <span>{message}</span>
    </div>
  );
}

export { IgrpLoading };
