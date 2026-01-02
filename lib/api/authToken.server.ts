import { getServerToken } from "@/lib/auth/getServerToken";

export async function getAuthToken(): Promise<string | null> {
  return getServerToken();
}
