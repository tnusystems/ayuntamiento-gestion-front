import type {
    ApprovalRequest,
    Activity,
    BienApi,
    ChangeLog,
    LookupValue,
    OperationType,
    RegistryApi,
    Report,
    Rol,
    Usuario,
} from "@/types";
import type { SystemDocument } from "@/lib/api/documents";

/**
 * Fallback data shown when the backend is unreachable, so pages render
 * a usable (clearly labeled) preview instead of an empty/broken screen.
 */
export const MOCK_FALLBACK_MESSAGE =
    "No se pudo conectar con el servidor. Mostrando datos de ejemplo.";

export const mockPagination = {
    current_page: 1,
    next_page: null,
    prev_page: null,
    total_pages: 1,
    total_count: 3,
    per_page: 10,
};

export const mockRegistries: RegistryApi[] = [
    {
        id: 1001,
        name: "Palacio Municipal",
        rpp_number: "RPP-2024-001",
        rpp_volume: "12",
        rpp_section: "A",
        rpp_date: "2024-01-15",
        b_number: "B-001",
        b_volume: "3",
        b_date: "2024-01-10",
        e_number: "E-500",
        e_notary: "Notaría 4",
        e_date: "2023-12-01",
        status: "activo",
        fecha_alta: "2024-01-15",
        st_baja: false,
        created_at: "2024-01-15T09:00:00Z",
        updated_at: "2024-01-15T09:00:00Z",
    },
    {
        id: 1002,
        name: "Mercado Central",
        rpp_number: "RPP-2024-002",
        rpp_volume: "8",
        rpp_section: "B",
        rpp_date: "2024-02-20",
        status: "activo",
        fecha_alta: "2024-02-20",
        st_baja: false,
        created_at: "2024-02-20T09:00:00Z",
        updated_at: "2024-02-20T09:00:00Z",
    },
    {
        id: 1003,
        name: "Parque Juárez",
        rpp_number: "RPP-2024-003",
        rpp_volume: "5",
        rpp_section: "C",
        rpp_date: "2024-03-05",
        status: "baja",
        fecha_alta: "2024-03-05",
        st_baja: true,
        created_at: "2024-03-05T09:00:00Z",
        updated_at: "2024-03-05T09:00:00Z",
    },
];

export const mockAssets: BienApi[] = [
    {
        id: 2001,
        rpp_number: "RPP-2024-001",
        c_number: "C-0001",
        description: "Edificio de gobierno municipal",
        inventory_status: "alta",
        location: { name: "Centro", city: "Ciudad Ejemplo", state: "Estado" },
        operation_type_id: 1,
        operation_type_name: "Alta",
        colony: "Centro",
        street: "Av. Reforma 100",
        total_area: "1200",
        built_area: "950",
        cadastral_value: "5000000",
        commercial_value: "6500000",
        latitude: "19.4326",
        longitude: "-99.1332",
        created_at: "2024-01-16T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
    },
    {
        id: 2002,
        rpp_number: "RPP-2024-002",
        c_number: "C-0002",
        description: "Local comercial en mercado municipal",
        inventory_status: "alta",
        location: { name: "Mercado Central", city: "Ciudad Ejemplo", state: "Estado" },
        operation_type_id: 1,
        operation_type_name: "Alta",
        colony: "Centro",
        street: "Calle Hidalgo 45",
        total_area: "80",
        built_area: "80",
        cadastral_value: "450000",
        commercial_value: "600000",
        created_at: "2024-02-21T10:00:00Z",
        updated_at: "2024-02-21T10:00:00Z",
    },
    {
        id: 2003,
        rpp_number: "RPP-2024-003",
        c_number: "C-0003",
        description: "Predio dado de baja por donación",
        inventory_status: "baja",
        location: { name: "Parque Juárez", city: "Ciudad Ejemplo", state: "Estado" },
        operation_type_id: 2,
        operation_type_name: "Baja",
        colony: "Norte",
        street: "Calle Morelos 10",
        total_area: "300",
        built_area: "0",
        cadastral_value: "200000",
        commercial_value: "250000",
        created_at: "2024-03-06T10:00:00Z",
        updated_at: "2024-03-06T10:00:00Z",
    },
];

export const mockActivities: Activity[] = [
    {
        id: 3001,
        user_id: 1,
        trackable_type: "Asset",
        trackable_id: 2001,
        action: "created",
        details: { rpp_number: "RPP-2024-001", asset_id: 2001 },
        created_at: "2024-03-10T12:00:00Z",
        updated_at: "2024-03-10T12:00:00Z",
        user: { id: 1, email: "admin@example.gob.mx", name: "Admin Demo" },
    },
    {
        id: 3002,
        user_id: 2,
        trackable_type: "Registry",
        trackable_id: 1002,
        action: "updated",
        details: { registry_id: 1002 },
        created_at: "2024-03-09T12:00:00Z",
        updated_at: "2024-03-09T12:00:00Z",
        user: { id: 2, email: "editor@example.gob.mx", name: "Editor Demo" },
    },
    {
        id: 3003,
        user_id: 1,
        trackable_type: "InventoryProcess",
        trackable_id: 5,
        action: "destroyed",
        details: { inventory_process_id: 5 },
        created_at: "2024-03-08T12:00:00Z",
        updated_at: "2024-03-08T12:00:00Z",
        user: { id: 1, email: "admin@example.gob.mx", name: "Admin Demo" },
    },
];

export const mockReports: Report[] = [
    {
        id: 4001,
        report_type: "assets",
        status: "completed",
        created_at: "2024-03-01T08:00:00Z",
        file_name: "reporte-bienes-ejemplo.pdf",
        filename: "reporte-bienes-ejemplo.pdf",
        file_url: "#",
    },
    {
        id: 4002,
        report_type: "registries",
        status: "completed",
        created_at: "2024-02-15T08:00:00Z",
        file_name: "reporte-registros-ejemplo.pdf",
        filename: "reporte-registros-ejemplo.pdf",
        file_url: "#",
    },
];

export const mockChangeLogs: ChangeLog[] = [
    {
        id: 5001,
        event: "update",
        item_type: "Asset",
        item_id: 2001,
        created_at: "2024-03-09T12:00:00Z",
        user: { id: 1, name: "Admin Demo", email: "admin@example.gob.mx" },
        changes: { inventory_status: ["alta", "baja"] },
        item: { id: 2001 },
    },
    {
        id: 5002,
        event: "create",
        item_type: "Registry",
        item_id: 1002,
        created_at: "2024-02-20T09:00:00Z",
        user: { id: 2, name: "Editor Demo", email: "editor@example.gob.mx" },
        changes: {},
        item: { id: 1002 },
    },
];

export const mockApprovalRequests: ApprovalRequest[] = [
    {
        id: 6001,
        subject_type: "Asset",
        subject_id: 2001,
        requested_by_id: 2,
        action: "update",
        payload: { attributes: { inventory_status: "baja" } },
        status: "pending",
        requested_at: "2024-03-11T09:00:00Z",
        created_at: "2024-03-11T09:00:00Z",
        updated_at: "2024-03-11T09:00:00Z",
        requested_by: { id: 2, name: "Editor Demo", email: "editor@example.gob.mx" },
    },
    {
        id: 6002,
        subject_type: "Registry",
        subject_id: 1003,
        requested_by_id: 2,
        approved_by_id: 1,
        action: "delete",
        payload: { attributes: {} },
        status: "approved",
        requested_at: "2024-03-05T09:00:00Z",
        decided_at: "2024-03-06T09:00:00Z",
        created_at: "2024-03-05T09:00:00Z",
        updated_at: "2024-03-06T09:00:00Z",
        requested_by: { id: 2, name: "Editor Demo", email: "editor@example.gob.mx" },
        approved_by: { id: 1, name: "Admin Demo", email: "admin@example.gob.mx" },
    },
];

export const mockUsers: Usuario[] = [
    {
        id: 1,
        email: "admin@example.gob.mx",
        name: "Admin Demo",
        role: "system_admin",
        roles: [{ id: 1, name: "Administrador", key: "system_admin" }],
        updated_at: "2024-03-01T00:00:00Z",
    },
    {
        id: 2,
        email: "editor@example.gob.mx",
        name: "Editor Demo",
        role: "editor",
        roles: [{ id: 2, name: "Editor", key: "editor" }],
        updated_at: "2024-03-01T00:00:00Z",
    },
];

export const mockRoles: Rol[] = [
    { id: 1, name: "Administrador", key: "system_admin" },
    { id: 2, name: "Editor", key: "editor" },
    { id: 3, name: "Consulta", key: "viewer" },
];

export const mockOperationTypes: OperationType[] = [
    { id: 1, name: "Alta", key: "alta", kind: "inventory", position: 1, active: true },
    { id: 2, name: "Baja", key: "baja", kind: "inventory", position: 2, active: true },
];

export const mockLookupValues: LookupValue[] = [
    { id: 1, kind: "asset_category", key: "building", name: "Edificio", position: 1, active: true },
    { id: 2, kind: "asset_category", key: "land", name: "Terreno", position: 2, active: true },
];

export const mockSystemDocuments: SystemDocument[] = [
    {
        id: 7001,
        name: "Escritura pública ejemplo.pdf",
        kind: "escritura",
        position: 1,
        file: {
            filename: "escritura-ejemplo.pdf",
            content_type: "application/pdf",
            byte_size: 204800,
            url: "#",
        },
        image: false,
        attachable_type: "Asset",
        attachable_id: 2001,
        created_at: "2024-01-16T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
    },
    {
        id: 7002,
        name: "Fotografía del inmueble.jpg",
        kind: "fotografia",
        position: 2,
        file: {
            filename: "foto-ejemplo.jpg",
            content_type: "image/jpeg",
            byte_size: 102400,
            url: "#",
        },
        image: true,
        attachable_type: "Asset",
        attachable_id: 2001,
        created_at: "2024-01-16T10:00:00Z",
        updated_at: "2024-01-16T10:00:00Z",
    },
];
