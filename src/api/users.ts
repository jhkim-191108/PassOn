import { api } from "./client";
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