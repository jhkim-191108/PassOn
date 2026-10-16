import { useEffect, useMemo, useState } from 'react';

import { scheduleApi } from '../api/scheduleApi';
import type { StaffDirectory, StaffMember } from '../types';

// 직원 · 근무조 목록 (역할 배지 · 근무조 표시 · 근무조 필터용)
export const useStaffDirectory = (storeId: string) => {
  const [directory, setDirectory] = useState<StaffDirectory>({ staff: [], teams: [] });

  useEffect(() => {
    let ignore = false;
    scheduleApi
      .getStaffDirectory(storeId)
      .then((data) => {
        if (!ignore) setDirectory(data);
      })
      .catch(() => {
        // 직원 정보가 없어도 근무표는 보여줄 수 있으므로 조용히 무시 (역할·근무조만 빠짐)
      });
    return () => {
      ignore = true;
    };
  }, [storeId]);

  const staffById = useMemo(
    () => new Map<string, StaffMember>(directory.staff.map((s) => [s.id, s])),
    [directory.staff],
  );

  return { staff: directory.staff, teams: directory.teams, staffById };
};
