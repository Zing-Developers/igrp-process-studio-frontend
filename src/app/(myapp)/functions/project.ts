'use server'
import { Project } from '@igrp/framework-process-studio-types';
import { createServerClient } from '../lib/server-client';

const client = createServerClient();

export const getProject = async () => {
  return await client.projects.getAll();
};

export const getProjectByCode = async (code: string) => {
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
  console.log('createProject', project);
  return await client.projects.create(project);
};

export const updateProject = async (project: Project) => {
  return await client.projects.update(project);
};

export const deleteProject = async (code: string) => {
  return await client.projects.delete(code);
};
