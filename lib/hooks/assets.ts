import useSWR, { type KeyedMutator } from "swr";

import { fetchAsset } from "@/lib/api/assets";
import type { BienApi } from "@/types";

type UseGetAssetByIdResult = {
    asset: BienApi | null;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    mutate: KeyedMutator<BienApi | null>;
};

export default function useGetAssetByID(
    assetId?: string | number,
): UseGetAssetByIdResult {
    const shouldFetch = !!assetId;
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? ["asset", assetId] : null,
        () => fetchAsset(assetId as string | number),
    );

    return {
        asset: data ?? null,
        isLoading: !!assetId && isLoading,
        isError: !!error,
        error,
        mutate,
    };
}
