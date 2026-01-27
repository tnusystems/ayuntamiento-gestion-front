// Mock data for the government asset management system

export interface Bien {
    id: string;
    tipo: "inmueble" | "mueble";
    categoria: string;
    rppNumero: string;
    cNumero: string;
    nombre: string;
    estatus: "activo" | "baja" | "en_tramite";
    fechaAlta: string;
    ubicacion: string;
    valorCatastral: number;
    ultimoProceso?: string;
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

export const bienes: Bien[] = [
    {
        id: "1",
        tipo: "inmueble",
        categoria: "Terreno",
        rppNumero: "RPP-2024-001",
        cNumero: "C-001",
        nombre: "Terreno Centro Cívico Norte",
        estatus: "activo",
        fechaAlta: "2024-01-15",
        ubicacion: "Col. Centro, Calle Serdán #123",
        valorCatastral: 2500000,
        ultimoProceso: "ALTA",
    },
    {
        id: "2",
        tipo: "inmueble",
        categoria: "Edificio",
        rppNumero: "RPP-2024-002",
        cNumero: "C-002",
        nombre: "Oficinas Administrativas Sur",
        estatus: "activo",
        fechaAlta: "2024-02-20",
        ubicacion: "Col. Villa de Seris, Blvd. Kino #456",
        valorCatastral: 8500000,
        ultimoProceso: "MODIFICACION",
    },
    {
        id: "3",
        tipo: "mueble",
        categoria: "Vehículo",
        rppNumero: "RPP-2024-003",
        cNumero: "C-003",
        nombre: "Camioneta Ford F-150 2023",
        estatus: "activo",
        fechaAlta: "2024-03-10",
        ubicacion: "Parque vehicular municipal",
        valorCatastral: 650000,
        ultimoProceso: "ALTA",
    },
    {
        id: "4",
        tipo: "inmueble",
        categoria: "Predio",
        rppNumero: "RPP-2024-004",
        cNumero: "C-004",
        nombre: "Predio Parque Industrial",
        estatus: "en_tramite",
        fechaAlta: "2024-04-05",
        ubicacion: "Parque Industrial Hermosillo",
        valorCatastral: 12000000,
        ultimoProceso: "REGULARIZACION",
    },
    {
        id: "5",
        tipo: "mueble",
        categoria: "Mobiliario",
        rppNumero: "RPP-2024-005",
        cNumero: "C-005",
        nombre: "Mobiliario Sala de Juntas Principal",
        estatus: "baja",
        fechaAlta: "2023-06-15",
        ubicacion: "Palacio Municipal, Piso 3",
        valorCatastral: 85000,
        ultimoProceso: "BAJA",
    },
    {
        id: "6",
        tipo: "inmueble",
        categoria: "Terreno",
        rppNumero: "RPP-2024-006",
        cNumero: "C-006",
        nombre: "Terreno Reserva Ecológica",
        estatus: "activo",
        fechaAlta: "2024-05-20",
        ubicacion: "Zona Norte, Ejido Los Nogales",
        valorCatastral: 4200000,
        ultimoProceso: "ALTA",
    },
    {
        id: "7",
        tipo: "mueble",
        categoria: "Equipo",
        rppNumero: "RPP-2024-007",
        cNumero: "C-007",
        nombre: "Equipo de Cómputo Dirección General",
        estatus: "activo",
        fechaAlta: "2024-06-01",
        ubicacion: "Palacio Municipal, Piso 2",
        valorCatastral: 320000,
        ultimoProceso: "ALTA",
    },
    {
        id: "8",
        tipo: "inmueble",
        categoria: "Edificio",
        rppNumero: "RPP-2024-008",
        cNumero: "C-008",
        nombre: "Centro Comunitario Villa Bonita",
        estatus: "en_tramite",
        fechaAlta: "2024-07-10",
        ubicacion: "Col. Villa Bonita, Calle Principal #789",
        valorCatastral: 5800000,
        ultimoProceso: "MODIFICACION",
    },
];

export const procesos: Proceso[] = [
    {
        id: "P001",
        bienId: "1",
        tipo: "ALTA",
        actoJuridico: "Donación",
        responsable: "Lic. María González",
        fechaInicio: "2024-01-10",
        fechaFin: "2024-01-15",
        estatus: "aprobado",
        observaciones: "Alta inicial del bien por donación federal",
    },
    {
        id: "P002",
        bienId: "2",
        tipo: "MODIFICACION",
        actoJuridico: "Actualización Catastral",
        responsable: "Ing. Carlos Pérez",
        fechaInicio: "2024-02-15",
        fechaFin: "2024-02-20",
        estatus: "aprobado",
        observaciones: "Actualización de valores catastrales",
    },
    {
        id: "P003",
        bienId: "4",
        tipo: "REGULARIZACION",
        actoJuridico: "Escrituración",
        responsable: "Lic. Ana Martínez",
        fechaInicio: "2024-04-01",
        estatus: "en_revision",
        observaciones: "Proceso de regularización en curso",
    },
    {
        id: "P004",
        bienId: "5",
        tipo: "BAJA",
        actoJuridico: "Desincorporación",
        responsable: "C.P. Roberto Sánchez",
        fechaInicio: "2024-05-01",
        fechaFin: "2024-05-10",
        estatus: "aprobado",
        observaciones: "Baja por deterioro irreparable",
    },
    {
        id: "P005",
        bienId: "8",
        tipo: "MODIFICACION",
        actoJuridico: "Ampliación",
        responsable: "Arq. Laura Vega",
        fechaInicio: "2024-07-05",
        estatus: "borrador",
        observaciones: "Modificación por ampliación de instalaciones",
    },
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
