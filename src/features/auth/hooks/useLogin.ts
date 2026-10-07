import { useCallback, useState } from 'react';

import { authApi } from '../api/authApi';
import type { LoginRequest, LoginResponse } from '../types';

interface UseLoginOptions {
  onSuccess?: (response: LoginResponse) => void;
}

export const useLogin = ({ onSuccess }: UseLoginOptions = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (request: () => Promise<LoginResponse>) => {
      setIsPending(true);
      setError(null);
      try {
        const response = await request();
        // TODO: 로그인 상태 저장 위치(Context/스토어) 확정 후 여기서 저장 → 라우트 가드와 연결
        onSuccess?.(response);
      } catch (e) {
        setError(e instanceof Error ? e.message : '로그인 중 문제가 발생했어요.');
      } finally {
        setIsPending(false);
      }
    },
    [onSuccess],
  );

  const login = useCallback(
    (values: LoginRequest) => run(() => authApi.login(values)),
    [run],
  );

  const loginAsDemo = useCallback(
    (userId: string) => run(() => authApi.loginAsDemo(userId)),
    [run],
  );

  const clearError = useCallback(() => setError(null), []);

  return { login, loginAsDemo, isPending, error, clearError };
};
