import { z } from "zod";

const idSchema = z.union([z.string(), z.number()]);

export const RolSchema = z
  .object({
    id: z.number().int(),
    name: z.string().min(1),
    key: z.string().min(1).optional(),
    description: z.string().optional(),
  })
  .passthrough();

export type Rol = z.infer<typeof RolSchema>;

export const UbicacionSchema = z
  .object({
    id: z.number().int().optional(),
    name: z.string().min(1).optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .passthrough();

export type Ubicacion = z.infer<typeof UbicacionSchema>;

export const UbicacionFormSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type UbicacionFormValues = z.infer<typeof UbicacionFormSchema>;

export const UsuarioSchema = z
  .object({
    id: z.number().int(),
    email: z.string(),
    name: z.string().nullable().optional(),
    role: z.union([z.string(), RolSchema]).optional(),
  })
  .passthrough();

export type Usuario = z.infer<typeof UsuarioSchema>;

export const UsuarioFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional(),
  roleId: z.number().int().optional(),
});

export type UsuarioFormValues = z.infer<typeof UsuarioFormSchema>;

export const BienSchema = z
  .object({
    id: idSchema,
    clave: z.string().optional(),
    descripcion: z.string().optional(),
    nombre: z.string().optional(),
    rpp: z.string().optional(),
    claveCatastral: z.string().optional(),
    ubicacion: z.union([UbicacionSchema, z.string()]).optional(),
    estado: z.enum(["Activo", "Inactivo"]).optional(),
    fecha: z.string().optional(),
    responsable: z.string().optional(),
  })
  .passthrough();

export type Bien = z.infer<typeof BienSchema>;

export const BienApiSchema = z
  .object({
    id: z.number().int(),
    rpp_number: z.string(),
    c_number: z.string(),
    description: z.string().optional(),
    inventory_status: z.enum(["active", "maintenance", "baja"]).optional(),
    category: z.record(z.string(), z.unknown()).optional(),
    location: UbicacionSchema.optional(),
    operation_type_id: z.number().int().optional(),
    operation_type_name: z.string().optional(),
  })
  .passthrough();

export type BienApi = z.infer<typeof BienApiSchema>;

export const BienFormSchema = z.object({
  operation: z.string().optional(),
  dateFilter: z.string().optional(),
  registroNumero: z.string().min(1, "Numero requerido"),
  registroVolumen: z.string().optional(),
  registroSeccion: z.string().optional(),
  registroFecha: z.string().optional(),
  escriturasNumero: z.string().min(1, "Numero requerido"),
  escriturasNotaria: z.string().optional(),
  escriturasFecha: z.string().optional(),
  boletinNumero: z.string().optional(),
  boletinVolumen: z.string().optional(),
  boletinFecha: z.string().optional(),
  convenioNumero: z.string().optional(),
  convenioVolumen: z.string().optional(),
  convenioFecha: z.string().optional(),
  nombre: z.string().min(1, "Nombre requerido"),
  antecedente: z.string().optional(),
});

export type BienFormValues = z.infer<typeof BienFormSchema>;

const archivoFileSchema = z
  .object({
    filename: z.string(),
    content_type: z.string(),
    byte_size: z.number().int(),
    url: z.string(),
    download_url: z.string().optional(),
  })
  .passthrough();

const archivoDocumentTypeSchema = z
  .object({
    id: z.number().int(),
    kind: z.string(),
    name: z.string(),
  })
  .passthrough();

export const ArchivoApiSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    document_type: archivoDocumentTypeSchema.optional(),
    position: z.number().int().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    file: archivoFileSchema.nullable().optional(),
    image: z.boolean().optional(),
  })
  .passthrough();

export type ArchivoApi = z.infer<typeof ArchivoApiSchema>;

export const ArchivoSchema = z
  .object({
    id: idSchema,
    nombre: z.string(),
    tipo: z.string().optional(),
    fecha: z.string().optional(),
    tamano: z.string().optional(),
    usuario: z.string().optional(),
    departamento: z.string().optional(),
  })
  .passthrough();

export type Archivo = z.infer<typeof ArchivoSchema>;

export const ArchivoFormSchema = z.object({
  file: z
    .custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
      "Archivo invalido"
    )
    .optional(),
  name: z.string().optional(),
  documentTypeId: z.number().int().optional(),
  bienId: idSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ArchivoFormValues = z.infer<typeof ArchivoFormSchema>;

export const RolListSchema = z.array(RolSchema);
export const UbicacionListSchema = z.array(UbicacionSchema);
export const UsuarioListSchema = z.array(UsuarioSchema);
export const BienListSchema = z.array(BienSchema);
export const BienApiListSchema = z.array(BienApiSchema);
export const ArchivoApiListSchema = z.array(ArchivoApiSchema);
