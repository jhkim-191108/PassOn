import { api } from "./client";
import type { Handoff } from "../types/api";

export function getHandoffs(storeId: string) {
    return api<Handoff[]>(`/api/handoffs?storeId=${storeId}`);
}

export function createHandoff(
    storeId: string,
    rawText: string
) {
    return api<Handoff>("/api/handoffs", {
        method: "POST",
        body: JSON.stringify({
            storeId,
            rawText,
        }),
    });
}

export function getHandoff(handoffId: string) {
    return api<Handoff>(
        `/api/handoffs/${handoffId}`
    );
}

export function analyzeHandoff(handoffId: string) {
    return api<Handoff>(
        `/api/handoffs/${handoffId}/analyze`,
        {
            method: "POST",
        }
    );
}

export function confirmHandoff(handoffId: string) {
    return api<Handoff>(
        `/api/handoffs/${handoffId}/confirm`, {
            method: "POST",
        }
    );
}

export function restoreHandoff(handoffId: string) {
    return api<void>(`/api/handoffs/${handoffId}/restore`, {
        method: "POST",
    });
}

export function keepHandoff(handoffId: string) {
    return api<void>(`/api/handoffs/${handoffId}/keep`, {
        method: "POST",
    });
}

export function unkeepHandoff(handoffId: string) {
    return api<void>(`/api/handoffs/${handoffId}/keep`, {
        method: "DELETE",
    });
}