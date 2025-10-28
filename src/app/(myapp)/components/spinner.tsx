import { Loader2Icon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  isLoading?: boolean;
  size?: number;
  className?: string;
}

function Spinner({ isLoading, size = 4, className, ...props }: SpinnerProps) {
  if (!isLoading) return null;
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
