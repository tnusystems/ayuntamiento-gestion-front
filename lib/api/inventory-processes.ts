import { api } from "./client";

type InventoryProcessPayload = {
    asset_id: number;
    process_type: string;
    status: string;
    closed_at: string;
    notes?: string;
};

type InventoryProcessListParams = {
    asset_id?: number | string;
};

export async function createInventoryProcess(payload: InventoryProcessPayload) {
    return api<unknown>("/inventory_processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}

export async function fetchInventoryProcesses(
    params?: InventoryProcessListParams,
) {
    const search = new URLSearchParams();
    if (params?.asset_id !== undefined) {
        search.set("asset_id", String(params.asset_id));
    }
    const query = search.toString();
    return api<unknown>(`/inventory_processes${query ? `?${query}` : ""}`);
}
