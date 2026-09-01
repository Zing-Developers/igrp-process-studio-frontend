import { useQuery } from '@tanstack/react-query';
import { getProject } from '../functions/project';
import { PaginatedResponse, Project } from '@igrp/framework-process-studio-types';

export const useProject = () => {
  return useQuery<PaginatedResponse<Project>>({
    queryKey: ['project'],
    queryFn: () => getProject(),
  });
};
