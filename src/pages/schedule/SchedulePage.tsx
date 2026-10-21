import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ErrorState from '@/components/ui/ErrorState';

// TODO: 로그인 상태 저장 위치 확정 후 실제 로그인 사용자로 교체 (지금은 대시보드와 같은 ?as= 임시 사용자)
import { useCurrentUser } from '@/features/dashboard';
import {
  DayDetailPanel,
  MonthCalendar,
  ScheduleHeader,
  TeamFilter,
  TodayShiftCards,
  addMonths,
  filterSlotsByStaff,
  getMonthCells,
  isoToDate,
  todayISO,
  useSchedule,
  useStaffDirectory,
  type ShiftSlot,
  type YearMonth,
} from '@/features/schedule';
import { PATHS } from '@/routes/paths';
import '../../css/SchedulePage.css';

export const SchedulePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const storeId = user.currentStoreId;
  const storeName = user.memberships.find((m) => m.storeId === storeId)?.storeName ?? '';

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
  const todaySchedule = useSchedule(storeId, today, today);
  const { staff, teams, staffById } = useStaffDirectory(storeId);

  // 근무조 필터 적용
  const visibleSlots = useMemo(() => {
    const allowed = teamId ? new Set(staff.filter((s) => s.teamId === teamId).map((s) => s.id)) : null;
    return filterSlotsByStaff(month.slots, allowed);
  }, [month.slots, staff, teamId]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, ShiftSlot[]>();
    for (const slot of visibleSlots) map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    return map;
  }, [visibleSlots]);

  const moveMonth = (delta: number) => {
    setYearMonth((ym) => addMonths(ym, delta));
    setSelectedDate(null);
  };

  // 앱 안에서 들어왔으면 이전 화면으로, 주소로 바로 들어왔으면 대시보드로
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1);
    else navigate(PATHS.DASHBOARD);
  };

  return (
    <div className="schedule">
      <ScheduleHeader storeName={storeName} onBack={handleBack} />

      <TodayShiftCards slots={todaySchedule.slots} userId={user.id} isLoading={todaySchedule.isLoading} />

      <TeamFilter teams={teams} selectedTeamId={teamId} onChange={setTeamId} />

      {month.error && (
        <ErrorState title="근무표를 불러오지 못했습니다." description={month.error} onRetry={month.reload} />
      )}

      <MonthCalendar
        yearMonth={yearMonth}
        slotsByDate={slotsByDate}
        userId={user.id}
        today={today}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevMonth={() => moveMonth(-1)}
        onNextMonth={() => moveMonth(1)}
        isLoading={month.isLoading}
      />

      {selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          slots={slotsByDate.get(selectedDate) ?? []}
          userId={user.id}
          isToday={selectedDate === today}
          staffById={staffById}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
};
