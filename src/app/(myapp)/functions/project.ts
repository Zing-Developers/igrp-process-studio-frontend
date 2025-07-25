import { Project } from '../types/global';

export const getProject = async () => {
  const response = await fetch('/api/project');
  return response.json();
};

export const getProjectByCode = async (code: string) => {
  const response = await fetch(`/api/project/${code}`);
  return response.json();
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
  const response = await fetch('/api/project', {
    method: 'POST',
    body: JSON.stringify(project),
  });
  return response.json();
};

export const updateProject = async (project: Project) => {
  const response = await fetch('/api/project', {
    method: 'PUT',
    body: JSON.stringify(project),
  });
  return response.json();
};

export const deleteProject = async (code: string) => {
  const response = await fetch(`/api/project/${code}`, {
    method: 'DELETE',
  });
  return response.json();
};
