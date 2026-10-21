import { useEffect, useState } from 'react';

import { getStores } from '@/api/stores';
import { getMe } from '@/api/users';
import type { AppUser } from '@/features/auth';

interface CurrentUser {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
}

// 로그인 사용자  소속 매장(역할은 매장의 myRole)
// TODO: AuthContext가 생기면 그쪽의 사용자 · 현재 매장으로 교체 (매장 전환 기능 전까지는 첫 번째 매장 사용)
export const useCurrentUser = (): CurrentUser => {
  const [state, setState] = useState<CurrentUser>({ user: null, isLoading: true, error: null });

  useEffect(() => {
    let ignore = false;
    Promise.all([getMe(), getStores()])
      .then(([me, stores]) => {
        if (ignore) return;
        if (stores.length === 0) {
          setState({ user: null, isLoading: false, error: '소속된 매장이 없어요.' });
          return;
        }
        setState({
          user: {
            id: me.id,
            name: me.name,
            email: me.email,
            currentStoreId: stores[0].id,
            memberships: stores.map((s) => ({
              storeId: s.id,
              storeName: s.name,
              role: s.myRole,
              shifts: [],
              isActive: true,
              joinedAt: s.createdAt,
            })),
          },
          isLoading: false,
          error: null,
        });
      })
      .catch((e) => {
        if (ignore) return;
        setState({ user: null, isLoading: false, error: e instanceof Error ? e.message : '로그인 정보를 불러오지 못했어요.' });
      });
    return () => {
      ignore = true;
    };
  }, []);

  return state;
 };