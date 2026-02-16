import { IGRPIcon } from '@igrp/igrp-framework-react-design-system';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  isLoading?: boolean;
  size?: number;
  className?: string;
}

export function Spinner({ isLoading, className, ...props }: SpinnerProps) {
  if (!isLoading) return null;
  return (
    <IGRPIcon iconName="LoaderCircle"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}