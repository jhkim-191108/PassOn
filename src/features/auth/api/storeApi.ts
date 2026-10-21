import { api } from "@/api/client";
import type { Store } from "@/types/api";
import type {
    CreateStoreRequest,
    CreateStoreResponse,
    JoinStoreRequest,
    JoinStoreResponse,
} from "../types";

export const storeApi = {
    async createStore(values: CreateStoreRequest): Promise<CreateStoreResponse> {
        const store = await api<Store>("/api/stores", {
            method: "POST",
            body: JSON.stringify({ name: values.name, type: values.type }),
        });
        return {
            storeId: store.id,
            storeName: store.name,
            inviteCode: store.inviteCode ?? "",
            inviteToken: store.inviteCode ?? "",
        };
    },

    async joinStore(values: JoinStoreRequest): Promise<JoinStoreResponse> {
        const code = values.code.trim().toUpperCase();
        const store = await api<Store>("/api/stores/join", {
            method: "POST",
            body: JSON.stringify({ code, role: "STAFF" }),
        });
        return { storeId: store.id, storeName: store.name };
    },
};
