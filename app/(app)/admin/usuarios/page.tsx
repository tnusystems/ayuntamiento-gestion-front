import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UsersManager from "@/components/users/users-manager";
import { authOptions } from "@/lib/auth";

function normalize(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

function getRoleKeys(role?: string | null, roles?: Array<{ name?: string }>) {
    const keys = new Set<string>();
    const normalizedRole = normalize(role);
    if (normalizedRole) {
        keys.add(normalizedRole);
    }
    if (Array.isArray(roles)) {
        for (const item of roles) {
            const roleName = normalize(item?.name);
            if (roleName) {
                keys.add(roleName);
            }
        }
    }
    return keys;
}

export default async function AdminUsuariosPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const roleKeys = getRoleKeys(session.user?.role, session.user?.roles);
    const isAdmin = roleKeys.has("system_admin");

    if (!isAdmin) {
        redirect("/dashboard");
    }

    return (
            <UsersManager />
        
    );
}
