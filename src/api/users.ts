import { api } from "./client";
import type { User } from "../types/api";

export function getMe() {
    return api<User>("/api/users/me");
}