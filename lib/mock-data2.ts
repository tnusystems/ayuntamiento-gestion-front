// mock-data.ts - Versión actualizada
export interface Expediente {
    id: string;
    name: string;
    status: "activo" | "baja" | "en_tramite";
    rppNumber?: string;
    rppVolume?: string;
    rppSection?: string;
    bNumber?: string;
    bVolume?: string;
    fecha_alta?: string;
}

export interface Bien {
    id: string;
    expedienteId: string;
    tipo: "inmueble" | "mueble";
    categoria: string;
    rppNumero: string;
    cNumero: string;
    nombre: string;
    descripcion: string;
    estatus: "activo" | "baja" | "en_tramite";
    fechaAlta: string;
    ubicacion: string;
    valorCatastral: number;
    ultimoProceso?: string;
    superficie?: number; // para inmuebles
    marca?: string; // para muebles
    modelo?: string; // para muebles
}

export interface Proceso {
    id: string;
    bienId: string;
    tipo:
    | "ALTA"
    | "BAJA"
    | "MODIFICACION"
    | "REGULARIZACION"
    | "REACTIVACION"
    | "PI";
    actoJuridico: string;
    responsable: string;
    fechaInicio: string;
    fechaFin?: string;
    estatus: "borrador" | "en_revision" | "aprobado" | "rechazado";
    observaciones: string;
}

// Expedientes de ejemplo
export const expedientes: Expediente[] = [
    {
        id: "1",
        name: "Expediente Centro Cívico",
        status: "activo",
        rppNumber: "RPP-2024-001",
        bNumber: "B-001",
        fecha_alta: "2024-01-15"
    },
    {
        id: "2",
        name: "Expediente Oficinas Sur",
        status: "activo",
        rppNumber: "RPP-2024-002",
        bNumber: "B-002",
        fecha_alta: "2024-02-20"
    },
    {
        id: "3",
        name: "Expediente Parque Industrial",
        status: "en_tramite",
        rppNumber: "RPP-2024-004",
        bNumber: "B-004",
        fecha_alta: "2024-04-05"
    },
    {
        id: "4",
        name: "Expediente Reserva Ecológica",
        status: "activo",
        rppNumber: "RPP-2024-006",
        bNumber: "B-006",
        fecha_alta: "2024-05-20"
    },
    {
        id: "5",
        name: "Expediente Villa Bonita",
        status: "en_tramite",
        rppNumber: "RPP-2024-008",
        bNumber: "B-008",
        fecha_alta: "2024-07-10"
    }
];

// Bienes actualizados con expedienteId
export const bienes: Bien[] = [
    // Expediente 1 - 2 bienes
    {
        id: "1",
        expedienteId: "1",
        tipo: "inmueble",
        categoria: "Terreno",
        rppNumero: "RPP-2024-001",
        cNumero: "C-001",
        nombre: "Terreno Centro Cívico Norte",
        descripcion: "Terreno destinado para construcción del centro cívico municipal",
        estatus: "activo",
        fechaAlta: "2024-01-15",
        ubicacion: "Col. Centro, Calle Serdán #123",
        valorCatastral: 2500000,
        superficie: 5000,
        ultimoProceso: "ALTA",
    },
    {
        id: "2",
        expedienteId: "1",
        tipo: "mueble",
        categoria: "Mobiliario",
        rppNumero: "RPP-2024-001-A",
        cNumero: "C-001-A",
        nombre: "Mobiliario Centro Cívico",
        descripcion: "Mobiliario para oficinas del centro cívico",
        estatus: "activo",
        fechaAlta: "2024-01-20",
        ubicacion: "Col. Centro, Calle Serdán #123",
        valorCatastral: 150000,
        marca: "OfficePro",
        modelo: "2024",
        ultimoProceso: "ALTA",
    },
    // Expediente 2 - 2 bienes
    {
        id: "3",
        expedienteId: "2",
        tipo: "inmueble",
        categoria: "Edificio",
        rppNumero: "RPP-2024-002",
        cNumero: "C-002",
        nombre: "Oficinas Administrativas Sur",
        descripcion: "Edificio de oficinas gubernamentales",
        estatus: "activo",
        fechaAlta: "2024-02-20",
        ubicacion: "Col. Villa de Seris, Blvd. Kino #456",
        valorCatastral: 8500000,
        superficie: 1200,
        ultimoProceso: "MODIFICACION",
    },
    {
        id: "4",
        expedienteId: "2",
        tipo: "mueble",
        categoria: "Vehículo",
        rppNumero: "RPP-2024-002-A",
        cNumero: "C-002-A",
        nombre: "Camioneta Ford F-150 2023",
        descripcion: "Vehículo oficial para supervisiones",
        estatus: "activo",
        fechaAlta: "2024-02-25",
        ubicacion: "Parque vehicular municipal",
        valorCatastral: 650000,
        marca: "Ford",
        modelo: "F-150 2023",
        ultimoProceso: "ALTA",
    },
    // Expediente 3 - 2 bienes
    {
        id: "5",
        expedienteId: "3",
        tipo: "inmueble",
        categoria: "Predio",
        rppNumero: "RPP-2024-004",
        cNumero: "C-004",
        nombre: "Predio Parque Industrial",
        descripcion: "Predio para desarrollo industrial municipal",
        estatus: "en_tramite",
        fechaAlta: "2024-04-05",
        ubicacion: "Parque Industrial Hermosillo",
        valorCatastral: 12000000,
        superficie: 25000,
        ultimoProceso: "REGULARIZACION",
    },
    {
        id: "6",
        expedienteId: "3",
        tipo: "inmueble",
        categoria: "Terreno",
        rppNumero: "RPP-2024-004-A",
        cNumero: "C-004-A",
        nombre: "Terreno Adyacente Parque Industrial",
        descripcion: "Terreno adicional para expansión",
        estatus: "en_tramite",
        fechaAlta: "2024-04-10",
        ubicacion: "Parque Industrial Hermosillo",
        valorCatastral: 3500000,
        superficie: 8000,
        ultimoProceso: "REGULARIZACION",
    },
    // Expediente 4 - 2 bienes
    {
        id: "7",
        expedienteId: "4",
        tipo: "inmueble",
        categoria: "Terreno",
        rppNumero: "RPP-2024-006",
        cNumero: "C-006",
        nombre: "Terreno Reserva Ecológica",
        descripcion: "Terreno protegido para conservación ecológica",
        estatus: "activo",
        fechaAlta: "2024-05-20",
        ubicacion: "Zona Norte, Ejido Los Nogales",
        valorCatastral: 4200000,
        superficie: 15000,
        ultimoProceso: "ALTA",
    },
    {
        id: "8",
        expedienteId: "4",
        tipo: "mueble",
        categoria: "Equipo",
        rppNumero: "RPP-2024-006-A",
        cNumero: "C-006-A",
        nombre: "Equipo de Monitoreo Ambiental",
        descripcion: "Equipo para monitoreo de la reserva ecológica",
        estatus: "activo",
        fechaAlta: "2024-05-25",
        ubicacion: "Zona Norte, Ejido Los Nogales",
        valorCatastral: 185000,
        marca: "EcoMonitor",
        modelo: "Pro 5000",
        ultimoProceso: "ALTA",
    },
    // Expediente 5 - 2 bienes
    {
        id: "9",
        expedienteId: "5",
        tipo: "inmueble",
        categoria: "Edificio",
        rppNumero: "RPP-2024-008",
        cNumero: "C-008",
        nombre: "Centro Comunitario Villa Bonita",
        descripcion: "Centro comunitario para actividades sociales",
        estatus: "en_tramite",
        fechaAlta: "2024-07-10",
        ubicacion: "Col. Villa Bonita, Calle Principal #789",
        valorCatastral: 5800000,
        superficie: 800,
        ultimoProceso: "MODIFICACION",
    },
    {
        id: "10",
        expedienteId: "5",
        tipo: "mueble",
        categoria: "Mobiliario",
        rppNumero: "RPP-2024-008-A",
        cNumero: "C-008-A",
        nombre: "Mobiliario Centro Comunitario",
        descripcion: "Mobiliario para actividades comunitarias",
        estatus: "en_tramite",
        fechaAlta: "2024-07-15",
        ubicacion: "Col. Villa Bonita, Calle Principal #789",
        valorCatastral: 95000,
        marca: "CommunityFlex",
        modelo: "2024",
        ultimoProceso: "MODIFICACION",
    },
];

// Los procesos y arrays restantes se mantienen igual...
export const procesos: Proceso[] = [
    // ... tus procesos existentes
];

export const categorias = [
    "Terreno",
    "Edificio",
    "Predio",
    "Vehículo",
    "Mobiliario",
    "Equipo",
    "Maquinaria",
];

export const tiposProceso = [
    { value: "alta", label: "Alta" },
    { value: "baja", label: "Baja" },
    { value: "reactivacion", label: "Reactivación" },
    { value: "pi", label: "Por ingresar" },
];

export const actosJuridicos = [
    "Donación",
    "Compra-Venta",
    "Permuta",
    "Expropiación",
    "Escrituración",
    "Actualización Catastral",
    "Desincorporación",
    "Ampliación",
    "Remodelación",
];

// Función auxiliar para obtener bienes por expediente
export function getBienesByExpediente(expedienteId: string): Bien[] {
    return bienes.filter(bien => bien.expedienteId === expedienteId);
}

// Función para obtener un bien por ID
export function getBienById(bienId: string): Bien | undefined {
    return bienes.find(bien => bien.id === bienId);
}

// Función para obtener un expediente por ID
export function getExpedienteById(expedienteId: string): Expediente | undefined {
    return expedientes.find(exp => exp.id === expedienteId);
}