import { api } from "./client";
import type { Photo } from "@/types/api";

export function uploadPhoto(
    handoffId: string,
    file: File
) {
    const formData = new FormData();

    formData.append("file", file);

    return api<Photo>(
        `/api/handoffs/${handoffId}/photos`,
        {
            method: "POST",
            body: formData,
        }
    );
}