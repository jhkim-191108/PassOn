import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/api/client';

import type { CardResponse, Member, RecordItem, RecordPeriod, TrashItemResponse } from '../types';
import { buildNameMap, cardToRecord, filterTrash, getPeriodRange, trashToRecord } from '../utils/record';

// 검색어를 칠 때마다 요청하지 않도록 잠깐 기다렸다가 반영
const useDebouncedValue = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// 기록 조회 — 카드 목록(기간·검색은 서버) + 삭제된 항목 포함 시 휴지통(기간·검색은 화면에서)
export const useRecords = (storeId: string, period: RecordPeriod, query: string, includeDeleted: boolean) => {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const q = useDebouncedValue(query.trim());
  // 조건을 빠르게 바꿀 때 늦게 도착한 이전 응답을 무시하기 위한 요청 번호
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!storeId) return; // 매장 정보를 받기 전에는 요청하지 않음
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const range = getPeriodRange(period);
      const params = new URLSearchParams();
      if (range.from) params.set('from', range.from);
      if (range.to) params.set('to', range.to);
      if (q) params.set('q', q);

      // 카드에는 처리한 사람 id만 있어서 이름을 찾으려고 멤버 목록도 같이 받음
      const [cards, members, trash] = await Promise.all([
        api<CardResponse[]>(`/api/stores/${storeId}/cards?${params}`),
        api<Member[]>(`/api/stores/${storeId}/members`),
        includeDeleted ? api<TrashItemResponse[]>(`/api/stores/${storeId}/trash`) : Promise.resolve([]),
      ]);
      if (id !== requestId.current) return;

      const nameMap = buildNameMap(members);
      const records = [
        ...cards.map((card) => cardToRecord(card, nameMap)),
        ...filterTrash(trash, range, q).map(trashToRecord),
      ];
      // 서버는 완료된 카드를 뒤로 보내므로 화면에서는 최신순으로 다시 정렬
      records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setItems(records);
    } catch (e) {
      if (id === requestId.current) setError(e instanceof Error ? e.message : '기록을 불러오지 못했어요.');
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [storeId, period, q, includeDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, reload: load };
};