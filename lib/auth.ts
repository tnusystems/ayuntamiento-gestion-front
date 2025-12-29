import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://ayuntamiento-gestion-api-production.up.railway.app";

type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token: string;
  user: {
    id: number;
    email: string;
    role?: string;
    name?: string;
  };
};

type ExtendedUser = User & {
  id: number | string;
  role?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "NoRefreshToken" };
  }

  try {
    const response = await fetch(new URL("/auth/refresh", apiBaseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token.accessToken
          ? { Authorization: `Bearer ${token.accessToken}` }
          : {}),
      },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const refreshed = (await response.json()) as {
      access_token: string;
      expires_in?: number;
    };

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in ?? 0) * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
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

        if (!email || !password) {
          return null;
        }

        const response = await fetch(new URL("/login", apiBaseUrl), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: {
              email,
              password,
              password_confirmation: password,
              name: email,
            },
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as LoginResponse;

        if (!data?.token || !data?.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          accessToken: data.token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        const authUser = user as ExtendedUser;
        const accessTokenExpires =
          Date.now() + (authUser.expiresIn ?? 0) * 1000;

        return {
          ...token,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          accessTokenExpires,
          user: {
            id: authUser.id,
            email: authUser.email,
            role: authUser.role,
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

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      session.user = {
        ...session.user,
        id: token.user?.id,
        email: token.user?.email,
        role: token.user?.role,
        name: token.user?.name ?? session.user?.name ?? null,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
