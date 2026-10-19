import { useEffect, useState } from 'react';

import { getStores } from '@/api/stores';
import { getMe } from '@/api/users';
import type { Store, User } from '@/types/api';

interface StoreSession {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  error: string | null;
}

// 로그인 사용자 + 현재 매장 (근무표 화면용 임시)
// TODO: AuthContext가 생기면 그쪽의 사용자 · 현재 매장으로 교체 (매장 전환 기능 전까지는 첫 번째 매장 사용)
export const useStoreSession = (): StoreSession => {
  const [session, setSession] = useState<StoreSession>({ user: null, store: null, isLoading: true, error: null });

  useEffect(() => {
    let ignore = false;
    Promise.all([getMe(), getStores()])
      .then(([user, stores]) => {
        if (ignore) return;
        setSession({ user, store: stores[0] ?? null, isLoading: false, error: stores.length ? null : '소속된 매장이 없어요.' });
      })
      .catch((e) => {
        if (ignore) return;
        setSession({
          user: null,
          store: null,
          isLoading: false,
          error: e instanceof Error ? e.message : '로그인 정보를 불러오지 못했어요.',
        });
      });
    return () => {
      ignore = true;
    };
  }, []);

  return session;
};