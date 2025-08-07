'use server';
import { ProcessDefinition } from '@igrp/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';

const client = createServerClient();

export const getProcessDefinitionById = async (processDefinitionId: string) => {
  return await client.processDefinitions.getById(processDefinitionId);
};

export const createOrUpdateProcessDefinition = async (processDefinition: ProcessDefinition) => {
  return await client.processDefinitions.createOrUpdate(processDefinition);
};

export const saveDiagramProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: ProcessDefinition,
) => {
  return await client.processDefinitions.saveDiagram(processDefinitionId, processDefinition);
};

export const deployProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: ProcessDefinition,
) => {
  return await client.processDefinitions.deploy(processDefinitionId, processDefinition);
};
