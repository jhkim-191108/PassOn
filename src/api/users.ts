import { ApiError, api, apiBlob } from "./client";
import type { NotificationSettings, User } from "../types/api";

export function getMe() {
    return api<User>("/api/users/me");
}

export function updateMe(name: string) {
    return api<User>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name }),
    });
}

export function getNotificationSettings() {
    return api<NotificationSettings>("/api/users/me/notification-settings");
}

export function updateNotificationSettings(settings: Partial<NotificationSettings>) {
    return api<NotificationSettings>("/api/users/me/notification-settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
    });
}

// 비밀번호 변경
export async function changePassword(currentPassword: string, newPassword: string) {
    await api<void>("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

// 프로필 사진 업로드
export async function uploadMyPhoto(file: File) {
    const body = new FormData();
    body.append("file", file);
    return api<User>("/api/users/me/photo", {
        method: "POST",
        body,
    });
}

// 내 프로필 사진. 사진이 없으면 null
export async function loadMyPhoto() {
    try {
        return await apiBlob("/api/users/me/photo", { cache: "no-store" });
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}