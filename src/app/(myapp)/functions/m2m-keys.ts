'use server';

import type { CreateRequest, CreatedResponse, KeySummary } from '@irn/framework-process-studio-types';
import { createServerClient } from '@/app/(myapp)/lib/server-client';

export type M2mKeysActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

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
    return { success: true, data: await client.m2mKeys.create(request) };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const revokeM2mKey = async (id: string): Promise<M2mKeysActionResult<void>> => {
  try {
    const client = await createServerClient();
    await client.m2mKeys.revoke(id);
    return { success: true, data: undefined };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const rotateM2mKey = async (id: string): Promise<M2mKeysActionResult<CreatedResponse>> => {
  try {
    const client = await createServerClient();
    return { success: true, data: await client.m2mKeys.rotate(id) };
  } catch (error) {
    return getErrorResult(error);
  }
};
