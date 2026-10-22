import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/api/client';

import type { ShiftResponse } from '../types';

// 기간(from~to) 근무만 불러온다. 멤버 목록은 근무표 화면에서 한 번만 받는다.
export const useSchedule = (storeId: string, from: string, to: string) => {
  const [shifts, setShifts] = useState<ShiftResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 달을 빠르게 넘길 때 늦게 도착한 이전 응답을 무시하기 위한 요청 번호
  const requestId = useRef(0);

  const load = useCallback(async (quiet = false) => {
    if (!storeId) {
      setShifts([]);
      setIsLoading(false);
      return;
    }
    const id = ++requestId.current;
    if (!quiet) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const rows = await api<ShiftResponse[]>(`/api/stores/${storeId}/shifts?${new URLSearchParams({ from, to })}`);
      if (id === requestId.current) setShifts(rows);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : '근무표를 불러오지 못했어요.');
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [storeId, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return { shifts, isLoading, error, reload: () => load(false), refresh: () => load(true) };
};