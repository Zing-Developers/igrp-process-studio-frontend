export type M2mKey = {
  id: string;
  clientName: string;
  keyPrefix: string;
  permissions: string;
  email: string | null;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type CreateM2mKeyRequest = {
  clientName: string;
  permissions: string[];
  email?: string;
  expiresAt?: string;
};

export type CreatedM2mKey = {
  id: string;
  clientName: string;
  key: string;
};

export type M2mKeysApiClientConfig = {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
};
