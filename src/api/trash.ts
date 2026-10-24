import { api } from "./client";
import type { TrashItem } from "@/types/api";

export function getTrash(storeId: string) {
    return api<TrashItem[]>(
        `/api/stores/${storeId}/trash`
    );
}