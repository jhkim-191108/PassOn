import { useEffect, useMemo, useState } from 'react';

import { api } from '@/api/client';
import type { Member, Team } from '@/features/employees';
import type { StaffDirectory, StaffMember } from '../types';
import { toStaffMember } from '../utils/shift';

// 직원 · 근무조 목록 (역할 배지 · 근무조 표시 · 근무조 필터용)
export const useStaffDirectory = (storeId: string) => {
  const [directory, setDirectory] = useState<StaffDirectory>({ staff: [], teams: [] });

  useEffect(() => {
    if (!storeId) return; // 매장 정보를 받기 전에는 요청하지 않음
    let ignore = false;
    Promise.all([api<Member[]>(`/api/stores/${storeId}/members`), api<Team[]>(`/api/stores/${storeId}/teams`)])
      .then(([members, teams]) => {
        if (ignore) return;
        setDirectory({
          staff: members.map(toStaffMember),
          // 서버 팀에는 색 · 생성일이 없음 (근무표 화면에서도 쓰지 않음)
          teams: teams.map((team) => ({ id: team.id, storeId, name: team.name, color: '', createdAt: '' })),
        });
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
