// TODO: 공통 컴포넌트 위치(components/common) 확정 후 경로 교체
import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import type { Member } from '@/features/employees';

import type { ShiftPerson, ShiftSlot, StaffMember, WorkSlot } from '../types';
import { formatLongDate } from '../utils/calendar';
import { ROLE_BADGE, SHIFT_TIME, SHIFT_TONE, SHIFT_TO_SLOT, SHIFTS } from '../utils/shift';
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
  /** 재직 중인 멤버. 오너·매니저가 근무를 넣을 때 고른다. */
  members?: Member[];
  canAssign?: boolean;
  busy?: boolean;
  error?: string | null;
  onAssign?: (slot: WorkSlot, memberId: string) => void;
  onRemove?: (shiftId: string) => void;
  onClose: () => void;
}

const peopleOf = (slot: ShiftSlot): ShiftPerson[] =>
  slot.people ??
  slot.staffIds.map((id, index) => ({
    shiftId: '',
    memberId: '',
    userId: id,
    name: slot.staffNames[index] ?? '',
  }));

const blankSlot = (date: string, shiftType: (typeof SHIFTS)[number]): ShiftSlot => ({
  id: `${date}_${shiftType}`,
  date,
  shiftType,
  staffIds: [],
  staffNames: [],
  people: [],
  ...SHIFT_TIME[shiftType as '오전' | '오후' | '마감'],
});

// 선택한 날짜의 시간대별 근무자 (역할 · 근무조 포함)
export const DayDetailPanel = ({
  date,
  slots,
  userId,
  isToday,
  staffById,
  members = [],
  canAssign = false,
  busy = false,
  error,
  onAssign,
  onRemove,
  onClose,
}: Props) => {
  const [picked, setPicked] = useState<Partial<Record<'오전' | '오후' | '마감', string>>>({});
  const rows = canAssign
    ? SHIFTS.map((shift) => slots.find((slot) => slot.shiftType === shift) ?? blankSlot(date, shift))
    : SHIFTS.map((shift) => slots.find((slot) => slot.shiftType === shift)).filter((slot): slot is ShiftSlot => Boolean(slot));

  return (
    <Modal open title={formatLongDate(date)} onClose={onClose}>
      <div className="day-detail day-detail--modal" aria-label={`${formatLongDate(date)} 근무`}>
      {isToday && <span className="day-detail__today">오늘</span>}

      {error && (
        <p className="day-detail__error" role="alert">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="day-detail__empty">이 날은 근무 배정이 없어요.</p>
      ) : (
        <div className="day-detail__shifts">
          {rows.map((slot) => {
            const people = peopleOf(slot);
            const slotName = slot.shiftType;
            const editable = slotName === '오전' || slotName === '오후' || slotName === '마감';
            const taken = new Set(people.map((person) => person.memberId));
            const choices = members.filter((member) => !taken.has(member.id));
            const selected = editable ? (picked[slotName] ?? '') : '';
            return (
              <div key={slot.id} className="day-detail__shift">
                <div className="day-detail__shift-head">
                  <span className={`shift-badge shift-tone--${SHIFT_TONE[slot.shiftType]}`}>{slot.shiftType}</span>
                </div>

                {people.length === 0 ? (
                  <p className="day-detail__none">배정 없음</p>
                ) : (
                  <ul className="day-detail__people">
                    {people.map((person) => {
                      const isMe = person.userId === userId;
                      const member = staffById.get(person.userId);
                      const role = member ? ROLE_BADGE[member.role] : null;
                      return (
                        <li key={person.shiftId || person.userId} className={`day-detail__person${isMe ? ' day-detail__person--me' : ''}`}>
                          <StaffInitial name={person.name} isMe={isMe} size="md" className="day-detail__initial" />
                          <span className="day-detail__person-info">
                            <span className="day-detail__name">
                              {person.name}
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
                          {canAssign && person.shiftId && (
                            <button
                              type="button"
                              className="day-detail__remove"
                              disabled={busy}
                              onClick={() => onRemove?.(person.shiftId)}
                            >
                              빼기
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {canAssign && editable && (
                  <div className="day-detail__assign">
                    <Select
                      aria-label={`${slot.shiftType} 근무자`}
                      value={selected}
                      disabled={busy || choices.length === 0}
                      onChange={(event) => {
                        if (slotName === '오전' || slotName === '오후' || slotName === '마감') {
                          const value = event.target.value;
                          setPicked((current) => ({ ...current, [slotName]: value }));
                        }
                      }}
                    >
                      <option value="">{choices.length === 0 ? '넣을 직원이 없습니다' : '근무자 선택'}</option>
                      {choices.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      className="day-detail__add"
                      disabled={busy || selected === ''}
                      onClick={() => {
                        if (slotName !== '오전' && slotName !== '오후' && slotName !== '마감') return;
                        if (selected === '') return;
                        onAssign?.(SHIFT_TO_SLOT[slotName], selected);
                        setPicked((current) => ({ ...current, [slotName]: '' }));
                      }}
                    >
                      추가
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </Modal>
  );
};
