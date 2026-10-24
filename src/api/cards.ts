import { api } from "./client";
import type { Card, UpdateCardRequest, } from "../types/api";

export function getHandoffCards(handoffId: string) {
    return api<Card[]>(
        `/api/handoffs/${handoffId}/cards`
    );
}

export function getOpenCards(storeId: string) {
    return api<Card[]>(`/api/stores/${storeId}/open-cards`);
}

export function getCard(cardId: string) {
    return api<Card>(`/api/cards/${cardId}`);
}

export function updateCard(
    cardId: string,
    data: UpdateCardRequest
) {
    return api<Card>(
        `/api/cards/${cardId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        }
    );
}

export function deleteCard(cardId: string) {
    return api<void>(
        `/api/cards/${cardId}`,
        {
            method: "DELETE",
        }
    );
}

export function restoreCard(cardId: string) {
    return api<void>(`/api/cards/${cardId}/restore`, {
        method: "POST",
    });
}

export function keepCard(cardId: string) {
    return api<void>(`/api/cards/${cardId}/keep`, {
        method: "POST",
    });
}

export function unkeepCard(cardId: string) {
    return api<void>(`/api/cards/${cardId}/keep`, {
        method: "DELETE",
    });
}

export function acknowledgeCard(cardId: string) {
    return api<Card>(`/api/cards/${cardId}/acknowledge`, {
        method: "PATCH",
    });
}

export function unacknowledgeCard(cardId: string) {
    return api<Card>(`/api/cards/${cardId}/unacknowledge`, {
        method: "PATCH",
    });
}

export function completeCard(cardId: string) {
    return api<Card>(`/api/cards/${cardId}/complete`, {
        method: "PATCH",
    });
}

export function reopenCard(cardId: string) {
    return api<Card>(`/api/cards/${cardId}/reopen`, {
        method: "PATCH",
    });
}