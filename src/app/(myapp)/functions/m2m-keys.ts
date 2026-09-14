'use server';

import type { CreateRequest, CreatedResponse, KeySummary } from '@irn/framework-process-studio-types';
import { createServerClient } from '@/app/(myapp)/lib/server-client';

export type M2mKeysActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

const logDevelopmentResponse = (operation: string, response: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    const sanitizedResponse = response && typeof response === 'object' && 'key' in response
      ? { ...response, key: '[REDACTED]' }
      : response;
    console.info(`[M2M Keys] ${operation} response`, sanitizedResponse);
  }
};

const getErrorResult = (error: unknown): M2mKeysActionResult<never> => {
  if (!error || typeof error !== 'object') throw error;

  const apiError = error as { message?: unknown; status?: unknown; details?: unknown };
  const details = apiError.details;
  const detailMessage = details && typeof details === 'object' && 'error' in details
    ? String(details.error)
    : undefined;

  return {
    success: false,
    error: detailMessage ?? (typeof apiError.message === 'string'
      ? apiError.message
      : 'Não foi possível comunicar com a API. Tente novamente.'),
    ...(typeof apiError.status === 'number' ? { status: apiError.status } : {}),
  };
};

export const getM2mKeys = async (): Promise<M2mKeysActionResult<KeySummary[]>> => {
  try {
    const client = await createServerClient();
    const keys = await client.m2mKeys.list();
    logDevelopmentResponse('list', keys);
    return { success: true, data: keys };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const createM2mKey = async (
  request: CreateRequest,
): Promise<M2mKeysActionResult<CreatedResponse>> => {
  try {
    const client = await createServerClient();
    const response = await client.m2mKeys.create(request);
    logDevelopmentResponse('create', response);
    return { success: true, data: response };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const revokeM2mKey = async (id: string): Promise<M2mKeysActionResult<void>> => {
  try {
    const client = await createServerClient();
    await client.m2mKeys.revoke(id);
    logDevelopmentResponse('revoke', { id });
    return { success: true, data: undefined };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const rotateM2mKey = async (id: string): Promise<M2mKeysActionResult<CreatedResponse>> => {
  try {
    const client = await createServerClient();
    const response = await client.m2mKeys.rotate(id);
    logDevelopmentResponse('rotate', response);
    return { success: true, data: response };
  } catch (error) {
    return getErrorResult(error);
  }
};
