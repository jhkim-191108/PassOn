import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/api/client';
import type { Member } from '@/features/employees';

import type { ShiftResponse, ShiftSlot } from '../types';
import { groupShifts } from '../utils/shift';

// 기간(from~to) 근무표 로딩 — 기간이 바뀌면 다시 불러옴
export const useSchedule = (storeId: string, from: string, to: string) => {
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 달을 빠르게 넘길 때 늦게 도착한 이전 응답을 무시하기 위한 요청 번호
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!storeId) return; // 매장 정보를 받기 전에는 요청하지 않음
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      // 근무표의 memberId를 로그인 사용자 id로 바꾸기 위해 멤버 목록도 같이 받음 (조회 기간은 최대 62일)
      const [shifts, members] = await Promise.all([
        api<ShiftResponse[]>(`/api/stores/${storeId}/shifts?${new URLSearchParams({ from, to })}`),
        api<Member[]>(`/api/stores/${storeId}/members`),
      ]);
      if (id === requestId.current) setSlots(groupShifts(shifts, members));
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : '근무표를 불러오지 못했어요.');
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [storeId, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return { slots, isLoading, error, reload: load };
};