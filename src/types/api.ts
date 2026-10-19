export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export type StoreType =
    | "CAFE"
    | "CONVENIENCE"
    | "STUDY_CAFE"
    | "RESTAURANT"
    | "OTHER";

export type StoreRole =
    | "OWNER"
    | "MANAGER"
    | "STAFF";

export interface Store {
    id: string;
    name: string;
    type: StoreType;
    myRole: StoreRole;
    inviteCode: string | null;
    createdAt: string;
}

export interface ApiErrorBody {
    status: number;
    code: string;
    message: string;
    fields?: Record<string, string>;
}

export type NotificationType =
    | "ASSIGNMENT"
    | "URGENT"
    | "MEMO"
    | "COMPLETED";

export interface Notification {
    id: string;
    storeId: string;
    type: NotificationType;
    handoffId: string | null;
    cardId: string | null;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
}

export type NoticePriority = "NORMAL" | "IMPORTANT" | "URGENT";

export interface Notice {
    id: string;
    storeId: string;
    authorId: string;
    authorName: string;
    title: string;
    body: string;
    pinned: boolean;
    priority: NoticePriority;
    createdAt: string;
    updatedAt: string;
}