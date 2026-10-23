import type { StoreRole, StoreType } from "@/types/api";

export const TYPE_LABEL: Record<StoreType, string> = {
    CAFE: "카페",
    CONVENIENCE: "편의점",
    STUDY_CAFE: "스터디카페",
    RESTAURANT: "레스토랑",
    OTHER: "기타",
};

export const ROLE_BADGE: Record<StoreRole, string> = {
    OWNER: "Owner",
    MANAGER: "Manager",
    STAFF: "Staff",
};
