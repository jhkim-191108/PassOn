import { api } from "./client";
import type { Card } from "../types/api";

export function getHandoffCards(handoffId: string) {
    return api<Card[]>(
        `/api/handoffs/${handoffId}/cards`
    );
}