// Figma types.ts의 근무표 · 직원 · 근무조 타입과 동일한 형태
// TODO: 팀 공용 타입 위치가 정해지면 이동 (직원 관리 담당과 StaffMember · StoreTeam 공유)
import type { ShiftType, UserRole } from '@/features/auth';

export type { ShiftType };

/** 하루의 한 근무 시간대 (예: 10/12 오전 08:00~14:00, 근무자 2명) */
export interface ShiftSlot {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  shiftType: ShiftType;
  staffIds: string[];
  staffNames: string[];
  startTime: string;
  endTime: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shifts: ShiftType[];
  teamId: string | null;
  teamName: string | null;
  isActive: boolean;
  joinedAt: string;
  departedAt: string | null;
}

/** 근무조 (예: 오전팀, 마감팀) */
export interface StoreTeam {
  id: string;
  storeId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface GetScheduleRequest {
  storeId: string;
  /** YYYY-MM-DD (포함) */
  from: string;
  /** YYYY-MM-DD (포함) */
  to: string;
}

export interface StaffDirectory {
  staff: StaffMember[];
  teams: StoreTeam[];
}
