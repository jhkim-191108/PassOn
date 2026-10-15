import type { StoreRole } from "@/types/api";

// 직원관리 화면에서만 쓰는 응답 모양. 공통 types/api.ts는 건드리지 않는다.
// status: ACTIVE 근무 중, SUSPENDED 정지(목록에는 보이지만 수정 불가), LEFT 퇴사.
export interface Team {
    id: string;
    name: string;
    memberCount: number;
}

export interface Member {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: StoreRole;
    status: "ACTIVE" | "SUSPENDED" | "LEFT";
    teamId: string | null;
    teamName: string | null;
    leftAt: string | null;
}
