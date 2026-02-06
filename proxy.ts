import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPathPrefixes = ["/login", "/api/auth", "/_next", "/icons"];
const publicFiles = new Set(["/favicon.ico"]);
const adminPathPrefix = "/admin";
const reportsPathPrefix = "/reportes";

function normalizeRole(role?: string | null) {
    return role?.trim().toLowerCase() ?? "";
}

type TokenRole = {
    name?: string;
};

type TokenUser = {
    role?: string;
    roles?: TokenRole[];
};

function getRoleKeys(tokenUser?: TokenUser) {
    const roleKeys = new Set<string>();
    const role = normalizeRole(tokenUser?.role);
    if (role) {
        roleKeys.add(role);
    }
    if (Array.isArray(tokenUser?.roles)) {
        for (const item of tokenUser.roles) {
            const roleName = normalizeRole(item?.name);
            if (roleName) {
                roleKeys.add(roleName);
            }
        }
    }
    return roleKeys;
}

function isAdminUser(tokenUser?: TokenUser) {
    return getRoleKeys(tokenUser).has("admin");
}

function canAccessReports(tokenUser?: TokenUser) {
    const roleKeys = getRoleKeys(tokenUser);
    return !(roleKeys.has("viewer") && roleKeys.size === 1);
}

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

    const tokenUser =
        typeof token.user === "object" && token.user !== null
            ? (token.user as TokenUser)
            : undefined;

    const isAdminPath =
        pathname === adminPathPrefix ||
        pathname.startsWith(`${adminPathPrefix}/`);
    if (isAdminPath) {
        if (!isAdminUser(tokenUser)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    const isReportsPath =
        pathname === reportsPathPrefix ||
        pathname.startsWith(`${reportsPathPrefix}/`);
    if (isReportsPath && !canAccessReports(tokenUser)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}
