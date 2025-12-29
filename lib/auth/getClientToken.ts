import { getSession } from "next-auth/react";

export async function getClientToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken ?? null;
}
