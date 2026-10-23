import { api } from "./client";
import type { Notification } from "../types/api";

export function getNotifications(storeId: string) {
    return api<Notification[]>(
        `/api/stores/${storeId}/notifications`
    );
}

export function readNotification(notificationId: string) {
    return api<Notification>(
        `/api/notifications/${notificationId}/read`,
        {
            method: "POST",
        }
    );
}

export function readAllNotifications(storeId: string) {
    return api<number>(
        `/api/stores/${storeId}/notifications/read-all`,
        {
            method: "POST",
        }
    );
}