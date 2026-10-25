import { useCallback, useMemo, useState } from 'react';

import type { HandoffItem } from '../types';

const STORAGE_KEY = 'passon:urgent-alert-dismissed';

const readDismissed = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
};

// 긴급 알림창: 아직 안 본 긴급 항목이 있을 때만 띄움
// "나중에"를 누르면 이번 접속(탭) 동안은 같은 항목으로 다시 띄우지 않음
export const useUrgentAlert = (urgent: HandoffItem[]) => {
  const [dismissed, setDismissed] = useState<string[]>(readDismissed);

  const unseen = useMemo(() => urgent.filter((i) => !dismissed.includes(i.id)), [urgent, dismissed]);

  const dismiss = useCallback(() => {
    const next = [...new Set([...dismissed, ...urgent.map((i) => i.id)])];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장이 막힌 브라우저에서는 화면 상태로만 기억
    }
  }, [dismissed, urgent]);

  return { isOpen: unseen.length > 0, items: unseen, dismiss };
};
