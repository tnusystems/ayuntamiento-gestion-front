import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPathPrefixes = ["/login", "/api/auth", "/_next", "/icons"];
const publicFiles = new Set(["/favicon.ico"]);

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (publicFiles.has(pathname)) {
    return NextResponse.next();
  }

  if (publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
