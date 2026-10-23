import { useEffect, useMemo, useState } from 'react';

import { api } from '@/api/client';
import type { Member, Team } from '@/features/employees';
import type { StaffDirectory, StaffMember } from '../types';
import { toStaffMember } from '../utils/shift';

// 직원 · 근무조 목록 (역할 배지 · 근무조 표시 · 근무조 필터용)
export const useStaffDirectory = (storeId: string) => {
  const [directory, setDirectory] = useState<StaffDirectory>({ staff: [], teams: [] });
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setDirectory({ staff: [], teams: [] });
      setMembers([]);
      setError(null);
      return;
    }
    let ignore = false;

    async function load() {
      try {
        setError(null);
        const [memberRows, teamRows] = await Promise.all([
          api<Member[]>(`/api/stores/${storeId}/members`),
          api<Team[]>(`/api/stores/${storeId}/teams`),
        ]);
        if (ignore) return;
        setMembers(memberRows.filter((member) => member.status === 'ACTIVE'));
        setDirectory({
          staff: memberRows.map(toStaffMember),
          // 서버 팀에는 색 · 생성일이 없음 (근무표 화면에서도 쓰지 않음)
          teams: teamRows.map((team) => ({ id: team.id, storeId, name: team.name, color: '', createdAt: '' })),
        });
      } catch (loadError: unknown) {
        if (ignore) return;
        setMembers([]);
        setDirectory({ staff: [], teams: [] });
        setError(loadError instanceof Error ? loadError.message : '직원 목록을 불러오지 못했습니다.');
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [storeId]);

  const staffById = useMemo(
    () => new Map<string, StaffMember>(directory.staff.map((s) => [s.id, s])),
    [directory.staff],
  );

  return { staff: directory.staff, teams: directory.teams, staffById, members, error };
};
