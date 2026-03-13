import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const apiBaseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://ayuntamiento-gestion-api-production.up.railway.app";

const DEFAULT_ACCESS_TOKEN_EXPIRES_IN = 60 * 60;

type LoginResponse = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    token: string;
    user: {
        id: number;
        email: string;
        role?: string;
        roles?: Array<{
            id: number;
            name: string;
        }>;
        name?: string;
    };
};

type RefreshResponse = {
    access_token: string;
    expires_in?: number;
};

type ExtendedUser = User & {
    id: number | string;
    role?: string;
    roles?: Array<{
        id: number;
        name: string;
    }>;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
    if (!token.refreshToken) {
        console.error("[auth][refresh] Missing refresh token");
        return { ...token, error: "NoRefreshToken" };
    }

    try {
        const refreshUrl = new URL("/api/v1/auth/refresh", apiBaseUrl).toString();

        console.log("[auth][refresh] API_BASE_URL:", process.env.API_BASE_URL);
        console.log(
            "[auth][refresh] NEXT_PUBLIC_API_BASE_URL:",
            process.env.NEXT_PUBLIC_API_BASE_URL,
        );
        console.log("[auth][refresh] Resolved apiBaseUrl:", apiBaseUrl);
        console.log("[auth][refresh] Refresh URL:", refreshUrl);
        console.log("[auth][refresh] Has access token:", !!token.accessToken);
        console.log("[auth][refresh] Has refresh token:", !!token.refreshToken);

        const response = await fetch(refreshUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token.accessToken
                    ? { Authorization: `Bearer ${token.accessToken}` }
                    : {}),
            },
            body: JSON.stringify({ refresh_token: token.refreshToken }),
        });

        const rawText = await response.text();

        console.log("[auth][refresh] Response status:", response.status);
        console.log("[auth][refresh] Response ok:", response.ok);
        console.log("[auth][refresh] Response body:", rawText);

        if (!response.ok) {
            throw new Error(`Failed to refresh token. Status: ${response.status}`);
        }

        const refreshed = JSON.parse(rawText) as RefreshResponse;

        return {
            ...token,
            accessToken: refreshed.access_token,
            accessTokenExpires:
                Date.now() + (refreshed.expires_in ?? 0) * 1000,
            error: undefined,
        };
    } catch (error) {
        console.error("[auth][refresh] Error refreshing access token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
    }
}

export const authOptions: NextAuthOptions = {
    debug: true,
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email?.toString().trim();
                const password = credentials?.password?.toString();

                console.log("[auth][authorize] API_BASE_URL:", process.env.API_BASE_URL);
                console.log(
                    "[auth][authorize] NEXT_PUBLIC_API_BASE_URL:",
                    process.env.NEXT_PUBLIC_API_BASE_URL,
                );
                console.log("[auth][authorize] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
                console.log("[auth][authorize] Resolved apiBaseUrl:", apiBaseUrl);

                if (!email || !password) {
                    console.log("[auth][authorize] Missing email or password");
                    return null;
                }

                try {
                    const loginUrl = new URL(
                        "/api/v1/auth/login",
                        apiBaseUrl,
                    ).toString();

                    console.log("[auth][authorize] Login URL:", loginUrl);
                    console.log("[auth][authorize] Email:", email);

                    const response = await fetch(loginUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                        body: JSON.stringify({
                            user: {
                                email,
                                password,
                            },
                        }),
                    });

                    const rawText = await response.text();

                    console.log("[auth][authorize] Response status:", response.status);
                    console.log("[auth][authorize] Response ok:", response.ok);
                    console.log("[auth][authorize] Response body:", rawText);

                    if (!response.ok) {
                        return null;
                    }

                    const data = JSON.parse(rawText) as LoginResponse;

                    if (!data?.token || !data?.user) {
                        console.log("[auth][authorize] Missing token or user in response");
                        return null;
                    }

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role,
                        roles: data.user.roles,
                        accessToken: data.token,
                        refreshToken: data.refresh_token,
                        expiresIn: data.expires_in,
                    };
                } catch (error) {
                    console.error("[auth][authorize] Error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }): Promise<JWT> {
            if (user) {
                const authUser = user as ExtendedUser;
                const expiresInSeconds =
                    typeof authUser.expiresIn === "number" && authUser.expiresIn > 0
                        ? authUser.expiresIn
                        : DEFAULT_ACCESS_TOKEN_EXPIRES_IN;
                const accessTokenExpires =
                    Date.now() + expiresInSeconds * 1000;

                return {
                    ...token,
                    accessToken: authUser.accessToken,
                    refreshToken: authUser.refreshToken,
                    accessTokenExpires,
                    user: {
                        id: authUser.id,
                        email: authUser.email,
                        role: authUser.role,
                        roles: authUser.roles,
                        name: authUser.name ?? null,
                    },
                } as JWT;
            }

            if (
                token.accessTokenExpires &&
                Date.now() < token.accessTokenExpires - 30 * 1000
            ) {
                return token;
            }

            if (!token.refreshToken) {
                if (token.accessToken) {
                    return {
                        ...token,
                        error: undefined,
                    };
                }
                return {
                    ...token,
                    error: "NoRefreshToken",
                };
            }

            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            session.user = {
                ...session.user,
                id: token.user?.id,
                email: token.user?.email,
                role: token.user?.role,
                roles: token.user?.roles,
                name: token.user?.name ?? session.user?.name ?? null,
            };
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
