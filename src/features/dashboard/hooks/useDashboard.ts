import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { api } from '@/api/client';
import type { AppUser } from '@/features/auth';
import type { Member } from '@/features/employees';

import type { CardResponse, HandoffItem, NoticeResponse, QuickAction } from '../types';
import { buildMemberMaps, cardToHandoff, noticeToHandoff } from '../utils/card';
import { buildDashboardSummary } from '../utils/summary';

/** 완료된 카드는 최근 며칠 것만 불러옴 (미완료 카드는 날짜와 상관없이 전부) */
const RECENT_DAYS = 7;

const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const QUICK_ACTION_PATH: Record<QuickAction, string> = {
  confirm: 'acknowledge', // 확인하기 → 처리중
  complete: 'complete', // 완료처리 → 완료
};

const EMPTY_SUMMARY_USER: AppUser = { id: '', name: '', email: '', currentStoreId: '', memberships: [] };

// 대시보드 데이터 로딩 + 역할별 집계 + 카드 빠른 처리
export const useDashboard = (user: AppUser | null) => {
  const storeId = user?.currentStoreId ?? '';
  const [items, setItems] = useState<HandoffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 빠른 처리 요청 중인 카드 id */
  const [pendingIds, setPendingIds] = useState<string[]>([]);
    // 빠른 처리 응답을 바꿀 때 담당자 이름 등을 다시 찾기 위해 보관
  const membersRef = useRef<Member[]>([]);

  const load = useCallback(async () => {
    if (!storeId) return; // 사용자 정보를 받기 전에는 요청하지 않음
    setIsLoading(true);
    setError(null);
    try {
            const [openCards, recentCards, members, notices] = await Promise.all([
        api<CardResponse[]>(`/api/stores/${storeId}/open-cards`),
        api<CardResponse[]>(`/api/stores/${storeId}/cards?${new URLSearchParams({ from: daysAgoISO(RECENT_DAYS) })}`),
        api<Member[]>(`/api/stores/${storeId}/members`),
        api<NoticeResponse[]>(`/api/stores/${storeId}/notices`),
      ]);
      membersRef.current = members;
      const maps = buildMemberMaps(members);
      // 두 목록에 같은 카드가 있을 수 있어서 id로 합침
      const cards = new Map([...recentCards, ...openCards].map((c) => [c.id, c]));
      setItems([
        ...Array.from(cards.values(), (c) => cardToHandoff(c, storeId, maps)),
        ...notices.map(noticeToHandoff),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '대시보드를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  const runQuickAction = useCallback(
    async (id: string, action: QuickAction) => {
      setPendingIds((ids) => [...ids, id]);
      try {
        const card = await api<CardResponse>(`/api/cards/${id}/${QUICK_ACTION_PATH[action]}`, { method: 'PATCH' });
        const updated = cardToHandoff(card, storeId, buildMemberMaps(membersRef.current));
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      } catch (e) {
        setError(e instanceof Error ? e.message : '처리하지 못했어요. 다시 시도해주세요.');
      } finally {
        setPendingIds((ids) => ids.filter((x) => x !== id));
      }
    },
    [storeId],
  );

  const summary = useMemo(() => buildDashboardSummary(items, user ?? EMPTY_SUMMARY_USER), [items, user]);
 

  return { summary, isLoading, error, reload: load, runQuickAction, pendingIds };
};
