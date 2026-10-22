import { useEffect, useState } from 'react';

import { getStores } from '@/api/stores';
import { getMe } from '@/api/users';
import type { AppUser } from '@/features/auth';
import { pickStore } from '@/features/stores/currentStore';
import { useOptionalAppSession } from '@/layouts/appSession';
import type { Store, User } from '@/types/api';

interface CurrentUser {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
}

function toAppUser(me: User, stores: Store[], currentStoreId: string): AppUser {
  return {
    id: me.id,
    name: me.name,
    email: me.email,
    currentStoreId,
    memberships: stores.map((store) => ({
      storeId: store.id,
      storeName: store.name,
      role: store.myRole,
      shifts: [],
      isActive: true,
      joinedAt: store.createdAt,
    })),
  };
}

// 로그인 사용자와 지금 고른 매장. 앱 안에서는 레이아웃 값을 그대로 쓴다.
export const useCurrentUser = (): CurrentUser => {
  const session = useOptionalAppSession();
  const sessionUser = session?.user;
  const sessionStores = session?.stores;
  const sessionStoreId = session?.currentStore?.id;
  const [state, setState] = useState<CurrentUser>({ user: null, isLoading: true, error: null });

  useEffect(() => {
    if (sessionUser && sessionStores) {
      const currentStoreId = sessionStoreId ?? sessionStores[0]?.id ?? '';
      if (!currentStoreId) {
        setState({ user: null, isLoading: false, error: '소속된 매장이 없어요.' });
        return;
      }
      setState({ user: toAppUser(sessionUser, sessionStores, currentStoreId), isLoading: false, error: null });
      return;
    }

    let ignore = false;

    async function load() {
      try {
        const [me, stores] = await Promise.all([getMe(), getStores()]);
        if (ignore) return;
        const store = pickStore(stores);
        if (!store) {
          setState({ user: null, isLoading: false, error: '소속된 매장이 없어요.' });
          return;
        }
        setState({ user: toAppUser(me, stores, store.id), isLoading: false, error: null });
      } catch (error: unknown) {
        if (ignore) return;
        setState({
          user: null,
          isLoading: false,
          error: error instanceof Error ? error.message : '로그인 정보를 불러오지 못했어요.',
        });
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [sessionUser, sessionStores, sessionStoreId]);

  return state;
};
