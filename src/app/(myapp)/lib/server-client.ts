import { createProcessStudioClient } from '@igrp/framework-process-studio-client';

// Environment configuration for server-side
const getServerConfig = () => {
  const config = {
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY || 'http://localhost:8085',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  return config;
};

// Create server-side client instance
export const serverClient = createProcessStudioClient(getServerConfig());

// Helper function to create client with custom config
export const createServerClient = (customConfig?: {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) => {
  const baseConfig = getServerConfig();
  return createProcessStudioClient({
    ...baseConfig,
    ...customConfig,
  });
};
