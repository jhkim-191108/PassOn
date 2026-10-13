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