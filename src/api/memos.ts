import { api } from "./client";
import type { MemoView } from "../types/api";

export function getCardMemos(cardId: string) {
    return api<MemoView[]>(
        `/api/cards/${cardId}/memos`
    );
}

export function createCardMemo(
    cardId: string,
    body: string
) {
    return api<MemoView>(
        `/api/cards/${cardId}/memos`,
        {
            method: "POST",
            body: JSON.stringify({
                body,
            }),
        }
    );
}