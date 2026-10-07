import { useCallback, useState } from 'react';

import { authApi } from '../api/authApi';
import type { SignupRequest, SignupResponse } from '../types';

interface UseSignupOptions {
  onSuccess?: (response: SignupResponse) => void;
}

export const useSignup = ({ onSuccess }: UseSignupOptions = {}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(
    async (values: SignupRequest) => {
      setIsPending(true);
      setError(null);
      try {
        const response = await authApi.signup(values);
        // TODO: 로그인 상태 저장 위치(Context/스토어) 확정 후 여기서 저장 (가입 직후 자동 로그인)
        onSuccess?.(response);
      } catch (e) {
        setError(e instanceof Error ? e.message : '회원가입 중 문제가 발생했어요.');
      } finally {
        setIsPending(false);
      }
    },
    [onSuccess],
  );

  const clearError = useCallback(() => setError(null), []);

  return { signup, isPending, error, clearError };
};
