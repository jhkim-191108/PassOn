import { api } from "./client";
import type { Store } from "../types/api";

export function getStores() {
    return api<Store[]>("/api/stores");
}