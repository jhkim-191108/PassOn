import { useEffect, useState } from 'react';

import { getStores } from '@/api/stores';
import { getMe } from '@/api/users';
import { pickStore, useCurrentStoreId } from '@/features/stores/currentStore';
import type { Store, User } from '@/types/api';

interface StoreSession {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  error: string | null;
}

// 로그인 사용자와 현재 매장. 매장 설정에서 고른 매장을 따른다.
export const useStoreSession = (): StoreSession => {
  const [session, setSession] = useState<StoreSession>({ user: null, store: null, isLoading: true, error: null });
  const selectedId = useCurrentStoreId();

  useEffect(() => {
    let ignore = false;
    Promise.all([getMe(), getStores()])
      .then(([user, stores]) => {
        if (ignore) return;
        const store = pickStore(stores);
        setSession({ user, store, isLoading: false, error: store ? null : '소속된 매장이 없어요.' });
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
  }, [selectedId]);

  return session;
};