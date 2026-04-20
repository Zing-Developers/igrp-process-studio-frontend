"use client";
import { signIn } from "next-auth/react";
import React, { useEffect } from "react";
import { IGRPLoadingSpinner } from "@igrp/igrp-framework-react-design-system";

/**
 * Close session in keycloak (primary credentials) from the client-side
 * use full when some credentials holder fails
 * @returns
 */
function RenegotiateSession() {
  useEffect(() => {
    signIn("keycloak", {
      redirect: true,
    });
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center justify-center">
        <IGRPLoadingSpinner />
        <p className="text-slate-600 font-medium -mt-20">
          Checking session, ...
        </p>
      </div>
    </div>
  );
}

export default RenegotiateSession;
