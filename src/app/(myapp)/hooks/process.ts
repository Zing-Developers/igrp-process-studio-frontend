import { useQuery } from '@tanstack/react-query';
import { getProject } from '../functions/project';
import { useProject } from './project';
import { useMemo } from 'react';
import { getProcessDefinitionById } from '../functions/process-definition';
import { PaginatedResponse, ProcessDefinition, Project } from '@igrp/framework-process-studio-types';
import { convertToMapOptions } from '@igrp/framework-process-studio-client';

export const useProcessDefinition = () => {
  const queryResult = useQuery<PaginatedResponse<Project>>({
    queryKey: ['process'],
    queryFn: () => getProject(),
  });

  const processDefinitions = useMemo(() => {
    if (!queryResult.data) return null;

    // Calculate total of processDefinitions and processes
    const allProcessDefinitions = queryResult.data?.content.flatMap((project) =>
      project.processDefinitions.map((processDefinition) => ({
        ...processDefinition,
        version: processDefinition.version || 'N/D',
      })),
    );
    const totalProcessDefinitions = allProcessDefinitions?.length || 0;
    const totalProjects = queryResult.data?.content.length || 0;

    return {
      processDefinitions: allProcessDefinitions,
      totalProcessDefinitions,
      totalProjects,
    };
  }, [queryResult.data]);

  return {
    ...queryResult,
    ...processDefinitions,
  };
};

export const useDetailProcessDefinition = (processDefinitionId: string) => {
  return useQuery<ProcessDefinition>({
    queryKey: ['processDefinition'],
    queryFn: () => getProcessDefinitionById(processDefinitionId),
  });
};

export function useProjectConfiguration() {
  try {
    const process = useProject();

    const processOptions = convertToMapOptions(process.data?.content || [], 'name', 'projectId');

    const isLoading = process.isLoading;
    const isError = process.isError;

    return {
      isLoading,
      isError,
      processOptions,
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      isLoading: false,
      isError: true,
      processOptions: [],
    };
  }
}
