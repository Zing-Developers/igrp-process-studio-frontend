import type { UserProfileDTO } from '@irn/framework-process-studio-types';

type UserCellProps = {
  user?: UserProfileDTO | string;
  className?: string;
};

const getInitials = (user?: UserProfileDTO | string): string => {
  const name = typeof user === 'string'
    ? user
    : user?.fullName ?? user?.username ?? user?.email ?? '';
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || '—';
};

/** Displays an audited user with initials, username, and e-mail address. */
export function UserCell({ user, className }: UserCellProps) {
  const profile = typeof user === 'string' ? undefined : user;
  const displayName = typeof user === 'string'
    ? user
    : profile?.username ?? profile?.fullName ?? 'Utilizador não disponível';

  return (
    <div className={`flex min-w-44 items-center gap-2 ${className ?? ''}`}>
      <div
        aria-label={`Avatar de ${displayName}`}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
        title={profile?.fullName ?? displayName}
      >
        {getInitials(user)}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{displayName}</div>
        <div className="truncate text-muted-foreground">{profile?.email ?? '—'}</div>
      </div>
    </div>
  );
}
