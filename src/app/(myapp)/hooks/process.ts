import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProject } from '../functions/project';
import { useProject } from './project';
import { useMemo } from 'react';
import {
  getProcessDefinitionById,
  getVariables,
  saveDiagramProcessDefinition,
} from '../functions/process-definition';
import {
  PaginatedResponse,
  ProcessDefinition,
  ProcessVariableResponseDTO,
  Project,
} from '@irn/framework-process-studio-types';
import { convertToMapOptions } from '@irn/framework-process-studio-client';

export const useProcessDefinition = () => {
  const queryResult = useQuery<PaginatedResponse<Project>>({
    queryKey: ['process'],
    queryFn: () => getProject(),
  });

  const processDefinitions = useMemo(() => {
    if (!queryResult.data) return null;
    const projects = queryResult.data.content ?? [];

    // Calculate total of processDefinitions and processes
    const allProcessDefinitions = projects.flatMap((project) =>
      (project.processDefinitions ?? []).map((processDefinition) => ({
        ...processDefinition,
        deploymentDate: Array.isArray(processDefinition.deploymentDate)
          ? processDefinition.deploymentDate.join('-')
          : processDefinition.deploymentDate || '',
        version: String(processDefinition.version ?? 'N/D'),
        projectName: project.name ?? '',
        title: processDefinition.title ?? '',
        processKey: processDefinition.processKey ?? '',
        processDefinitionId: processDefinition.processDefinitionId ?? '',
        statusDesc: processDefinition.statusDesc ?? '',
        description: processDefinition.description ?? '',
        status: processDefinition.status ?? '',
      })),
    );

    console.info("allProcessDefinitions", allProcessDefinitions)
    const projectOptions = projects.map((project) => {
      return {
        value: project.name ?? '',
        label: project.name ?? '',
      };
    });

    const totalProcessDefinitions = allProcessDefinitions?.length || 0;

    const totalRascunho =
      allProcessDefinitions?.filter((processDefinition) => processDefinition.status === 'DRAFT')
        .length || 0;

    const totalPublished =
      allProcessDefinitions?.filter((processDefinition) => processDefinition.status === 'PUBLISHED')
        .length || 0;

    return {
      processDefinitions: allProcessDefinitions,
      projectOptions,
      totalProcessDefinitions,
      totalRascunho,
      totalPublished,
    };
  }, [queryResult.data]);

  return {
    ...queryResult,
    ...processDefinitions,
  };
};

export const useDetailProcessDefinition = (processDefinitionId: string) => {
  return useQuery<ProcessDefinition>({
    queryKey: ['processDefinition', processDefinitionId],
    queryFn: () => getProcessDefinitionById(processDefinitionId),
    enabled: !!processDefinitionId,
  });
};

export function useProjectConfiguration() {
  const process = useProject();
  const processOptions = useMemo(
    () => convertToMapOptions(process.data?.content || [], 'name', 'projectId'),
    [process.data?.content],
  );

  return {
    isLoading: process.isLoading,
    isError: process.isError,
    processOptions,
  };
}

export const useGetVariables = (processDefinitionId: string) => {
  return useQuery<ProcessVariableResponseDTO>({
    queryKey: ['variables'],
    queryFn: () => getVariables(processDefinitionId),
    enabled: !!processDefinitionId,
  });
};

export const useSaveDiagramProcessDefinition = (processDefinitionId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { content: string; processKey: string }>({
    mutationFn: async ({ content, processKey }) => {
      await saveDiagramProcessDefinition(processKey, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processDefinition', processDefinitionId] });
    },
  });
};
