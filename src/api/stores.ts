import { api } from "./client";
import type { Store } from "../types/api";

export function getStores() {
    return api<Store[]>("/api/stores");
}

export function updateStore(storeId: string, name: string) {
    return api<Store>(`/api/stores/${storeId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
}

export function deleteStore(storeId: string) {
    return api<void>(`/api/stores/${storeId}`, {
        method: "DELETE",
    });
}