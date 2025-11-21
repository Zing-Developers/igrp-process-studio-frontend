import { IGRPLoadingSpinner } from '@igrp/igrp-framework-react-design-system';

function IgrpLoading({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="flex items-center gap2 flex-col">
      <IGRPLoadingSpinner />
      <span>loading process definitions...</span>
    </div>
  );
}

export { IgrpLoading };
