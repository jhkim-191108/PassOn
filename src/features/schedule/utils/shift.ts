import type { ComponentProps } from 'react';

// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import type Badge from '@/components/ui/Badge';
import type { Member } from '@/features/employees';
import type { UserRole } from '@/features/auth';

import type { ShiftResponse, ShiftSlot, ShiftType, StaffMember, WorkSlot } from '../types';

/** 근무표에 표시하는 시간대 (Figma 기준) */
export const SHIFTS: ShiftType[] = ['오전', '오후', '마감'];


// ── 서버 응답 → 화면 타입 ───────────────────────────────────

/** 서버 시간대 값 → 화면 표시 */
export const SLOT_TO_SHIFT: Record<WorkSlot, ShiftType> = {
  MORNING: '오전',
  AFTERNOON: '오후',
  CLOSE: '마감',
};

type ScheduleShift = '오전' | '오후' | '마감';

/** 화면 시간대 → 서버 값 */
export const SHIFT_TO_SLOT: Record<ScheduleShift, WorkSlot> = {
  오전: 'MORNING',
  오후: 'AFTERNOON',
  마감: 'CLOSE',
};

/** 시간대별 근무 시간 — 서버에는 시각이 없어서 화면에서 고정값으로 사용 (Figma 기준) */
const SLOT_TIME: Record<WorkSlot, Pick<ShiftSlot, 'startTime' | 'endTime'>> = {
  MORNING: { startTime: '08:00', endTime: '14:00' },
  AFTERNOON: { startTime: '14:00', endTime: '20:00' },
  CLOSE: { startTime: '20:00', endTime: '23:00' },
};

export const SHIFT_TIME: Record<ScheduleShift, Pick<ShiftSlot, 'startTime' | 'endTime'>> = {
  오전: SLOT_TIME.MORNING,
  오후: SLOT_TIME.AFTERNOON,
  마감: SLOT_TIME.CLOSE,
};

/**
 * 서버는 "직원 1명 × 시간대 1개"가 한 줄 → 화면은 "날짜 + 시간대"별로 근무자를 묶어서 사용
 * 화면은 staffIds를 로그인 사용자 id와 비교하므로 memberId를 userId로 바꿔서 담음
 */
export const groupShifts = (shifts: ShiftResponse[], members: Member[]): ShiftSlot[] => {
  const userIdByMember = new Map(members.map((m) => [m.id, m.userId]));
  const groups = new Map<string, ShiftSlot>();

  for (const shift of shifts) {
    const key = `${shift.workDate}_${shift.slot}`;
    const userId = userIdByMember.get(shift.memberId) ?? shift.memberId;
    const group = groups.get(key) ?? {
      id: key,
      date: shift.workDate,
      shiftType: SLOT_TO_SHIFT[shift.slot],
      staffIds: [],
      staffNames: [],
      people: [],
      ...SLOT_TIME[shift.slot],
    };
    group.staffIds.push(userId);
    group.staffNames.push(shift.memberName);
    group.people?.push({
      shiftId: shift.id,
      memberId: shift.memberId,
      userId,
      name: shift.memberName,
    });
    groups.set(key, group);
  }

  const order = (type: ShiftType) => SHIFTS.indexOf(type);
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date) || order(a.shiftType) - order(b.shiftType));
};

/** 직원관리의 Member → 근무표의 StaffMember (id는 userId로 맞춤) */
export const toStaffMember = (member: Member): StaffMember => ({
  id: member.userId,
  name: member.name,
  email: member.email,
  role: member.role,
  shifts: [], // 근무 가능 시간대는 근무표 화면에서 쓰지 않음
  teamId: member.teamId,
  teamName: member.teamName,
  isActive: member.status === 'ACTIVE',
  joinedAt: '',
  departedAt: member.leftAt,
});

/** CSS 클래스용 영문 키 (shift-tone--morning 등) */
export const SHIFT_TONE: Record<ShiftType, string> = {
  오전: 'morning',
  오후: 'afternoon',
  마감: 'closing',
  풀타임: 'fulltime',
  홀: 'hall',
  주방: 'kitchen',
};

type BadgeVariant = ComponentProps<typeof Badge>['variant'];

export const ROLE_BADGE: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  OWNER: { label: 'Owner', variant: 'primary' },
  MANAGER: { label: 'Manager', variant: 'success' },
  STAFF: { label: 'Staff', variant: 'neutral' },
};

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** 지금 시각이 이 근무 시간 안인지 (현재 근무자 표시용) */
export const isOngoing = (slot: Pick<ShiftSlot, 'startTime' | 'endTime'>, now: Date = new Date()): boolean => {
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= toMinutes(slot.startTime) && current < toMinutes(slot.endTime);
};

/** 근무조 필터 적용: 선택한 근무조 소속 직원만 남김 (근무자가 없어진 시간대는 제외) */
export const filterSlotsByStaff = (slots: ShiftSlot[], allowedIds: Set<string> | null): ShiftSlot[] => {
  if (!allowedIds) return slots;
  return slots
    .map((slot) => {
      const keep = slot.staffIds.map((id, i) => [id, slot.staffNames[i]] as const).filter(([id]) => allowedIds.has(id));
      return {
        ...slot,
        staffIds: keep.map(([id]) => id),
        staffNames: keep.map(([, name]) => name),
        people: slot.people?.filter((person) => allowedIds.has(person.userId)),
      };
    })
    .filter((slot) => slot.staffIds.length > 0);
};
