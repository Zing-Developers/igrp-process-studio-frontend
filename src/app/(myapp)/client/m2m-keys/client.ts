import { M2mKeysApiClient } from './m2m-keys-api-client';
import { createM2mKeysFunctions } from './m2m-keys-functions';
import type { M2mKeysApiClientConfig } from './types';

export const createM2mKeysClient = (config: M2mKeysApiClientConfig) => {
  const apiClient = new M2mKeysApiClient(config);

  return {
    m2mKeys: createM2mKeysFunctions(apiClient),
  };
};
