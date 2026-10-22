import { useAppSession } from '@/layouts/appSession';
import type { Store, User } from '@/types/api';

interface StoreSession {
  user: User | null;
  store: Store | null;
  isLoading: boolean;
  error: string | null;
}

// 레이아웃이 이미 받아 둔 로그인 사용자와 현재 매장.
export const useStoreSession = (): StoreSession => {
  const { user, currentStore } = useAppSession();
  return {
    user,
    store: currentStore,
    isLoading: false,
    error: currentStore ? null : '소속된 매장이 없어요.',
  };
};
