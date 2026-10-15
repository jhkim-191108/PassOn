import type { ComponentProps } from 'react';

// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import type Badge from '@/features/auth/components/common/Badge';
import type { UserRole } from '@/features/auth';

import type { ShiftSlot, ShiftType } from '../types';

/** 근무표에 표시하는 시간대 (Figma 기준) */
export const SHIFTS: ShiftType[] = ['오전', '오후', '마감'];

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
      return { ...slot, staffIds: keep.map(([id]) => id), staffNames: keep.map(([, name]) => name) };
    })
    .filter((slot) => slot.staffIds.length > 0);
};
