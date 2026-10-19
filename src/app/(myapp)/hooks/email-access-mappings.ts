import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EmailAccessMappingFilter } from '@irn/framework-process-studio-types';
import { getEmailAccessMappings } from '../functions/email-access-mappings';

export const emailAccessMappingsPageSize = 10;

export const useEmailAccessMappings = (pageNumber: number) => {
  const queryResult = useQuery({
    queryKey: ['email-access-mappings', pageNumber, emailAccessMappingsPageSize],
    queryFn: () =>
      getEmailAccessMappings({
        pageNumber,
        pageSize: emailAccessMappingsPageSize,
      } satisfies EmailAccessMappingFilter),
  });
  const mappingsResult = queryResult.data;
  const mappingsPage = mappingsResult?.success ? mappingsResult.data : undefined;
  const mappings = useMemo(() => mappingsPage?.content ?? [], [mappingsPage]);
  const totalPages = useMemo(() => {
    if (!mappingsPage) return undefined;
    if (typeof mappingsPage.totalPages === 'number' && mappingsPage.totalPages >= 0) {
      return mappingsPage.totalPages;
    }
    if (typeof mappingsPage.totalElements === 'number' && mappingsPage.totalElements >= 0) {
      return Math.ceil(mappingsPage.totalElements / emailAccessMappingsPageSize);
    }
    return undefined;
  }, [mappingsPage]);

  return {
    ...queryResult,
    mappingsResult,
    mappingsPage,
    mappings,
    totalPages,
    totalMappings: mappingsPage?.totalElements ?? mappings.length,
    isFirstPage: mappingsPage?.first ?? pageNumber === 0,
    isLastPage:
      mappingsPage?.last ?? (totalPages !== undefined ? pageNumber >= totalPages - 1 : true),
    showPagination:
      (totalPages !== undefined && totalPages > 1) || pageNumber > 0 || mappingsPage?.last === false,
  };
};
