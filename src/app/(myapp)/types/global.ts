export type Project = {
  code: string;
  name: string;
  description: string;
  projectId: string;
  processDefinitions: ProcessDefinition[];
};

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  content: T[];
}

export interface ProcessDefinition {
  title: string;
  description: string;
  projectId: string;
  status: string;
  processDefinitionId: string;
  version: string;
  statusDesc: string;
}