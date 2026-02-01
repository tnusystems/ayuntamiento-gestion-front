import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UsersManager from "@/components/users/users-manager";
import { authOptions } from "@/lib/auth";

function normalize(value?: string | null) {
    return value?.trim().toLowerCase() ?? "";
}

export default async function UsuariosPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const role = normalize(session.user?.role);
    const isAdmin = role === "admin";

    if (!isAdmin) {
        redirect("/dashboard");
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <UsersManager />
        </div>
    );
}
