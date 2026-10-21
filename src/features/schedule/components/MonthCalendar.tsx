import type { ShiftSlot } from '../types';
import { WEEKDAYS, formatLongDate, getMonthCells, type YearMonth } from '../utils/calendar';
import { SHIFT_TONE, SHIFTS } from '../utils/shift';
import { StaffInitial } from './StaffInitial';
import '../../../css/ScheduleCommon.css';
import '../../../css/MonthCalendar.css';

interface Props {
  yearMonth: YearMonth;
  /** 날짜(YYYY-MM-DD)별 근무 시간대 */
  slotsByDate: Map<string, ShiftSlot[]>;
  userId: string;
  today: string;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isLoading?: boolean;
}

const weekdayClass = (weekday: number) =>
  weekday === 0 ? ' month-calendar--sun' : weekday === 6 ? ' month-calendar--sat' : '';

export const MonthCalendar = ({
  yearMonth,
  slotsByDate,
  userId,
  today,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  isLoading = false,
}: Props) => {
  const cells = getMonthCells(yearMonth);

  return (
    <section className="month-calendar" aria-label={`${yearMonth.year}년 ${yearMonth.month}월 근무표`}>
      {/* ── 월 이동 ──────────────────────────────────── */}
      <div className="month-calendar__nav">
        <button type="button" className="month-calendar__nav-btn" onClick={onPrevMonth} aria-label="이전 달">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="month-calendar__title" aria-live="polite">
          {yearMonth.year}년 {yearMonth.month}월
        </p>
        <button type="button" className="month-calendar__nav-btn" onClick={onNextMonth} aria-label="다음 달">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── 요일 ─────────────────────────────────────── */}
      <div className="month-calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={`month-calendar__weekday${weekdayClass(i)}`}>
            {w}
          </div>
        ))}
      </div>

      {/* ── 날짜 칸 ──────────────────────────────────── */}
      <div className={`month-calendar__grid${isLoading ? ' month-calendar__grid--loading' : ''}`} aria-busy={isLoading}>
        {cells.map((cell) => {
          // 오전 → 오후 → 마감 순서로 표시
          const slots = [...(slotsByDate.get(cell.iso) ?? [])].sort(
            (a, b) => SHIFTS.indexOf(a.shiftType) - SHIFTS.indexOf(b.shiftType),
          );
          const isToday = cell.iso === today;
          const isSelected = cell.iso === selectedDate;
          const mine = slots.some((s) => s.staffIds.includes(userId));

          const className = [
            'month-calendar__cell',
            !cell.current && 'month-calendar__cell--outside',
            isToday && 'month-calendar__cell--today',
            isSelected && 'month-calendar__cell--selected',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={cell.iso}
              type="button"
              className={className}
              onClick={() => onSelectDate(isSelected ? null : cell.iso)}
              aria-pressed={isSelected}
              aria-label={`${formatLongDate(cell.iso)}${isToday ? ' (오늘)' : ''}, 근무 ${slots.length}개${mine ? ', 내 근무 있음' : ''}`}
            >
              <span className={`month-calendar__day${weekdayClass(cell.weekday)}`}>{cell.day}</span>

              <span className="month-calendar__slots">
                {slots.map((slot) => {
                  const isMine = slot.staffIds.includes(userId);
                  return (
                    <span
                      key={slot.id}
                      className={`month-calendar__slot shift-tone--${SHIFT_TONE[slot.shiftType]}${isMine ? ' month-calendar__slot--mine' : ''}`}
                    >
                      <span className="month-calendar__slot-head">
                        <span className="shift-dot" />
                        {slot.shiftType}
                      </span>
                      <span className="month-calendar__slot-staff">
                        {slot.staffNames.map((name, i) => (
                          <StaffInitial
                            key={slot.staffIds[i]}
                            name={name}
                            isMe={slot.staffIds[i] === userId}
                            size="xs"
                            className="month-calendar__initial"
                          />
                        ))}
                      </span>
                    </span>
                  );
                })}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 범례 ─────────────────────────────────────── */}
      <div className="month-calendar__legend">
        {SHIFTS.map((s) => (
          <span key={s} className={`month-calendar__legend-item shift-tone--${SHIFT_TONE[s]}`}>
            <span className="shift-dot month-calendar__legend-dot" />
            {s}
          </span>
        ))}
        <span className="month-calendar__legend-item month-calendar__legend-me">
          <span className="staff-initial staff-initial--xs staff-initial--me">나</span>내 근무
        </span>
      </div>
    </section>
  );
};
