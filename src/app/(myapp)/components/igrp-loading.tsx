import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system';

function IgrpLoading({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="flex items-center gap2 flex-col">
      <IGRPLoadingSpinner />
      <span>A carregar definições de processo...</span>
    </div>
  );
}

export { IgrpLoading };
