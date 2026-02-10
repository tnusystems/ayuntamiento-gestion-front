"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
    Shield,
    UserPlus,
    Users,
    ShieldCheck,
    Activity,
    Pencil,
    Eye,
    EyeOff,
    X,
} from "lucide-react";
import {
    createUser,
    fetchRoles,
    fetchUsers,
    assignUserRole,
    updateUser,
} from "@/lib/api/users";
import type { Rol, Usuario } from "@/types";

type UserRecord = {
    id: string;
    name: string;
    email: string;
    role: string;
    roles: string[];
    fatherLastName: string | null;
    motherLastName: string | null;
    employeeNumber: string | null;
    address: string | null;
    isActive: boolean;
    updatedAt: string | null;
};

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    role: string;
    fatherLastName: string;
    motherLastName: string;
    employeeNumber: string;
    address: string;
};

type EditUserForm = {
    userId: string;
    name: string;
    fatherLastName: string;
    motherLastName: string;
    employeeNumber: string;
    address: string;
};

const DEFAULT_ROLE_OPTIONS = ["Todos", "Sin rol"];

const ROLE_LABELS: Record<string, string> = {
    system_admin: "Administrador",
    siystem_admin: "Administrador",
    inventory_manager: "Gestor de inventario",
    inventory_operator: "Operador de inventario",
    invetory_operator: "Operador de inventario",
    viewer: "Visitante",
};

function toRoleKey(role?: string | null) {
    return role?.trim().toLowerCase() ?? "";
}

function getRoleLabel(role?: string | null) {
    const key = toRoleKey(role);
    return ROLE_LABELS[key] ?? role ?? "";
}

export default function UsersManager() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState(DEFAULT_ROLE_OPTIONS[0]);
    const [statusFilter, setStatusFilter] = useState("Todos");
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
    const [roleDialog, setRoleDialog] = useState<{
        open: boolean;
        userId?: string;
        roleId?: number;
    }>({ open: false });
    const [roleError, setRoleError] = useState<string | null>(null);
    const [roleNotice, setRoleNotice] = useState<string | null>(null);
    const [isAssigningRole, setIsAssigningRole] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserForm>({
        name: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        role: "user",
        fatherLastName: "",
        motherLastName: "",
        employeeNumber: "",
        address: "",
    });
    const [editForm, setEditForm] = useState<EditUserForm>({
        userId: "",
        name: "",
        fatherLastName: "",
        motherLastName: "",
        employeeNumber: "",
        address: "",
    });

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            setIsLoading(true);
            setLoadError(null);
            try {
                const [usersData, rolesData] = await Promise.all([
                    fetchUsers(),
                    fetchRoles(),
                ]);
                if (!isMounted) return;
                setUsers(usersData.map(toUserRecord));
                setRoles(rolesData);
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

    const roleStats = useMemo(() => {
        const counts = new Map<string, number>();
        for (const user of users) {
            for (const roleName of user.roles) {
                const key = roleName.trim().toLowerCase();
                if (!key) continue;
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
        }
        return roles.map((role) => {
            const key = toRoleKey(role.name);
            return {
                ...role,
                count: counts.get(key) ?? 0,
            };
        });
    }, [roles, users]);

    const filteredUsers = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        const normalizedRole = toRoleKey(roleFilter);
        const normalizedStatus = statusFilter.trim().toLowerCase();
        return users.filter((user) => {
            const matchesQuery =
                !normalizedQuery ||
                user.name.toLowerCase().includes(normalizedQuery) ||
                user.email.toLowerCase().includes(normalizedQuery);
            const matchesRole =
                normalizedRole === "todos" ||
                (normalizedRole === "sin rol" && user.roles.length === 0) ||
                toRoleKey(user.role) === normalizedRole ||
                user.roles.some(
                    (roleName) => toRoleKey(roleName) === normalizedRole,
                );
            const matchesStatus =
                normalizedStatus === "todos" ||
                (normalizedStatus === "activos" && user.isActive) ||
                (normalizedStatus === "inactivos" && !user.isActive);
            return matchesQuery && matchesRole && matchesStatus;
        });
    }, [users, query, roleFilter, statusFilter]);

    const handleCreateChange = (field: keyof CreateUserForm, value: string) => {
        setCreateForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditChange = (field: keyof EditUserForm, value: string) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const openEditUser = (user: UserRecord) => {
        setEditError(null);
        setIsEditOpen(true);
        setEditForm({
            userId: user.id,
            name: user.name,
            fatherLastName: user.fatherLastName ?? "",
            motherLastName: user.motherLastName ?? "",
            employeeNumber: user.employeeNumber ?? "",
            address: user.address ?? "",
        });
    };

    const closeEditUser = () => {
        setIsEditOpen(false);
        setIsEditing(false);
        setEditError(null);
    };

    const openAssignRole = (userId: string) => {
        setRoleError(null);
        setRoleNotice(null);
        const defaultRoleId = roles[0]?.id;
        setRoleDialog({
            open: true,
            userId,
            roleId: defaultRoleId,
        });
    };

    const closeAssignRole = () => {
        setRoleDialog({ open: false });
        setRoleError(null);
        setRoleNotice(null);
        setIsAssigningRole(false);
    };

    const handleAssignRole = async () => {
        if (!roleDialog.userId || !roleDialog.roleId) {
            setRoleError("Selecciona un rol.");
            return;
        }
        const role = roles.find((item) => item.id === roleDialog.roleId);
        if (!role) {
            setRoleError("Selecciona un rol válido.");
            return;
        }
        setRoleError(null);
        setRoleNotice(null);
        setIsAssigningRole(true);
        try {
            const response = await assignUserRole(roleDialog.userId, {
                role_id: role.id,
                name: role.name,
            });
            setUsers((prev) =>
                prev.map((user) => {
                    if (user.id !== String(roleDialog.userId)) {
                        return user;
                    }
                    if (
                        response &&
                        typeof response === "object" &&
                        "user" in response
                    ) {
                        const candidate = (response as { user?: Usuario }).user;
                        if (candidate) {
                            return toUserRecord(candidate);
                        }
                    }
                    if (
                        response &&
                        typeof response === "object" &&
                        Array.isArray((response as { roles?: unknown }).roles)
                    ) {
                        const roles = (response as { roles: string[] }).roles;
                        return {
                            ...user,
                            role: role.name ?? user.role,
                            roles: roles,
                        };
                    }
                    return {
                        ...user,
                        role: role.name ?? user.role,
                    };
                }),
            );
            setRoleNotice("Rol asignado.");
            closeAssignRole();
        } catch (error) {
            setRoleError(
                error instanceof Error
                    ? error.message
                    : "No se pudo asignar el rol.",
            );
        } finally {
            setIsAssigningRole(false);
        }
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
                father_last_name: createForm.fatherLastName.trim() || null,
                mother_last_name: createForm.motherLastName.trim() || null,
                employee_number: createForm.employeeNumber.trim() || null,
                address: createForm.address.trim() || null,
            };
            const created = await createUser(payload);
            setUsers((prev) => [toUserRecord(created), ...prev]);
            setCreateForm({
                name: "",
                email: "",
                password: "",
                passwordConfirmation: "",
                role: "user",
                fatherLastName: "",
                motherLastName: "",
                employeeNumber: "",
                address: "",
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

    const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setEditError(null);

        if (!editForm.userId) {
            setEditError("No se encontro el usuario a editar.");
            return;
        }

        const trimmedName = editForm.name.trim();
        if (!trimmedName) {
            setEditError("El nombre es obligatorio.");
            return;
        }

        setIsEditing(true);
        try {
            const payload = {
                name: trimmedName,
                father_last_name: editForm.fatherLastName.trim() || null,
                mother_last_name: editForm.motherLastName.trim() || null,
                employee_number: editForm.employeeNumber.trim() || null,
                address: editForm.address.trim() || null,
            };
            const updated = await updateUser(editForm.userId, payload);
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === editForm.userId ? toUserRecord(updated) : user,
                ),
            );
            closeEditUser();
        } catch (error) {
            setEditError(
                error instanceof Error
                    ? error.message
                    : "No se pudo editar el usuario.",
            );
        } finally {
            setIsEditing(false);
        }
    };

    return (
        <>
            <div className="min-h-[calc(100vh-4rem)] rounded-2xl  px-6 py-8 text-neutral-900 ">
                <div className="mx-auto space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                                <Shield className="h-6 w-6 text-neutral-800" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-semibold text-neutral-900">
                                    Gestor de Usuarios y Roles
                                </h1>
                                <p className="text-sm text-neutral-500">
                                    Administra los accesos de tu equipo
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 cursor-pointer"
                            onClick={() => setIsCreateOpen((prev) => !prev)}
                        >
                            <UserPlus className="h-4 w-4" />
                            Nuevo Usuario
                        </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            {
                                label: "Usuarios Totales",
                                value: stats.total,
                                icon: Users,
                            },
                            {
                                label: "Usuarios Activos",
                                value: stats.active,
                                icon: ShieldCheck,
                            },
                            {
                                label: "Usuarios Inactivos",
                                value: stats.inactive,
                                icon: Activity,
                            },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                            >
                                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                                    <item.icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-2xl font-semibold text-neutral-900">
                                        {item.value}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {item.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-1 text-sm">
                                    <button
                                        type="button"
                                        className={[
                                            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shadow-sm cursor-pointer",
                                            activeTab === "users"
                                                ? "bg-white text-neutral-900"
                                                : "text-neutral-500 hover:bg-white/70",
                                        ].join(" ")}
                                        onClick={() => setActiveTab("users")}
                                    >
                                        <Users className="h-4 w-4" />
                                        Usuarios
                                    </button>
                                    <button
                                        type="button"
                                        className={[
                                            "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer",
                                            activeTab === "roles"
                                                ? "bg-white text-neutral-900 shadow-sm"
                                                : "text-neutral-500 hover:bg-white/70",
                                        ].join(" ")}
                                        onClick={() => setActiveTab("roles")}
                                    >
                                        <ShieldCheck className="h-4 w-4" />
                                        Roles
                                    </button>
                                </div>
                                <div className="text-sm text-neutral-500">
                                    {activeTab === "users"
                                        ? `${filteredUsers.length} usuario(s)`
                                        : `${roles.length} rol(es) configurados`}
                                </div>
                            </div>

                            {activeTab === "users" ? (
                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        type="search"
                                        placeholder="Buscar usuarios..."
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        className="min-w-[240px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                    />
                                    <select
                                        value={roleFilter}
                                        onChange={(event) =>
                                            setRoleFilter(event.target.value)
                                        }
                                        className="min-w-[160px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                    >
                                        {[
                                            ...DEFAULT_ROLE_OPTIONS,
                                            ...roles.map((r) => r.name),
                                        ].map((role) => (
                                            <option key={role} value={role}>
                                                {getRoleLabel(role)}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        className="min-w-[140px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                    >
                                        {["Todos", "Activos", "Inactivos"].map(
                                            (status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-neutral-500">
                                        Gestiona los permisos y accesos por rol.
                                    </p>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 cursor-pointer"
                                    >
                                        Nuevo Rol
                                    </button>
                                </div>
                            )}
                        </div>

                        {activeTab === "users" ? (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm text-neutral-700">
                                    <thead>
                                        <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wider text-neutral-500">
                                            <th className="px-3 py-2 font-medium">
                                                Usuario
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Rol
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Estado
                                            </th>
                                            <th className="px-3 py-2 font-medium">
                                                Ultimo acceso
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
                                                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-700">
                                                            {user.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-neutral-900">
                                                                {user.name}
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
                                                        {user.roles.length > 0
                                                            ? user.roles
                                                                  .map((role) =>
                                                                      getRoleLabel(
                                                                          role,
                                                                      ),
                                                                  )
                                                                  .join(", ")
                                                            : "No hay rol asignado"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={[
                                                            "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                                                            user.isActive
                                                                ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                                                                : "border border-neutral-200 bg-neutral-100 text-neutral-600",
                                                        ].join(" ")}
                                                    >
                                                        {user.isActive
                                                            ? "Activo"
                                                            : "Inactivo"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-sm text-neutral-500">
                                                    {formatLastAccess(
                                                        user.updatedAt,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                            Editar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openAssignRole(
                                                                    user.id,
                                                                )
                                                            }
                                                            className="rounded-lg border border-neutral-200 px-3 py-1 text-xs text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                                        >
                                                            Asignar rol
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
                                                        No hay usuarios que
                                                        coincidan con el filtro.
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-3">
                                {roleStats.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
                                                <Shield className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900">
                                                    {getRoleLabel(role.name)}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {role.description ??
                                                        "Sin descripcion"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <Users className="h-4 w-4" />
                                            {role.count}
                                        </div>
                                    </div>
                                ))}
                                {roleStats.length === 0 && (
                                    <p className="py-6 text-center text-sm text-neutral-500">
                                        No hay roles disponibles.
                                    </p>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </div>
            {isCreateOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={() => setIsCreateOpen(false)}
                    role="presentation"
                >
                    <div
                        className="w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Crear usuario"
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    Crear usuario
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Completa la información del nuevo usuario.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                onClick={() => setIsCreateOpen(false)}
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
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
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Apellido paterno
                                </label>
                                <input
                                    type="text"
                                    value={createForm.fatherLastName}
                                    onChange={(event) =>
                                        handleCreateChange(
                                            "fatherLastName",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Apellido materno
                                </label>
                                <input
                                    type="text"
                                    value={createForm.motherLastName}
                                    onChange={(event) =>
                                        handleCreateChange(
                                            "motherLastName",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
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
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Número de empleado
                                </label>
                                <input
                                    type="text"
                                    value={createForm.employeeNumber}
                                    onChange={(event) =>
                                        handleCreateChange(
                                            "employeeNumber",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-neutral-500">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={createForm.address}
                                    onChange={(event) =>
                                        handleCreateChange(
                                            "address",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Contrasena
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={createForm.password}
                                        onChange={(event) =>
                                            handleCreateChange(
                                                "password",
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 cursor-pointer"
                                        aria-label={
                                            showPassword
                                                ? "Ocultar contrasena"
                                                : "Mostrar contrasena"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Confirmacion
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        required
                                        value={createForm.passwordConfirmation}
                                        onChange={(event) =>
                                            handleCreateChange(
                                                "passwordConfirmation",
                                                event.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-10 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 cursor-pointer"
                                        aria-label={
                                            showPassword
                                                ? "Ocultar contrasena"
                                                : "Mostrar contrasena"
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-end gap-3 md:col-span-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={isCreating}
                                >
                                    {isCreating
                                        ? "Guardando..."
                                        : "Crear usuario"}
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                            {createError && (
                                <p className="text-sm text-red-600 md:col-span-2">
                                    {createError}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {isEditOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    onClick={closeEditUser}
                    role="presentation"
                >
                    <div
                        className="w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Editar usuario"
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">
                                    Editar usuario
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Actualiza la informacion basica del usuario.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                onClick={closeEditUser}
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form
                            className="grid gap-4 md:grid-cols-2"
                            onSubmit={handleEditSubmit}
                        >
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.name}
                                    onChange={(event) =>
                                        handleEditChange(
                                            "name",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Apellido paterno
                                </label>
                                <input
                                    type="text"
                                    value={editForm.fatherLastName}
                                    onChange={(event) =>
                                        handleEditChange(
                                            "fatherLastName",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Apellido materno
                                </label>
                                <input
                                    type="text"
                                    value={editForm.motherLastName}
                                    onChange={(event) =>
                                        handleEditChange(
                                            "motherLastName",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-neutral-500">
                                    Numero de empleado
                                </label>
                                <input
                                    type="text"
                                    value={editForm.employeeNumber}
                                    onChange={(event) =>
                                        handleEditChange(
                                            "employeeNumber",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-neutral-500">
                                    Direccion
                                </label>
                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={(event) =>
                                        handleEditChange(
                                            "address",
                                            event.target.value,
                                        )
                                    }
                                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                                />
                            </div>
                            <div className="flex items-end gap-3 md:col-span-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    disabled={isEditing}
                                >
                                    {isEditing
                                        ? "Guardando..."
                                        : "Guardar cambios"}
                                </button>
                                <button
                                    type="button"
                                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                    onClick={closeEditUser}
                                    disabled={isEditing}
                                >
                                    Cancelar
                                </button>
                            </div>
                            {editError && (
                                <p className="text-sm text-red-600 md:col-span-2">
                                    {editError}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}
            {roleDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-lg">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Asignar rol
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Selecciona el rol que deseas asignar al usuario.
                        </p>
                        <div className="mt-4 space-y-2">
                            <label className="text-xs font-semibold text-neutral-500">
                                Rol
                            </label>
                            <select
                                value={roleDialog.roleId ?? ""}
                                onChange={(event) =>
                                    setRoleDialog((prev) => ({
                                        ...prev,
                                        roleId: Number(event.target.value),
                                    }))
                                }
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
                            >
                                <option value="" disabled>
                                    Selecciona un rol
                                </option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {getRoleLabel(role.name)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {roleError ? (
                            <p className="mt-3 text-sm text-red-600">
                                {roleError}
                            </p>
                        ) : null}
                        {roleNotice ? (
                            <p className="mt-3 text-sm text-emerald-600">
                                {roleNotice}
                            </p>
                        ) : null}
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                className="rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50 cursor-pointer"
                                onClick={closeAssignRole}
                                disabled={isAssigningRole}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                onClick={handleAssignRole}
                                disabled={isAssigningRole}
                            >
                                {isAssigningRole ? "Asignando..." : "Asignar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function toUserRecord(user: Usuario): UserRecord {
    const userData = user as Record<string, unknown>;
    const roleNames = Array.isArray(user.roles)
        ? user.roles.map((item) => item.name).filter(Boolean)
        : [];
    return {
        id: String(user.id ?? ""),
        name: user.name ?? "Sin nombre",
        email: user.email ?? "Sin correo",
        role: roleNames[0] ?? "",
        roles: roleNames,
        fatherLastName:
            typeof userData.father_last_name === "string"
                ? userData.father_last_name
                : null,
        motherLastName:
            typeof userData.mother_last_name === "string"
                ? userData.mother_last_name
                : null,
        employeeNumber:
            typeof userData.employee_number === "string"
                ? userData.employee_number
                : null,
        address: typeof userData.address === "string" ? userData.address : null,
        isActive: true,
        updatedAt: typeof user.updated_at === "string" ? user.updated_at : null,
    };
}

function formatLastAccess(value: string | null) {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(parsed);
}
