import { createProcessStudioClient } from '@igrp/framework-process-studio-client';
import { getAccessToken } from '@/lib/auth-helpers';

// Environment configuration for server-side
const getServerConfig = async () => {
  const token = await getAccessToken();


  if (!token) {
    throw new Error('Authentication required. Please log in to access this feature.');
  }

  const config = {
    baseUrl: process.env.API_GATEWAY ?? '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token?.accessToken}`,
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
