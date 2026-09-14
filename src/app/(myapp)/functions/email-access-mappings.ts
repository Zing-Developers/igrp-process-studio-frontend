'use server';

import type {
  EmailAccessMappingDTO,
  EmailAccessMappingRequestDTO,
  ProcessStudioClient,
} from '@irn/framework-process-studio-types';
import { createServerClient } from '@/app/(myapp)/lib/server-client';

export type EmailAccessMappingsActionResult<T> =
  { success: true; data: T } | { success: false; error: string; status?: number };

const fallbackError = 'Não foi possível comunicar com a API. Tente novamente.';

type EmailAccessMappingsClient = Pick<ProcessStudioClient, 'emailAccessMappings'>;

const createEmailAccessMappingsClient = async (): Promise<EmailAccessMappingsClient> => {
  const client = await createServerClient();
  // Client beta.21 ships runtime support for this API but references beta.20 type declarations.
  return client as unknown as EmailAccessMappingsClient;
};

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const getDetailsMessage = (details: unknown): string | undefined => {
  if (details && typeof details === 'object') {
    const errorDetails = details as Record<string, unknown>;
    return (
      asNonEmptyString(errorDetails.error) ??
      asNonEmptyString(errorDetails.message) ??
      asNonEmptyString(errorDetails.detail)
    );
  }

  return asNonEmptyString(details);
};

const getErrorResult = (error: unknown): EmailAccessMappingsActionResult<never> => {
  if (!error || typeof error !== 'object') {
    return { success: false, error: fallbackError };
  }

  const apiError = error as { message?: unknown; status?: unknown; details?: unknown };
  return {
    success: false,
    error:
      getDetailsMessage(apiError.details) ?? asNonEmptyString(apiError.message) ?? fallbackError,
    ...(typeof apiError.status === 'number' ? { status: apiError.status } : {}),
  };
};

const logDevelopmentResponse = (operation: string, response: unknown): void => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Email Access Mappings] ${operation} response`, response);
  }
};

export const getEmailAccessMappings = async (): Promise<
  EmailAccessMappingsActionResult<EmailAccessMappingDTO[]>
> => {
  try {
    const client = await createEmailAccessMappingsClient();
    const mappings = await client.emailAccessMappings.list();
    logDevelopmentResponse('list', mappings);
    return { success: true, data: mappings };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const createEmailAccessMapping = async (
  request: EmailAccessMappingRequestDTO,
): Promise<EmailAccessMappingsActionResult<EmailAccessMappingDTO>> => {
  try {
    const client = await createEmailAccessMappingsClient();
    const mapping = await client.emailAccessMappings.create(request);
    logDevelopmentResponse('create', mapping);
    return { success: true, data: mapping };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const updateEmailAccessMapping = async (
  id: string,
  request: EmailAccessMappingRequestDTO,
): Promise<EmailAccessMappingsActionResult<EmailAccessMappingDTO>> => {
  try {
    const client = await createEmailAccessMappingsClient();
    const mapping = await client.emailAccessMappings.update(id, request);
    logDevelopmentResponse('update', mapping);
    return { success: true, data: mapping };
  } catch (error) {
    return getErrorResult(error);
  }
};

export const revokeEmailAccessMapping = async (
  id: string,
): Promise<EmailAccessMappingsActionResult<void>> => {
  try {
    const client = await createEmailAccessMappingsClient();
    await client.emailAccessMappings.revoke(id);
    logDevelopmentResponse('revoke', { id });
    return { success: true, data: undefined };
  } catch (error) {
    return getErrorResult(error);
  }
};
