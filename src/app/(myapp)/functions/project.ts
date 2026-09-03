'use server'
import { Project } from '@irn/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';

const logDevelopmentResponse = (operation: string, response: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Project] ${operation} response`, JSON.stringify(response, undefined, 2));
  }
};

export const getProject = async () => {
  const client = await createServerClient();
  const response = await client.projects.getAll();
  logDevelopmentResponse('getAll', response);
  return response;
};

export const getProjectByCode = async (code: string) => {
  const client = await createServerClient();
  const response = await client.projects.getById(code);
  logDevelopmentResponse('getById', response);
  return response;
};

export const createOrUpdateProject = async (project: Project) => {
  if (project.projectId) {
    return updateProject(project);
  } else {
    return createProject(project);
  }
};

export const createProject = async (project: Project) => {
  const client = await createServerClient();
  const response = await client.projects.create(project);
  logDevelopmentResponse('create', response);
  return response;
};

export const updateProject = async (project: Project) => {
  const client = await createServerClient();
  if (!project.projectId) {
    throw new Error('Project ID is required to update a project.');
  }
  const response = await client.projects.update(project.projectId, project);
  logDevelopmentResponse('update', response);
  return response;
};

export const deleteProject = async (projectId: string) => {
  const client = await createServerClient();
  const response = await client.projects.disable(projectId);
  logDevelopmentResponse('disable', response);
  return response;
};
