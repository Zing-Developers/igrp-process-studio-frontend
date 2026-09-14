export function PageHeader({
  name,
  description,
  badgeCount,
  children,
}: {
  name: string;
  description: string;
  badgeCount?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-4 grid gap-3 md:flex md:justify-between md:items-center">
      <div>
        <div className="inline-flex gap-x-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
            {name}
          </h2>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              {badgeCount}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-neutral-400">
          {description}
        </p>
      </div>

      <div>{children}</div>
    </div>
  );
}
