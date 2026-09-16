import { getAccessToken } from "@/lib/auth-helpers";
import React from "react";
import CloseSession from "./close-session";
import { ApiError } from "@irn/irn-experience-sdk";
import RenegotiateSession from "./renegotiate-session";
import { Header } from "./header";
import { getSecureESAApiClient } from "../../lib/irn-experiencie-sdk-client";

async function IRNLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken();

  if (!token) {
    return <CloseSession />;
  }

  const { session_id: sessionId } = token as { session_id: string };

  if (!sessionId) {
    console.error("No session id found");
    return <CloseSession />;
  }

  //  📗 sessionData.'isValid' MUST be present and true, else force error
  if (process.env.IRN_API_BACKOFFICE_BASE_URL) {
    try {
      const expSystemAdminApiClient = getSecureESAApiClient(sessionId);

      const sessionData = await expSystemAdminApiClient.sessions.status();

      if ("isValid" in sessionData) {
        if (!sessionData["isValid"]) throw new Error("Invalid session");
      } else {
        throw new Error("Invalid session");
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        return <RenegotiateSession />;
      }
      return <CloseSession />;
    }
  }

  return (
    <main className="pt-24">
      <Header />
      <section>{children}</section>
    </main>
  );
}

export default IRNLayout;
