import { useCallback, useState } from 'react';

import { storeApi } from '../api/storeApi';
import type {
  CreateStoreRequest,
  CreateStoreResponse,
  JoinStoreRequest,
  JoinStoreResponse,
} from '../types';

interface UseStoreSetupOptions {
  onCreated?: (response: CreateStoreResponse) => void;
  onJoined?: (response: JoinStoreResponse) => void;
}

// 매장 생성 · 초대코드 합류 요청 상태 관리
export const useStoreSetup = ({ onCreated, onJoined }: UseStoreSetupOptions = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(request: () => Promise<T>, onSuccess?: (res: T) => void) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await request();
      // TODO: 로그인 상태(현재 사용자 소속 매장)에 반영 — 상태 저장 위치 확정 후 연결
      onSuccess?.(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : '요청 처리 중 문제가 발생했어요.');
    } finally {
      setIsPending(false);
    }
  }, []);

  const createStore = useCallback(
    (values: CreateStoreRequest) => run(() => storeApi.createStore(values), onCreated),
    [run, onCreated],
  );

  const joinStore = useCallback(
    (values: JoinStoreRequest) => run(() => storeApi.joinStore(values), onJoined),
    [run, onJoined],
  );

  const clearError = useCallback(() => setError(null), []);

  return { createStore, joinStore, isPending, error, clearError };
};
