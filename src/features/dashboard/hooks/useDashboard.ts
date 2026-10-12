import { useCallback, useEffect, useMemo, useState } from 'react';

import type { AppUser } from '@/features/auth';

import { dashboardApi } from '../api/dashboardApi';
import type { HandoffItem, QuickAction } from '../types';
import { buildDashboardSummary } from '../utils/summary';

// 대시보드 데이터 로딩 + 역할별 집계 + 카드 빠른 처리
export const useDashboard = (user: AppUser) => {
  const [items, setItems] = useState<HandoffItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** 빠른 처리 요청 중인 카드 id */
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setItems(await dashboardApi.getHandoffs(user.currentStoreId));
    } catch (e) {
      setError(e instanceof Error ? e.message : '대시보드를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, [user.currentStoreId]);

  useEffect(() => {
    load();
  }, [load]);

  const runQuickAction = useCallback(
    async (id: string, action: QuickAction) => {
      setPendingIds((ids) => [...ids, id]);
      try {
        const updated = await dashboardApi.updateHandoff({ id, action, userId: user.id, userName: user.name });
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      } catch (e) {
        setError(e instanceof Error ? e.message : '처리하지 못했어요. 다시 시도해주세요.');
      } finally {
        setPendingIds((ids) => ids.filter((x) => x !== id));
      }
    },
    [user.id, user.name],
  );

  const summary = useMemo(() => buildDashboardSummary(items, user), [items, user]);

  return { summary, isLoading, error, reload: load, runQuickAction, pendingIds };
};
