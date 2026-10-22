import { API_URL, api, getAccessToken } from "./client";
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

export async function changePassword(currentPassword: string, newPassword: string) {
    await api<void>("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function uploadMyPhoto(file: File) {
    const body = new FormData();
    body.append("file", file);
    return api<User>("/api/users/me/photo", {
        method: "POST",
        body,
    });
}

export async function loadMyPhoto() {
    const token = getAccessToken();
    const response = await fetch(`${API_URL}/api/users/me/photo`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
    });
    if (response.status === 404 || !response.ok) return null;
    return response.blob();
}