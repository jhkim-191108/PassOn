import type { GetScheduleRequest, ShiftSlot, StaffDirectory } from '../types';
import { addDays, diffDays, todayISO } from '../utils/calendar';
import { MOCK_SCHEDULE, MOCK_SCHEDULE_TODAY } from './mockSchedule';
import { MOCK_STAFF, MOCK_TEAMS } from './mockStaff';

// TODO(API 담당): 실제 API로 교체 — 함수 이름과 요청/응답 타입만 유지해주세요.
// 현재는 화면 확인용 임시 구현입니다. (데모 매장 store1만 데이터 있음)

const MOCK_DELAY_MS = 300;
const MOCK_STORE_ID = 'store1';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 데모 데이터의 "오늘"(2026-10-01)을 실제 오늘로 옮김 → 오늘 근무 / 현재 근무자 확인 가능
const shiftedSchedule = (): ShiftSlot[] => {
  const offset = diffDays(MOCK_SCHEDULE_TODAY, todayISO());
  return MOCK_SCHEDULE.map((slot) => ({ ...slot, date: addDays(slot.date, offset) }));
};

export const scheduleApi = {
  /** 기간 내 근무 시간대 목록 */
  async getSchedule({ storeId, from, to }: GetScheduleRequest): Promise<ShiftSlot[]> {
    await wait(MOCK_DELAY_MS);
    if (storeId !== MOCK_STORE_ID) return [];
    return shiftedSchedule().filter((slot) => slot.date >= from && slot.date <= to);
  },

  /** 매장 직원 · 근무조 (역할 · 근무조 표시용) */
  async getStaffDirectory(storeId: string): Promise<StaffDirectory> {
    await wait(MOCK_DELAY_MS);
    if (storeId !== MOCK_STORE_ID) return { staff: [], teams: [] };
    return { staff: MOCK_STAFF, teams: MOCK_TEAMS };
  },
};
