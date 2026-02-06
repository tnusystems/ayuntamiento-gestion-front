import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        error?: string;
        user: {
            id?: number;
            email?: string;
            role?: string;
            roles?: Array<{
                id: number;
                name: string;
            }>;
            name?: string | null;
        };
    }

    interface User {
        id: number;
        email: string;
        role?: string;
        roles?: Array<{
            id: number;
            name: string;
        }>;
        name?: string;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        error?: string;
        user?: {
            id?: number;
            email?: string;
            role?: string;
            roles?: Array<{
                id: number;
                name: string;
            }>;
            name?: string | null;
        };
    }
}
