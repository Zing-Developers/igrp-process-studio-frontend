import { getSecureESAApiClient } from "@/app/(myapp)/lib/irn-experiencie-sdk-client";
import { getAccessToken } from "@/lib/auth-helpers";
 import { IRNBackendIntegrationConfig } from "@irn/irn-backoffice-integration";

async function getSessionId() {
  "use server";
  const token = await getAccessToken();
  if (!token) throw new Error("No token found");
  const { session_id: sessionId } = token as { session_id: string };
  if (!sessionId) throw new Error("No session ID found");
  return sessionId;
}

export const irnHeaderConfig: IRNBackendIntegrationConfig = {
  getUserData: async () => {
    "use server";
    const sessionId = await getSessionId();
    const client = getSecureESAApiClient(sessionId);
    return client.auth.me();
  },

  getUserMenu: async () => {
    "use server";
    const sessionId = await getSessionId();
    const client = getSecureESAApiClient(sessionId);
    return client.users.menu();
  },

  switchSpace: async (spaceId: string, profileId: string) => {
    "use server";
    const sessionId = await getSessionId();
    const client = getSecureESAApiClient(sessionId);
    return client.users.switchSpace({ spaceId, profileId });
  },
};
