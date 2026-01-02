import { getClientToken } from "@/lib/auth/getClientToken";

export async function getAuthToken(): Promise<string | null> {
  return getClientToken();
}
