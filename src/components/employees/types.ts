import type { StoreRole } from "../../types/api";

// 직원 관리 화면에서만 쓰는 응답 모양. 공통 types/api.ts는 건드리지 않는다.
export interface Team {
    id: string;
    name: string;
    memberCount: number;
}

export interface Member {
    id: string;
    name: string;
    email: string;
    role: StoreRole;
    status: "ACTIVE" | "SUSPENDED" | "LEFT";
    teamId: string | null;
    teamName: string | null;
    leftAt: string | null;
}
