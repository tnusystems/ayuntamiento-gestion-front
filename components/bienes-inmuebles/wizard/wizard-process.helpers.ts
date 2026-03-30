export type SubmitStage = "idle" | "creating" | "uploading" | "done" | "error";
export type ProcessStepStatus = "pending" | "loading" | "completed";

export type Step1Errors = {
    tipoProceso?: string;
    actoJuridico?: string;
    responsable?: string;
    observaciones?: string;
    antecedente?: string;
};

export type Step2Errors = {
    zona?: string;
    dominio?: string;
    stageDefinition?: string;
    operacionU?: string;
    verificationStatus?: string;
};

export type WizardDocumentFile = {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    file: File;
};

export type WizardDocumentGroup = {
    docTypeId: string;
    docTypeLabel: string;
    files: WizardDocumentFile[];
};

export type WizardFormData = {
    tipoProceso: string;
    actoJuridico: string;
    responsable: string;
    observaciones: string;
    rppNumber: string;
    claveCatastral: string;
    hasAntecedente: boolean;
    antecedenteRpp: string;
    antecedenteAssetId: string;
    antecedenteRegistryId: string;
    antecedenteRegistryName: string;
    colonia: string;
    calle: string;
    numero: string;
    lote: string;
    manzana: string;
    superficieTerreno: string;
    superficieConstruccion: string;
    zona: string;
    dominio: string;
    stageDefinition: string;
    operacionU: string;
    verificationStatus: string;
    verificationDocument: WizardDocumentFile | null;
    valorCatastral: string;
    valorComercial: string;
    lat: string;
    alt: string;
    observacionesTecnicas: string;
    documentos: string[];
    documentosDetalle: WizardDocumentGroup[];
};

export const documentKindMap: Record<string, string> = {
    escritura: "es_publica",
    fotos: "foto_bien",
    plano: "catastro_plano",
    oficio: "solicitud",
    certificado: "certificado",
    avaluo: "avaluo",
    extraordinario: "extraordinario",
    otro: "extraordinario",
};

const antecedenteFields: Array<keyof WizardFormData> = [
    "hasAntecedente",
    "antecedenteRpp",
    "antecedenteAssetId",
    "antecedenteRegistryId",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === "object";

const toNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
        return 0;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
};

const toInteger = (value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 0;
    }
    return Math.trunc(parsed);
};

const toStringValue = (value: unknown) => {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).trim();
};

const toPositiveInteger = (value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    const integer = Math.trunc(parsed);
    return integer > 0 ? integer : null;
};

export const createInitialFormData = (tipoProceso = ""): WizardFormData => ({
    tipoProceso,
    actoJuridico: "",
    responsable: "",
    observaciones: "",
    rppNumber: "",
    claveCatastral: "",
    hasAntecedente: false,
    antecedenteRpp: "",
    antecedenteAssetId: "",
    antecedenteRegistryId: "",
    antecedenteRegistryName: "",
    colonia: "",
    calle: "",
    numero: "",
    lote: "",
    manzana: "",
    superficieTerreno: "",
    superficieConstruccion: "",
    zona: "",
    dominio: "",
    stageDefinition: "",
    operacionU: "",
    verificationStatus: "",
    verificationDocument: null,
    valorCatastral: "",
    valorComercial: "",
    lat: "",
    alt: "",
    observacionesTecnicas: "",
    documentos: [],
    documentosDetalle: [],
});

export const clearStep1ErrorsOnUpdate = (
    previousErrors: Step1Errors,
    data: Partial<WizardFormData>,
): Step1Errors => {
    const nextErrors = { ...previousErrors };

    if ("tipoProceso" in data) {
        delete nextErrors.tipoProceso;
    }
    if ("actoJuridico" in data) {
        delete nextErrors.actoJuridico;
    }
    if ("responsable" in data) {
        delete nextErrors.responsable;
    }
    if ("observaciones" in data) {
        delete nextErrors.observaciones;
    }
    if (antecedenteFields.some((field) => field in data)) {
        delete nextErrors.antecedente;
    }

    return nextErrors;
};

export const clearStep2ErrorsOnUpdate = (
    previousErrors: Step2Errors,
    data: Partial<WizardFormData>,
): Step2Errors => {
    const nextErrors = { ...previousErrors };

    if ("zona" in data) {
        delete nextErrors.zona;
    }
    if ("dominio" in data) {
        delete nextErrors.dominio;
    }
    if ("stageDefinition" in data) {
        delete nextErrors.stageDefinition;
    }
    if ("operacionU" in data) {
        delete nextErrors.operacionU;
    }
    if ("verificationStatus" in data) {
        delete nextErrors.verificationStatus;
    }

    return nextErrors;
};

export const validateStep1 = (formData: WizardFormData): Step1Errors => {
    const errors: Step1Errors = {};

    if (!formData.tipoProceso) {
        errors.tipoProceso = "Selecciona un tipo de proceso.";
    }
    if (!formData.actoJuridico || formData.actoJuridico === "__empty") {
        errors.actoJuridico = "Selecciona un acto jurídico.";
    }
    if (!formData.responsable.trim()) {
        errors.responsable = "Ingresa el nombre del responsable.";
    }
    if (!formData.observaciones.trim()) {
        errors.observaciones = "Agrega una nota para el proceso.";
    }
    if (
        formData.hasAntecedente &&
        !formData.antecedenteAssetId.trim() &&
        !formData.antecedenteRegistryId.trim()
    ) {
        errors.antecedente =
            "Busca y selecciona un antecedente por RPP para continuar.";
    }

    return errors;
};

export const validateStep2 = (formData: WizardFormData): Step2Errors => {
    const errors: Step2Errors = {};

    if (!formData.zona.trim()) {
        errors.zona = "Selecciona una zona.";
    }
    if (!formData.dominio.trim()) {
        errors.dominio = "Selecciona un dominio.";
    }
    if (!formData.stageDefinition.trim()) {
        errors.stageDefinition = "Selecciona una etapa del trámite.";
    }
    if (!formData.operacionU.trim()) {
        errors.operacionU = "Selecciona un destino.";
    }
    if (!formData.verificationStatus.trim()) {
        errors.verificationStatus = "Selecciona un estado de verificación.";
    }

    return errors;
};

export const countDocuments = (documents: WizardDocumentGroup[]) =>
    documents.reduce((accumulator, group) => accumulator + group.files.length, 0);

export const resolveRegistryIds = ({
    bienId,
    antecedenteRegistryId,
    hasAntecedente,
}: {
    bienId?: string;
    antecedenteRegistryId: string;
    hasAntecedente: boolean;
}) => {
    const fromParam = toPositiveInteger(bienId);
    const fromAntecedente = toPositiveInteger(antecedenteRegistryId);

    const newRegistryId = fromParam ?? 0;
    const oldRegistryId = fromAntecedente ?? 0;
    const resolvedRegistryId = fromParam ?? (hasAntecedente ? oldRegistryId : 0);

    return {
        newRegistryId,
        oldRegistryId,
        resolvedRegistryId,
    };
};

export const buildNewAssetForReassign = ({
    formData,
    registryId,
    now,
}: {
    formData: WizardFormData;
    registryId: number;
    now: string;
}) => ({
    registry_id: registryId,
    rpp_number: formData.rppNumber.trim(),
    c_number: formData.claveCatastral.trim(),
    operation_type_id: toInteger(formData.actoJuridico),
    zone_id: toInteger(formData.zona),
    domain_id: toInteger(formData.dominio),
    stage_definition_id: toInteger(formData.stageDefinition),
    land_use_id: toInteger(formData.operacionU),
    lot: formData.lote.trim(),
    block: formData.manzana.trim(),
    colony: formData.colonia.trim(),
    street: formData.calle.trim(),
    owner_name: formData.responsable.trim(),
    total_area: toNumber(formData.superficieTerreno),
    built_area: toNumber(formData.superficieConstruccion),
    cadastral_value: toNumber(formData.valorCatastral),
    commercial_value: toNumber(formData.valorComercial),
    latitude: toNumber(formData.lat),
    longitude: toNumber(formData.alt),
    inventory_status: "active",
    registry_date: now,
    registry_section: "",
    registry_volume: "",
});

export const buildCreateAssetPayload = ({
    formData,
    registryId,
    now,
}: {
    formData: WizardFormData;
    registryId: number;
    now: string;
}) => ({
    rpp_number: formData.rppNumber.trim(),
    c_number: formData.claveCatastral.trim(),
    lot: formData.lote.trim(),
    block: formData.manzana.trim(),
    colony: formData.colonia.trim(),
    street: formData.calle.trim(),
    zone_id: formData.zona.trim(),
    domain_id: formData.dominio.trim(),
    stage_definition_id: formData.stageDefinition.trim(),
    land_use_id: formData.operacionU.trim(),
    verification_status_id: formData.verificationStatus.trim(),
    operation_type: formData.actoJuridico.trim(),
    total_area: toNumber(formData.superficieTerreno),
    built_area: toNumber(formData.superficieConstruccion),
    cadastral_value: toNumber(formData.valorCatastral),
    commercial_value: toNumber(formData.valorComercial),
    latitude: toNumber(formData.lat),
    longitude: toNumber(formData.alt),
    inventory_status: "active" as const,
    owner_name: formData.responsable.trim(),
    registry_date: now,
    registry_section: "",
    registry_volume: "",
    operation_type_id: toNumber(formData.actoJuridico),
    registry_id: registryId,
    created_at: now,
    updated_at: now,
    category: {},
    location: {},
});

const getNestedId = (source: Record<string, unknown>, relationKey: string) => {
    const relation = source[relationKey];
    if (!isRecord(relation)) {
        return 0;
    }
    return toInteger(relation.id);
};

export const buildOldAssetForReassign = ({
    oldAssetData,
    oldRegistryId,
    fallbackRpp,
    now,
}: {
    oldAssetData: Record<string, unknown>;
    oldRegistryId: number;
    fallbackRpp: string;
    now: string;
}) => ({
    registry_id: toInteger(oldAssetData.registry_id) || oldRegistryId,
    rpp_number: toStringValue(oldAssetData.rpp_number) || fallbackRpp,
    c_number: toStringValue(oldAssetData.c_number),
    operation_type_id:
        toInteger(oldAssetData.operation_type_id) ||
        getNestedId(oldAssetData, "operation_type"),
    zone_id: toInteger(oldAssetData.zone_id) || getNestedId(oldAssetData, "zone"),
    domain_id:
        toInteger(oldAssetData.domain_id) || getNestedId(oldAssetData, "domain"),
    stage_definition_id:
        toInteger(oldAssetData.stage_definition_id) ||
        getNestedId(oldAssetData, "stage_definition"),
    land_use_id:
        toInteger(oldAssetData.land_use_id) ||
        getNestedId(oldAssetData, "land_use"),
    lot: toStringValue(oldAssetData.lot),
    block: toStringValue(oldAssetData.block),
    colony: toStringValue(oldAssetData.colony),
    street: toStringValue(oldAssetData.street),
    owner_name: toStringValue(oldAssetData.owner_name),
    total_area: toNumber(toStringValue(oldAssetData.total_area)),
    built_area: toNumber(toStringValue(oldAssetData.built_area)),
    cadastral_value: toNumber(toStringValue(oldAssetData.cadastral_value)),
    commercial_value: toNumber(toStringValue(oldAssetData.commercial_value)),
    latitude: toNumber(toStringValue(oldAssetData.latitude)),
    longitude: toNumber(toStringValue(oldAssetData.longitude)),
    inventory_status: toStringValue(oldAssetData.inventory_status) || "active",
    registry_date: toStringValue(oldAssetData.registry_date) || now,
    registry_section: toStringValue(oldAssetData.registry_section),
    registry_volume: toStringValue(oldAssetData.registry_volume),
});

export type ApprovalResponse = {
    message?: string;
    approval_request: {
        id?: number;
    };
};

export const getApprovalResponse = (
    response: unknown,
): ApprovalResponse | null => {
    if (!isRecord(response)) {
        return null;
    }

    const approvalRequest = response.approval_request;
    if (!isRecord(approvalRequest)) {
        return null;
    }

    return {
        message:
            typeof response.message === "string" ? response.message : undefined,
        approval_request: {
            id: toPositiveInteger(approvalRequest.id) ?? undefined,
        },
    };
};

export const extractAssetIdFromResponse = (response: unknown) => {
    if (!isRecord(response)) {
        return null;
    }

    const directId = toPositiveInteger(response.id);
    if (directId) {
        return directId;
    }

    const nestedCandidates = [
        response.new_asset,
        response.replacement_asset,
        response.asset,
    ];
    for (const candidate of nestedCandidates) {
        if (!isRecord(candidate)) {
            continue;
        }

        const nestedId = toPositiveInteger(candidate.id);
        if (nestedId) {
            return nestedId;
        }
    }

    return null;
};
