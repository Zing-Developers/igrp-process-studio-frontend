'use server';
import {
  ProcessDefinition,
  ProcessDefinitionRequestDTO,
  VariableDefinition,
} from '@irn/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';
import { convertCamundaToActiviti } from './utils';

const logDevelopmentResponse = (operation: string, response: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Process Definition] ${operation} response`, response);
  }
};

export const getProcessDefinitionById = async (
  processDefinitionId: string,
): Promise<ProcessDefinition> => {
  const client = await createServerClient();
  const response = await client.processDefinitions.getById(processDefinitionId);
  logDevelopmentResponse('getById', response);
  return response;
};

export const createOrUpdateProcessDefinition = async (
  processDefinition: ProcessDefinitionRequestDTO & { processDefinitionId?: string },
): Promise<ProcessDefinition> => {
  const client = await createServerClient();
  const response = await client.processDefinitions.createOrUpdate(processDefinition);
  logDevelopmentResponse('createOrUpdate', response);
  return response;
};

export const deleteProcessDefinition = async (processDefinitionId: string) => {
  const client = await createServerClient();
  const response = await client.processDefinitions.delete(processDefinitionId);
  logDevelopmentResponse('delete', response);
  return response;
};

export const saveDiagramProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: { content: string },
) => {
  const client = await createServerClient();
  const data = {
    ...processDefinition,
    content: convertCamundaToActiviti(processDefinition.content),
  };
  const response = await client.processDefinitions.saveDiagram(processDefinitionId, data);
  logDevelopmentResponse('saveDiagram', response);
  return response;
};

export const deployProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: { content: string },
) => {
  const client = await createServerClient();
  const data = {
    ...processDefinition,
    content: convertCamundaToActiviti(processDefinition.content),
  };
  const response = await client.processDefinitions.deploy(processDefinitionId, data);
  logDevelopmentResponse('deploy', response);
  return response;
};

export const createOrUpdateVariable = async (
  processDefinitionId: string,
  variable: VariableDefinition[],
) => {
  const client = await createServerClient();
  const response = await client.processDefinitions.createOrUpdateVariable(processDefinitionId, variable);
  logDevelopmentResponse('createOrUpdateVariable', response);
  return response;
};

export const getVariables = async (processDefinitionId: string) => {
  const client = await createServerClient();
  const response = await client.processDefinitions.getVariables(processDefinitionId);
  logDevelopmentResponse('getVariables', response);
  return response;
};

