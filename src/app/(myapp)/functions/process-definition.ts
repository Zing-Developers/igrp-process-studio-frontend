import { ProcessDefinition } from '../types/global';

export const getProcessDefinitionById = async (processDefinitionId: string) => {
  const response = await fetch(`/api/project/process/${processDefinitionId}`, {
    method: 'GET',
  });
  return response.json();
};

export const createProcessDefinition = async (
  projectId: string,
  processDefinition: ProcessDefinition,
) => {
  const response = await fetch(`/api/project/process?projectId=${projectId}`, {
    method: 'POST',
    body: JSON.stringify(processDefinition),
  });
  return response.json();
};

export const updateProcessDefinition = async (
  projectId: string,
  processDefinition: ProcessDefinition,
) => {
  const response = await fetch(`/api/project/process/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(processDefinition),
  });
  return response.json();
};

export const createOrUpdateProcessDefinition = async (processDefinition: ProcessDefinition) => {
  console.log(processDefinition)
  if (processDefinition.processDefinitionId) {
    return updateProcessDefinition(processDefinition.processDefinitionId, processDefinition);
  } else {
    return createProcessDefinition(processDefinition.projectId, processDefinition);
  }
};

export const saveDiagramProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: ProcessDefinition,
) => {
  return await fetch(`/api/project/process/${processDefinitionId}/diagram`, {
    method: 'PUT',
    body: JSON.stringify(processDefinition),
  });
};

export const deployProcessDefinition = async (
  processDefinitionId: string,
  processDefinition: ProcessDefinition,
) => {
  return await fetch(`/api/project/process/${processDefinitionId}/deploy`, {
    method: 'POST',
    body: JSON.stringify(processDefinition),
  });
};
