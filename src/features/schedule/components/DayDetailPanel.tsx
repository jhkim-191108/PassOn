// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import Badge from '@/components/ui/Badge';

import type { ShiftSlot, StaffMember } from '../types';
import { formatLongDate } from '../utils/calendar';
import { ROLE_BADGE, SHIFT_TONE, SHIFTS, isOngoing } from '../utils/shift';
import { StaffInitial } from './StaffInitial';
import '../../../css/ScheduleCommon.css';
import '../../../css/DayDetailPanel.css';

interface Props {
  date: string;
  slots: ShiftSlot[];
  userId: string;
  isToday: boolean;
  /** 역할 · 근무조 표시용 직원 정보 */
  staffById: Map<string, StaffMember>;
  onClose: () => void;
  now?: Date;
}

// 선택한 날짜의 시간대별 근무자 (역할 · 근무조 포함)
export const DayDetailPanel = ({ date, slots, userId, isToday, staffById, onClose, now = new Date() }: Props) => {
  const ordered = SHIFTS.map((shift) => slots.find((s) => s.shiftType === shift)).filter(
    (s): s is ShiftSlot => Boolean(s),
  );

  return (
    <section className="day-detail" aria-label={`${formatLongDate(date)} 근무`}>
      <div className="day-detail__head">
        <div>
          <p className="day-detail__date">{formatLongDate(date)}</p>
          {isToday && <span className="day-detail__today">오늘</span>}
        </div>
        <button type="button" className="day-detail__close" onClick={onClose} aria-label="닫기">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="day-detail__empty">이 날은 근무 배정이 없어요.</p>
      ) : (
        <div className="day-detail__shifts">
          {ordered.map((slot) => {
            const live = isToday && isOngoing(slot, now);
            return (
              <div key={slot.id} className="day-detail__shift">
                <div className="day-detail__shift-head">
                  <span className={`shift-badge shift-tone--${SHIFT_TONE[slot.shiftType]}`}>{slot.shiftType}</span>
                  <span className="day-detail__time">
                    {slot.startTime} ~ {slot.endTime}
                  </span>
                  {live && <span className="day-detail__live">근무 중</span>}
                </div>

                <ul className="day-detail__people">
                  {slot.staffIds.map((id, i) => {
                    const name = slot.staffNames[i];
                    const isMe = id === userId;
                    const member = staffById.get(id);
                    const role = member ? ROLE_BADGE[member.role] : null;
                    return (
                      <li key={id} className={`day-detail__person${isMe ? ' day-detail__person--me' : ''}`}>
                        <StaffInitial name={name} isMe={isMe} size="md" className="day-detail__initial" />
                        <span className="day-detail__person-info">
                          <span className="day-detail__name">
                            {name}
                            {isMe && <span className="day-detail__me">나</span>}
                          </span>
                          {(role || member?.teamName) && (
                            <span className="day-detail__meta">
                              {role && (
                                <Badge variant={role.variant} size="sm">
                                  {role.label}
                                </Badge>
                              )}
                              {member?.teamName && <span className="day-detail__team">{member.teamName}</span>}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
