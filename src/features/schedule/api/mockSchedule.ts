import type { ShiftSlot } from '../types';

// Figma data.ts의 SCHEDULE (임시 데모 데이터)
// Figma에서는 2026-10-01을 "오늘"로 고정 → scheduleApi가 실제 오늘 날짜 기준으로 옮겨서 반환
export const MOCK_SCHEDULE_TODAY = '2026-10-01';

export const MOCK_SCHEDULE: ShiftSlot[] = [
  { id: 's1', date: '2026-09-28', shiftType: '오전', staffIds: ['u3'], staffNames: ['이지연'], startTime: '08:00', endTime: '14:00' },
  { id: 's2', date: '2026-09-28', shiftType: '오후', staffIds: ['u2', 'u5'], staffNames: ['박준호', '정하늘'], startTime: '14:00', endTime: '20:00' },
  { id: 's3', date: '2026-09-28', shiftType: '마감', staffIds: ['u4'], staffNames: ['최서준'], startTime: '20:00', endTime: '23:00' },
  { id: 's4', date: '2026-09-29', shiftType: '오전', staffIds: ['u3', 'u5'], staffNames: ['이지연', '정하늘'], startTime: '08:00', endTime: '14:00' },
  { id: 's5', date: '2026-09-29', shiftType: '오후', staffIds: ['u2'], staffNames: ['박준호'], startTime: '14:00', endTime: '20:00' },
  { id: 's6', date: '2026-09-29', shiftType: '마감', staffIds: ['u4'], staffNames: ['최서준'], startTime: '20:00', endTime: '23:00' },
  { id: 's7', date: '2026-09-30', shiftType: '오전', staffIds: ['u5'], staffNames: ['정하늘'], startTime: '08:00', endTime: '14:00' },
  { id: 's8', date: '2026-09-30', shiftType: '오후', staffIds: ['u3', 'u2'], staffNames: ['이지연', '박준호'], startTime: '14:00', endTime: '20:00' },
  { id: 's9', date: '2026-09-30', shiftType: '마감', staffIds: ['u4'], staffNames: ['최서준'], startTime: '20:00', endTime: '23:00' },
  { id: 's10', date: '2026-10-01', shiftType: '오전', staffIds: ['u3'], staffNames: ['이지연'], startTime: '08:00', endTime: '14:00' },
  { id: 's11', date: '2026-10-01', shiftType: '오후', staffIds: ['u5'], staffNames: ['정하늘'], startTime: '14:00', endTime: '20:00' },
  { id: 's12', date: '2026-10-01', shiftType: '마감', staffIds: ['u2', 'u4'], staffNames: ['박준호', '최서준'], startTime: '20:00', endTime: '23:00' },
  { id: 's13', date: '2026-10-02', shiftType: '오전', staffIds: ['u5', 'u3'], staffNames: ['정하늘', '이지연'], startTime: '08:00', endTime: '14:00' },
  { id: 's14', date: '2026-10-02', shiftType: '오후', staffIds: ['u4'], staffNames: ['최서준'], startTime: '14:00', endTime: '20:00' },
  { id: 's15', date: '2026-10-02', shiftType: '마감', staffIds: ['u2'], staffNames: ['박준호'], startTime: '20:00', endTime: '23:00' },
  { id: 's16', date: '2026-10-03', shiftType: '오전', staffIds: ['u3'], staffNames: ['이지연'], startTime: '08:00', endTime: '14:00' },
  { id: 's17', date: '2026-10-03', shiftType: '마감', staffIds: ['u4', 'u5'], staffNames: ['최서준', '정하늘'], startTime: '20:00', endTime: '23:00' },
  { id: 's18', date: '2026-10-04', shiftType: '오전', staffIds: ['u5'], staffNames: ['정하늘'], startTime: '08:00', endTime: '14:00' },
  { id: 's19', date: '2026-10-04', shiftType: '오후', staffIds: ['u3', 'u4'], staffNames: ['이지연', '최서준'], startTime: '14:00', endTime: '20:00' },
  { id: 's20', date: '2026-10-04', shiftType: '마감', staffIds: ['u2'], staffNames: ['박준호'], startTime: '20:00', endTime: '23:00' },
];
