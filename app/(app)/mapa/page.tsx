import MapaClient from "./mapa-client";

export default async function MapaPage({
    searchParams,
}: {
    searchParams: Promise<{ registry_id?: string; asset_id?: string }>;
}) {
    const params = await searchParams;
    const { registry_id, asset_id } = params;
    console.log(registry_id, asset_id);
    return (
        <MapaClient
            initialRegistryId={params.registry_id ?? null}
            initialAssetId={params.asset_id ?? null}
        />
    );
}
