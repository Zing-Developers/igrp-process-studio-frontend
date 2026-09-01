'use server';
import { ProcessDefinition, VariableDefinition } from '@igrp/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';
import { convertCamundaToActiviti } from './utils';

export const getProcessDefinitionById = async (
  processDefinitionId: string,
): Promise<ProcessDefinition> => {
  const client = await createServerClient();
  return await client.processDefinitions.getById(processDefinitionId);
};

export const createOrUpdateProcessDefinition = async (
  processDefinition: ProcessDefinition,
): Promise<ProcessDefinition> => {
  const client = await createServerClient();
  return await client.processDefinitions.createOrUpdate(processDefinition);
};

export const deleteProcessDefinition = async (processDefinitionId: string) => {
  const client = await createServerClient();
  return await client.processDefinitions.delete(processDefinitionId);
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
  return await client.processDefinitions.saveDiagram(processDefinitionId, data);
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
  return await client.processDefinitions.deploy(processDefinitionId, data);
};

export const createOrUpdateVariable = async (
  processDefinitionId: string,
  variable: VariableDefinition[],
) => {
  const client = await createServerClient();
  return await client.processDefinitions.createOrUpdateVariable(processDefinitionId, variable);
};

export const getVariables = async (processDefinitionId: string) => {
  const client = await createServerClient();
  return await client.processDefinitions.getVariables(processDefinitionId);
};

