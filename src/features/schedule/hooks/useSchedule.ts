import { useCallback, useEffect, useRef, useState } from 'react';

import { scheduleApi } from '../api/scheduleApi';
import type { ShiftSlot } from '../types';

// 기간(from~to) 근무표 로딩 — 기간이 바뀌면 다시 불러옴
export const useSchedule = (storeId: string, from: string, to: string) => {
  const [slots, setSlots] = useState<ShiftSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 달을 빠르게 넘길 때 늦게 도착한 이전 응답을 무시하기 위한 요청 번호
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await scheduleApi.getSchedule({ storeId, from, to });
      if (id === requestId.current) setSlots(data);
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
