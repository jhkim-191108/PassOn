import { clearCurrentStore } from "@/features/stores/currentStore";
import{ api, clearAccessToken } from "./client"

export async function logout() {
    try {
        await api<void>("/api/auth/logout", {
            method: "POST",
        });
    } finally {
        clearAccessToken();
        clearCurrentStore();
    }
}