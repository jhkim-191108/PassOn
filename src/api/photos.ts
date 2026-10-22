import { api, apiBlob } from "./client";
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

export function getHandoffPhotos(
    handoffId: string
) {
    return api<Photo[]>(
        `/api/handoffs/${handoffId}/photos`
    );
}

export function getPhotoFile(
    handoffId: string,
    photoId: string
) {
    return apiBlob(
        `/api/handoffs/${handoffId}/photos/${photoId}`
    );
}