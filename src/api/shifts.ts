import { api } from "./client";
import type { ShiftResponse, WorkSlot } from "@/features/schedule/types";

export function createShift(
    storeId: string,
    body: { memberId: string; workDate: string; slot: WorkSlot },
) {
    return api<ShiftResponse>(`/api/stores/${storeId}/shifts`, {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export function deleteShift(storeId: string, shiftId: string) {
    return api<void>(`/api/stores/${storeId}/shifts/${shiftId}`, {
        method: "DELETE",
    });
}
