import { useCallback, useEffect, useState } from 'react';

import { api } from '@/api/client';
import { getStores } from '@/api/stores';
import { getMe } from '@/api/users';

import type { MeResponse, PasswordForm, Store } from '../types';

// 마이페이지: 내 정보 · 소속 매장 로딩 + 이름 · 비밀번호 · 사진 변경
export const useProfile = () => {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [user, storeList] = await Promise.all([getMe(), getStores()]);
      setMe(user);
      setStores(storeList);
    } catch (e) {
      setError(e instanceof Error ? e.message : '내 정보를 불러오지 못했어요.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateName = useCallback(async (name: string) => {
    const user = await api<MeResponse>('/api/users/me', { method: 'PATCH', body: JSON.stringify({ name }) });
    setMe(user);
  }, []);

  const changePassword = useCallback(({ currentPassword, newPassword }: PasswordForm) => {
    return api<void>('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }, []);

  const uploadPhoto = useCallback(async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const user = await api<MeResponse>('/api/users/me/photo', { method: 'POST', body: form });
    setMe(user);
  }, []);

  return { me, stores, isLoading, error, reload: load, updateName, changePassword, uploadPhoto };
};
