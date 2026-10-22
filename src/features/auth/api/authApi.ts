import { api, ApiError, setAccessToken } from "@/api/client";
import { pickStore } from "@/features/stores/currentStore";
import type { AuthResponse, Store } from "@/types/api";
import type { AppUser, LoginRequest, LoginResponse, SignupRequest } from "../types";

async function toSession(data: AuthResponse): Promise<LoginResponse> {
    setAccessToken(data.accessToken);
    const stores = await api<Store[]>("/api/stores");
    const memberships = stores.map((store) => ({
        storeId: store.id,
        storeName: store.name,
        role: store.myRole,
        shifts: [],
        isActive: true,
        joinedAt: store.createdAt,
    }));

    const user: AppUser = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        currentStoreId: pickStore(stores)?.id ?? "",
        memberships,
    };

    return { user, accessToken: data.accessToken };
}

export const authApi = {
    async login(values: LoginRequest) {
        const data = await api<AuthResponse>("/api/auth/login", {
            method: "POST",
            auth: false,
            body: JSON.stringify(values),
        });
        return toSession(data);
    },

    async emailAvailable(email: string) {
        try {
            await api<void>("/api/auth/email-check", {
                method: "POST",
                auth: false,
                body: JSON.stringify({ email }),
            });
            return true;
        } catch (error) {
            if (error instanceof ApiError && error.status === 409) return false;
            throw error;
        }
    },

    async signup(values: SignupRequest) {
        const data = await api<AuthResponse>("/api/auth/signup", {
            method: "POST",
            auth: false,
            body: JSON.stringify(values),
        });
        return toSession(data);
    },

    loginAsDemo(): Promise<LoginResponse> {
        return Promise.reject(new Error("데모 체험은 사용할 수 없습니다."));
    },
};
