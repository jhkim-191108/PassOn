import { api } from "./client";
import type { Card, UpdateCardRequest, } from "../types/api";

export function getHandoffCards(handoffId: string) {
    return api<Card[]>(
        `/api/handoffs/${handoffId}/cards`
    );
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