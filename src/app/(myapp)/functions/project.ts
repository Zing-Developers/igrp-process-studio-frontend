'use server'
import { Project } from '@igrp/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';



export const getProject = async () => {
  const client = await createServerClient();
  return await client.projects.getAll();
};

export const getProjectByCode = async (code: string) => {
  const client = await createServerClient();
  return await client.projects.getById(code);
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
  return await client.projects.create(project);
};

export const updateProject = async (project: Project) => {
  const client = await createServerClient();
  return await client.projects.update(project);
};

export const deleteProject = async (code: string) => {
  const client = await createServerClient();
  return await client.projects.delete(code);
};
