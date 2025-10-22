'use server';
import { ProcessDefinition, VariableDefinition } from '@igrp/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';

/**
 * Converts Camunda BPMN XML to Activiti format
 * @param xml - The BPMN XML string
 * @returns Converted XML string with Activiti namespace and attributes
 */
function convertCamundaToActiviti(xml: string): string {
  if (!xml || typeof xml !== 'string') {
    return xml;
  }

  let convertedXml = xml;

  // Check if XML already has Activiti namespace to avoid duplicates
  const hasActivitiNamespace = convertedXml.includes('xmlns:activiti=');
  
  // Only replace Camunda namespace if Activiti namespace doesn't exist
  if (!hasActivitiNamespace) {
    convertedXml = convertedXml.replace(
      /xmlns:camunda="http:\/\/camunda\.org\/schema\/1\.0\/bpmn"/g,
      'xmlns:activiti="http://activiti.org/bpmn"'
    );
  } else {
    // If Activiti namespace already exists, just remove the Camunda namespace
    convertedXml = convertedXml.replace(
      /xmlns:camunda="http:\/\/camunda\.org\/schema\/1\.0\/bpmn"/g,
      ''
    );
  }

  // Handle duplicate attributes by removing existing activiti attributes before converting camunda ones
  // This prevents duplicate attribute errors
  convertedXml = convertedXml.replace(
    /(\s+activiti:delegateExpression="[^"]*")/g,
    '' // Remove existing activiti:delegateExpression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+activiti:expression="[^"]*")/g,
    '' // Remove existing activiti:expression attributes
  );
  
  convertedXml = convertedXml.replace(
    /(\s+activiti:resultVariable="[^"]*")/g,
    '' // Remove existing activiti:resultVariable attributes
  );

  // Replace all camunda: attributes with activiti: attributes
  convertedXml = convertedXml.replace(/camunda:/g, 'activiti:');

  // Replace Camunda-specific elements with Activiti equivalents
  convertedXml = convertedXml.replace(
    /<camunda:([^>]+)>/g,
    '<activiti:$1>'
  );
  convertedXml = convertedXml.replace(
    /<\/camunda:([^>]+)>/g,
    '</activiti:$1>'
  );

  return convertedXml;
}


export const getProcessDefinitionById = async (processDefinitionId: string): Promise<ProcessDefinition> => {
  const client = await createServerClient();
  return await client.processDefinitions.getById(processDefinitionId);
};

export const createOrUpdateProcessDefinition = async (processDefinition: ProcessDefinition): Promise<ProcessDefinition> => {
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
  console.log('data', data);
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

export const getDataTypes = async () => {
  return [
    {
      label: 'String',
      value: 'string',
    },
    {
      label: 'Number',
      value: 'number',
    },
    {
      label: 'Boolean',
      value: 'boolean',
    },
  ];
};
