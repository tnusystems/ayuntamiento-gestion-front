import { getClientToken } from "@/lib/auth/getClientToken";
import { getServerToken } from "@/lib/auth/getServerToken";

export async function getAuthToken(): Promise<string | null> {
  const isServer = typeof window === "undefined";
  return isServer ? getServerToken() : getClientToken();
}
