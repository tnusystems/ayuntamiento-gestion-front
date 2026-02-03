"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { api } from "@/lib/api/client";
import { fetchUserById } from "@/lib/api/users";
import { UsuarioSchema, type Usuario } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type LoginResult = {
    ok: boolean;
    error?: string;
};

type AuthContextValue = {
    user: Usuario | null;
    status: AuthStatus;
    error: string | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "auth_user_id";

function getStoredUserId() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
}

function setStoredUserId(id: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, id);
}

function clearStoredUserId() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
}

function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }
    return "No se pudo completar la solicitud.";
}

async function loginRequest(email: string, password: string) {
    const data = await api<unknown>("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user: {
                email,
                password,
            },
        }),
    });
    const payload =
        data && typeof data === "object" && "user" in data
            ? (data as { user?: unknown }).user
            : data;
    const parsed = UsuarioSchema.safeParse(payload);
    if (!parsed.success) {
        throw new Error("Respuesta invalida del login.");
    }
    return parsed.data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const storedId = getStoredUserId();
        if (!storedId) {
            setUser(null);
            setStatus("unauthenticated");
            return;
        }
        try {
            const fetched = await fetchUserById(storedId);
            setUser(fetched);
            setStatus("authenticated");
        } catch (err) {
            clearStoredUserId();
            setUser(null);
            setStatus("unauthenticated");
            setError(getErrorMessage(err));
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setStatus("loading");
        try {
            const loggedUser = await loginRequest(email, password);
            if (loggedUser?.id == null) {
                throw new Error("Usuario sin identificador.");
            }
            setStoredUserId(String(loggedUser.id));
            setUser(loggedUser);
            setStatus("authenticated");
            return { ok: true };
        } catch (err) {
            clearStoredUserId();
            setUser(null);
            setStatus("unauthenticated");
            const message = getErrorMessage(err);
            setError(message);
            return { ok: false, error: message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api("/api/v1/auth/logout", {
                method: "POST",
            });
        } catch {
            // If the backend fails, still clear local state.
        } finally {
            clearStoredUserId();
            setUser(null);
            setStatus("unauthenticated");
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            status,
            error,
            login,
            logout,
            refresh,
        }),
        [user, status, error, login, logout, refresh],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider.");
    }
    return context;
}
