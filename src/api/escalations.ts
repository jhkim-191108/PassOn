import { api } from "./client";
import type { Escalation, EscalationPriority } from "../types/api";

export function listEscalations(storeId: string) {
    return api<Escalation[]>(`/api/stores/${storeId}/escalations`);
}

export function createEscalation(cardId: string, priority: EscalationPriority) {
    return api<Escalation>(`/api/cards/${cardId}/escalations`, {
        method: "POST",
        body: JSON.stringify({ priority }),
    });
}

export function cancelEscalation(cardId: string) {
    return api<void>(`/api/cards/${cardId}/escalations`, {
        method: "DELETE",
    });
}

export function resolveEscalation(cardId: string) {
    return api<Escalation>(`/api/cards/${cardId}/escalations/resolve`, {
        method: "POST",
    });
}
