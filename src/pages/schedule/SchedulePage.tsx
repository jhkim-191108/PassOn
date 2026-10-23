import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ErrorState from '@/components/ui/ErrorState';
import { ApiError } from '@/api/client';
import { createShift, deleteShift } from '@/api/shifts';
import {
  DayDetailPanel,
  MonthCalendar,
  ScheduleHeader,
  TeamFilter,
  TodayShiftCards,
  addMonths,
  filterSlotsByStaff,
  getMonthCells,
  groupShifts,
  isoToDate,
  todayISO,
  useSchedule,
  useStaffDirectory,
  useStoreSession,
  type ShiftSlot,
  type WorkSlot,
  type YearMonth,
} from '@/features/schedule';
import { PATHS } from '@/routes/paths';
import { useAppSession } from '@/layouts/appSession';
import '../../css/SchedulePage.css';

export const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const session = useStoreSession();
  const { todayShifts, liveLoading, reloadTodayShifts } = useAppSession();
  const userId = session.user?.id ?? '';
  const storeId = session.store?.id ?? '';
  const storeName = session.store?.name ?? '';

  const today = todayISO();
  const [yearMonth, setYearMonth] = useState<YearMonth>(() => {
    const d = isoToDate(today);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  // 달력에 보이는 42칸(앞뒤 달 포함) 범위만 불러옴
  const cells = useMemo(() => getMonthCells(yearMonth), [yearMonth]);
  const from = cells[0].iso;
  const to = cells[cells.length - 1].iso;

  const month = useSchedule(storeId, from, to);
  const { staff, teams, staffById, members, error: staffError } = useStaffDirectory(storeId);
  const monthSlots = useMemo(() => groupShifts(month.shifts, members), [month.shifts, members]);
  const todaySlots = useMemo(() => groupShifts(todayShifts, members), [todayShifts, members]);
  const canAssign = session.store?.myRole === 'OWNER' || session.store?.myRole === 'MANAGER';
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // 근무조 필터 적용
  const visibleSlots = useMemo(() => {
    const allowed = teamId ? new Set(staff.filter((s) => s.teamId === teamId).map((s) => s.id)) : null;
    return filterSlotsByStaff(monthSlots, allowed);
  }, [monthSlots, staff, teamId]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, ShiftSlot[]>();
    for (const slot of visibleSlots) map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    return map;
  }, [visibleSlots]);

  const moveMonth = (delta: number) => {
    setYearMonth((ym) => addMonths(ym, delta));
    setSelectedDate(null);
    setAssignError(null);
  };

  // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 대시보드로
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(PATHS.DASHBOARD);
  };

  const refreshShifts = async () => {
    await Promise.all([month.refresh(), reloadTodayShifts()]);
  };

  const assignShift = async (slot: WorkSlot, memberId: string) => {
    if (!storeId || !selectedDate || assigning) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await createShift(storeId, { memberId, workDate: selectedDate, slot });
      await refreshShifts();
    } catch (error) {
      setAssignError(error instanceof ApiError ? error.message : '근무를 넣지 못했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  const removeShift = async (shiftId: string) => {
    if (!storeId || assigning) return;
    setAssigning(true);
    setAssignError(null);
    try {
      await deleteShift(storeId, shiftId);
      await refreshShifts();
    } catch (error) {
      setAssignError(error instanceof ApiError ? error.message : '근무를 빼지 못했습니다.');
    } finally {
      setAssigning(false);
    }
  };

  const daySlots = selectedDate ? monthSlots.filter((slot) => slot.date === selectedDate) : [];

  return (
    <div className="schedule">
      <ScheduleHeader storeName={storeName} onBack={handleBack} />

            {session.error && (
        <div className="schedule__error" role="alert">
          <p>{session.error}</p>
        </div>
      )}
      {staffError && (
        <div className="schedule__error" role="alert">
          <p>{staffError}</p>
        </div>
      )}

      <TodayShiftCards
        slots={todaySlots}
        userId={userId}
        isLoading={liveLoading}
      />

      <TeamFilter teams={teams} selectedTeamId={teamId} onChange={setTeamId} />

      {month.error && (
        <ErrorState title="근무표를 불러오지 못했습니다." description={month.error} onRetry={month.reload} />
      )}

      <MonthCalendar
        yearMonth={yearMonth}
        slotsByDate={slotsByDate}
        userId={userId}
        today={today}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          setAssignError(null);
          setSelectedDate(date);
        }}
        onPrevMonth={() => moveMonth(-1)}
        onNextMonth={() => moveMonth(1)}
        isLoading={month.isLoading}
      />

      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          slots={daySlots}
          userId={userId}
          isToday={selectedDate === today}
          staffById={staffById}
          members={members}
          canAssign={canAssign}
          busy={assigning}
          error={assignError}
          onAssign={assignShift}
          onRemove={removeShift}
          onClose={() => {
            setAssignError(null);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};
