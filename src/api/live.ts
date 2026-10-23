import { ApiError, API_URL, api, getAccessToken } from "./client";
import type { ShiftResponse } from "@/features/schedule/types";
import type { Card, Notification, NotificationType } from "../types/api";

const NOTIFICATION_TYPES: NotificationType[] = ["ASSIGNMENT", "URGENT", "MEMO", "COMPLETED"];
const SHIFT_SLOTS = ["MORNING", "AFTERNOON", "CLOSE"] as const;

export type LiveMessage =
    | { type: "ready" }
    | { type: "notification"; notification: Notification }
    | { type: "cards"; cards: Card[] }
    | { type: "shifts"; shifts: ShiftResponse[] };

function today() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readNotification(value: unknown): Notification | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.body !== "string") return null;
    if (typeof value.read !== "boolean" || typeof value.createdAt !== "string") return null;
    if (typeof value.type !== "string" || !NOTIFICATION_TYPES.includes(value.type as NotificationType)) return null;
    return value as unknown as Notification;
}

function readCard(value: unknown): Card | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.createdAt !== "string") return null;
    if (typeof value.type !== "string" || typeof value.urgency !== "string" || typeof value.progress !== "string") return null;
    return value as unknown as Card;
}

function readShift(value: unknown): ShiftResponse | null {
    if (!isRecord(value)) return null;
    if (typeof value.id !== "string" || typeof value.memberId !== "string" || typeof value.memberName !== "string") return null;
    if (typeof value.workDate !== "string") return null;
    if (typeof value.slot !== "string" || !SHIFT_SLOTS.includes(value.slot as (typeof SHIFT_SLOTS)[number])) return null;
    return {
        id: value.id,
        storeId: typeof value.storeId === "string" ? value.storeId : "",
        memberId: value.memberId,
        memberName: value.memberName,
        workDate: value.workDate,
        slot: value.slot as ShiftResponse["slot"],
        createdAt: typeof value.createdAt === "string" ? value.createdAt : "",
    };
}

function readMessage(value: unknown): LiveMessage | null {
    if (!isRecord(value) || typeof value.type !== "string") return null;
    if (value.type === "ready") return { type: "ready" };
    if (value.type === "notification") {
        const notification = readNotification(value.notification);
        return notification ? { type: "notification", notification } : null;
    }
    if (value.type === "cards") {
        if (!Array.isArray(value.cards)) return null;
        const cards: Card[] = [];
        for (const item of value.cards) {
            const card = readCard(item);
            if (!card) return null;
            cards.push(card);
        }
        return { type: "cards", cards };
    }
    if (value.type === "shifts") {
        if (!Array.isArray(value.shifts)) return null;
        const shifts: ShiftResponse[] = [];
        for (const item of value.shifts) {
            const shift = readShift(item);
            if (!shift) return null;
            shifts.push(shift);
        }
        return { type: "shifts", shifts };
    }
    return null;
}

export async function loadStorePanel(storeId: string) {
    const day = today();
    const [cards, shifts] = await Promise.all([
        api<Card[]>(`/api/stores/${storeId}/open-cards`),
        api<ShiftResponse[]>(`/api/stores/${storeId}/shifts?from=${day}&to=${day}`),
    ]);
    return { cards, shifts };
}

export async function loadTodayShifts(storeId: string) {
    const day = today();
    return api<ShiftResponse[]>(`/api/stores/${storeId}/shifts?from=${day}&to=${day}`);
}

function socketUrl(storeId: string, ticket: string) {
    const url = new URL(API_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.search = "";
    url.searchParams.set("ticket", ticket);
    url.searchParams.set("storeId", storeId);
    return url.toString();
}

/** 매장 실시간 연결. 끊기면 다시 붙고, 반환한 함수를 호출하면 멈춘다. */
export function openStoreSocket(storeId: string, onMessage: (message: LiveMessage) => void) {
    let stopped = false;
    let socket: WebSocket | null = null;
    let retry = 0;

    const connect = async () => {
        if (stopped) return;
        try {
            const issued = await api<{ ticket: string }>("/api/auth/ws-ticket", {
                method: "POST",
                body: JSON.stringify({ storeId }),
            });
            if (stopped) return;
            const ws = new WebSocket(socketUrl(storeId, issued.ticket));
            socket = ws;
            ws.onmessage = (event) => {
                if (typeof event.data !== "string") return;
                try {
                    const message = readMessage(JSON.parse(event.data) as unknown);
                    if (message) onMessage(message);
                } catch {
                    // 형식이 다른 메시지는 패널을 건드리지 않는다.
                }
            };
            ws.onclose = () => {
                if (socket === ws) socket = null;
                if (stopped) return;
                retry = window.setTimeout(() => {
                    void connect();
                }, 3000);
            };
        } catch (error: unknown) {
            if (stopped) return;
            if (!getAccessToken()) return;
            if (error instanceof ApiError && (error.status === 401 || error.status === 403 || error.status === 404)) return;
            retry = window.setTimeout(() => {
                void connect();
            }, 3000);
        }
    };

    void connect();

    return () => {
        stopped = true;
        window.clearTimeout(retry);
        socket?.close();
    };
}
