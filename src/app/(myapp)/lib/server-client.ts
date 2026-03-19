import { createProcessStudioClient } from '@igrp/framework-process-studio-client';
import { getAccessToken } from '@/lib/auth-helpers';
import { getOrFetchToken } from './rsa-token-handlers';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, string>({
  max: 1,
  ttl: 1000 * 60 * 3,
});

// Environment configuration for server-side
const getServerConfig = async () => {
  const token = await getAccessToken();


  if (!token) {
    throw new Error('Authentication required. Please log in to access this feature.');
  }

  const IRN_APISIX_TOKEN_ENABLED = process.env.IRN_APISIX_TOKEN_ENABLED ?? false

  const ROTATED_TOKEN = await getOrFetchToken("apisix-token-v.0", cache);

  const config = {
    baseUrl: process.env.API_GATEWAY ?? '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(IRN_APISIX_TOKEN_ENABLED ? {
        Authorization: `Bearer ${ROTATED_TOKEN}`,
        "X-Access-Token": `Bearer ${token?.accessToken}`,
        Cookie: `session_id=${token?.session_id}`,
      } : {
        Authorization: `Bearer ${token.accessToken}`,
        ...(!process.env.IRN_SYSTEM_ADMINISTRATION_DISABLED ? { Cookie: `session_id=${token?.session_id}` } : {})
        ,
      })
    },
  };

  return config;
};

// Helper function to create client with custom config
export const createServerClient = async () => {
  const baseConfig = await getServerConfig();
  return createProcessStudioClient({
    ...baseConfig,
  });
};
