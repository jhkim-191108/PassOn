import type { ShiftSlot } from '../types';
import { SHIFT_TONE, SHIFTS } from '../utils/shift';
import { StaffInitial } from './StaffInitial';
import '../../../css/ScheduleCommon.css';
import '../../../css/TodayShiftCards.css';

interface Props {
  /** 오늘 근무 시간대 목록 */
  slots: ShiftSlot[];
  userId: string;
  isLoading?: boolean;
}

// "오늘 내 근무" + "오늘 근무 현황(현재 근무자 포함)"
export const TodayShiftCards = ({ slots, userId, isLoading = false }: Props) => {
  const mySlots = slots.filter((s) => s.staffIds.includes(userId));
  const isWorking = mySlots.length > 0;

  return (
    <section className="today-shifts" aria-label="오늘 근무">
      {/* ── 오늘 내 근무 ─────────────────────────────── */}
      <div className={`today-shifts__mine${isWorking ? ' today-shifts__mine--working' : ''}`}>
        <p className="today-shifts__heading">오늘 내 근무</p>
        {isWorking ? (
          <div className="today-shifts__my-list">
            {mySlots.map((slot) => (
              <div key={slot.id} className={`today-shifts__my-slot shift-tone--${SHIFT_TONE[slot.shiftType]}`}>
                <p className="today-shifts__my-shift">
                  {slot.shiftType}
                </p>
                <p className="today-shifts__my-time">
                  {slot.startTime} ~ {slot.endTime}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="today-shifts__off">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>{isLoading ? '불러오는 중…' : '오늘 근무 없음'}</p>
          </div>
        )}
      </div>

      {/* ── 오늘 근무 현황 ───────────────────────────── */}
      <div className="today-shifts__status">
        <p className="today-shifts__heading">오늘 근무 현황</p>
        <ul className="today-shifts__rows">
          {SHIFTS.map((shift) => {
            const slot = slots.find((s) => s.shiftType === shift);
            return (
              <li key={shift} className="today-shifts__row">
                <span className={`shift-badge shift-tone--${SHIFT_TONE[shift]}`}>{shift}</span>
                <div className="today-shifts__people">
                  {slot && slot.staffNames.length > 0 ? (
                    slot.staffNames.map((name, i) => {
                      const isMe = slot.staffIds[i] === userId;
                      return (
                        <span key={slot.staffIds[i]} className={`today-shifts__person${isMe ? ' today-shifts__person--me' : ''}`}>
                          <StaffInitial name={name} isMe={isMe} size="sm" />
                          {name}
                        </span>
                      );
                    })
                  ) : (
                    <p className="today-shifts__empty">배정 없음</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
