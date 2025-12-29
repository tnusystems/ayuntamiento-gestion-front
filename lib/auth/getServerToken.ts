import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";

export async function getServerToken(): Promise<string | null> {
  const cookieStore = cookies();
  const cookie = cookieStore.toString();
  const token = await getToken({
    req: {
      headers: { cookie },
    } as unknown as import("next/server").NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return (token?.accessToken as string | undefined) ?? null;
}
