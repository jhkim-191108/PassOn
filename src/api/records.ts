import { api } from "./client";
import type { RecordEntry } from "../types/api";

// 기록 목록
export function listRecords(storeId: string, query: { q?: string; from?: string; to?: string }) {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.from) params.set("from", query.from);
    if (query.to) params.set("to", query.to);
    const search = params.toString();
    return api<RecordEntry[]>(`/api/stores/${storeId}/records${search ? `?${search}` : ""}`);
}
