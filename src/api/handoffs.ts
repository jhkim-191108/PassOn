import { api } from "./client";
import type { Handoff } from "../types/api"; 

export function creatHandoff(
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
        `api/handoffs/${handoffId}`
    );
}

export function analtzHandoff(handoffId: string) {
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