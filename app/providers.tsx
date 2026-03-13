"use client";

import { useCallback, useEffect, useRef } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { AUTH_UNAUTHORIZED_EVENT } from "@/lib/auth/events";

const sessionErrorsRequiringSignOut = new Set([
  "RefreshAccessTokenError",
  "NoRefreshToken",
]);

function SessionGuard() {
  const { data: session } = useSession();
  const isSigningOutRef = useRef(false);

  const triggerSignOut = useCallback(async () => {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    await signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (
      session?.error &&
      sessionErrorsRequiringSignOut.has(session.error)
    ) {
      void triggerSignOut();
    }
  }, [session?.error, triggerSignOut]);

  useEffect(() => {
    const handleUnauthorized = () => {
      void triggerSignOut();
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [triggerSignOut]);

  return null;
}

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <SessionGuard />
      {children}
    </SessionProvider>
  );
}
