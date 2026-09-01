import { M2mKeysApiClient } from './m2m-keys-api-client';
import type { CreateM2mKeyRequest } from './types';

/** SDK-style function facade, ready to move into framework-process-studio-client. */
export const createM2mKeysFunctions = (apiClient: M2mKeysApiClient) => ({
  list: () => apiClient.list(),
  create: (request: CreateM2mKeyRequest) => apiClient.create(request),
  revoke: (id: string) => apiClient.revoke(id),
  rotate: (id: string) => apiClient.rotate(id),
});
