import { api } from "./client";
import type { Notice, NoticePriority } from "../types/api";

export interface NoticeInput {
    title: string;
    body: string;
    pinned: boolean;
    priority: NoticePriority;
}

export function getNotices(storeId: string) {
    return api<Notice[]>(`/api/stores/${storeId}/notices`);
}

export function createNotice(storeId: string, input: NoticeInput) {
    return api<Notice>(`/api/stores/${storeId}/notices`, {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateNotice(storeId: string, noticeId: string, input: NoticeInput) {
    return api<Notice>(`/api/stores/${storeId}/notices/${noticeId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export function deleteNotice(storeId: string, noticeId: string) {
    return api<void>(`/api/stores/${storeId}/notices/${noticeId}`, {
        method: "DELETE",
    });
}
