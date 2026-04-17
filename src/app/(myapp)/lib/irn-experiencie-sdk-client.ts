import { Client, createClient } from "@irn/irn-experience-sdk";
import { APIExperienceAuthInterceptor } from "./irn-api-token-provider";

const interceptors = new APIExperienceAuthInterceptor(
  "interceptor-cached-token_v.2",
);

const trimTrailingSlash = (url: string) => url.replace(/\/+$/, "");

const getSystemAdminBaseUrl = () => {
  const backofficeBaseUrl = process.env.IRN_API_BACKOFFICE_BASE_URL?.trim();
  if (!backofficeBaseUrl) return "";
  return `${trimTrailingSlash(backofficeBaseUrl)}/api/v1`;
};

/**
 * Get a secure instance of Experience System Administration API Client
 * @param sessionId
 * @returns
 */
export const getSecureESAApiClient = (sessionId: string): Client => {
  return createClient({
    baseUrl: getSystemAdminBaseUrl(),
    headers: {
      Cookie: `session_id=${sessionId}`,
    },
    interceptors: [interceptors],
  });
};
