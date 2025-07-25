import { useQuery } from '@tanstack/react-query';
import { getProject } from '../functions/project';
import { PaginatedResponse, Project } from '../types/global';

export const useProject = () => {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['process'],
    queryFn: () => getProject(),
  });
};
