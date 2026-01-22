"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Edit, Shield, ToggleLeft, ToggleRight, UserPlus } from "lucide-react";
import { createUser, fetchUsers } from "@/lib/api/users";
import type { Usuario } from "@/types";

type UserRecord = {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
};

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    role: string;
};

const ROLE_OPTIONS = ["Todos", "Admin", "User"];

export default function UsersManager() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState(ROLE_OPTIONS[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState<CreateUserForm>({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        role: "user",
    });

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const data = await fetchUsers();
                if (!isMounted) return;
                setUsers(data.map(toUserRecord));
            } catch (error) {
                if (!isMounted) return;
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : "Error al cargar usuarios.",
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();
        return () => {
            isMounted = false;
        };
    }, []);

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((user) => user.isActive).length;
        const inactive = total - active;
        return { total, active, inactive };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedRole = roleFilter.trim().toLowerCase();
        return users.filter((user) => {
            const matchesQuery =
                !normalizedQuery ||
                user.name.toLowerCase().includes(normalizedQuery) ||
                user.email.toLowerCase().includes(normalizedQuery);
            const matchesRole =
                normalizedRole === "todos" ||
                user.role.toLowerCase() === normalizedRole;
            return matchesQuery && matchesRole;
        });
    }, [users, query, roleFilter]);

    const handleToggleStatus = (id: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, isActive: !user.isActive } : user,
            ),
        );
    };

    const handleEdit = (id: string) => {
        const user = users.find((item) => item.id === id);
        if (!user) {
            return;
        }
        alert(`Editar usuario: ${user.name}`);
    };

    const handleReset = (id: string) => {
        const user = users.find((item) => item.id === id);
        if (!user) {
            return;
        }
        if (confirm(`Restablecer acceso para ${user.name}?`)) {
            alert("Solicitud enviada.");
        }
    };

    const handleCreateChange = (field: keyof CreateUserForm, value: string) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCreateError(null);

        if (createForm.password !== createForm.passwordConfirmation) {
            setCreateError("Las contrasenas no coinciden.");
            return;
        }

        setIsCreating(true);

        try {
            const payload = {
                name: createForm.name.trim(),
                email: createForm.email.trim(),
                password: createForm.password,
                password_confirmation: createForm.passwordConfirmation,
                role: "user",
            };
            const created = await createUser(payload);
            setUsers((prev) => [toUserRecord(created), ...prev]);
            setCreateForm({
                name: "",
                email: "",
                password: "",
                passwordConfirmation: "",
                role: "user",
            });
            setIsCreateOpen(false);
        } catch (error) {
            setCreateError(
                error instanceof Error
                    ? error.message
                    : "No se pudo crear el usuario.",
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900">
                        Usuarios
                    </h1>
                    <p className="text-sm text-neutral-500">
                        Administra el acceso y los permisos del personal.
                    </p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
                    onClick={() => setIsCreateOpen((prev) => !prev)}
                >
                    <UserPlus className="h-4 w-4" />
                    Nuevo usuario
                </button>
            </div>

            {isCreateOpen && (
                <section className="rounded-xl border border-neutral-200 bg-white p-4">
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={handleCreateSubmit}
                    >
                        <div>
                            <label className="text-xs font-semibold text-neutral-500">
                                Nombre
                            </label>
                            <input
                                type="text"
                                required
                                value={createForm.name}
                                onChange={(event) =>
                                    handleCreateChange(
                                        "name",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-500">
                                Correo
                            </label>
                            <input
                                type="email"
                                required
                                value={createForm.email}
                                onChange={(event) =>
                                    handleCreateChange(
                                        "email",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-500">
                                Contrasena
                            </label>
                            <input
                                type="password"
                                required
                                value={createForm.password}
                                onChange={(event) =>
                                    handleCreateChange(
                                        "password",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-500">
                                Confirmacion
                            </label>
                            <input
                                type="password"
                                required
                                value={createForm.passwordConfirmation}
                                onChange={(event) =>
                                    handleCreateChange(
                                        "passwordConfirmation",
                                        event.target.value,
                                    )
                                }
                                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-neutral-500">
                                Rol
                            </label>
                            <input
                                type="text"
                                value="user"
                                disabled
                                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={isCreating}
                            >
                                {isCreating ? "Guardando..." : "Crear usuario"}
                            </button>
                            <button
                                type="button"
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                        {createError && (
                            <p className="text-sm text-red-600">
                                {createError}
                            </p>
                        )}
                    </form>
                </section>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { label: "Total", value: stats.total },
                    { label: "Activos", value: stats.active },
                    { label: "Inactivos", value: stats.inactive },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border border-neutral-200 bg-white p-4"
                    >
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                            {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-neutral-900">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            <section className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                        <input
                            type="search"
                            placeholder="Buscar por nombre o correo"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(event.target.value)
                            }
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:max-w-[220px]"
                        >
                            {ROLE_OPTIONS.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="text-sm text-neutral-500">
                        {filteredUsers.length} usuario(s)
                    </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                <th className="px-3 py-2 font-medium">
                                    Usuario
                                </th>
                                <th className="px-3 py-2 font-medium">
                                    Correo
                                </th>
                                <th className="px-3 py-2 font-medium">Rol</th>
                                <th className="px-3 py-2 font-medium">
                                    Estado
                                </th>
                                <th className="px-3 py-2 font-medium">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 py-8 text-center text-sm text-neutral-500"
                                    >
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}
                            {!isLoading && loadError && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-3 py-8 text-center text-sm text-red-600"
                                    >
                                        {loadError}
                                    </td>
                                </tr>
                            )}
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-neutral-100 text-neutral-700"
                                >
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                            <span className="font-medium text-neutral-900">
                                                {user.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">{user.email}</td>
                                    <td className="px-3 py-3">{user.role}</td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={[
                                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                                user.isActive
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-neutral-100 text-neutral-600",
                                            ].join(" ")}
                                        >
                                            {user.isActive
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(user.id)
                                                }
                                                className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleReset(user.id)
                                                }
                                                className="rounded-lg bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                                                title="Restablecer acceso"
                                            >
                                                <Shield className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleStatus(user.id)
                                                }
                                                className={[
                                                    "rounded-lg p-2 transition",
                                                    user.isActive
                                                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                        : "bg-green-50 text-green-600 hover:bg-green-100",
                                                ].join(" ")}
                                                title={
                                                    user.isActive
                                                        ? "Desactivar"
                                                        : "Activar"
                                                }
                                            >
                                                {user.isActive ? (
                                                    <ToggleLeft className="h-4 w-4" />
                                                ) : (
                                                    <ToggleRight className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading &&
                                !loadError &&
                                filteredUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-8 text-center text-sm text-neutral-500"
                                        >
                                            No hay usuarios que coincidan con el
                                            filtro.
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function toUserRecord(user: Usuario): UserRecord {
    const roleValue = normalizeRole(
        typeof user.role === "string"
            ? user.role
            : (user.role?.name ?? "Sin rol"),
    );
    return {
        id: String(user.id ?? ""),
        name: user.name ?? "Sin nombre",
        email: user.email ?? "Sin correo",
        role: roleValue,
        isActive: true,
    };
}

function normalizeRole(role: string) {
    const normalized = role.trim().toLowerCase();
    if (normalized === "administrador" || normalized === "admin") {
        return "admin";
    }
    if (normalized === "usuario" || normalized === "user") {
        return "user";
    }
    return role;
}
