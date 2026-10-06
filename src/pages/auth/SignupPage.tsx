import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { SignupForm, useSignup, type SignupResponse } from '@/features/auth';
import { PATHS } from '@/routes/paths';
import '../../css/SignupPage.css';

export const SignupPage = () => {
  const navigate = useNavigate();

  // 가입 직후 소속 매장이 없으므로 매장 생성/합류로 이동
  // TODO: 로그인 상태 저장 위치 확정 후 state 전달 제거
  const handleSuccess = useCallback(
    ({ user }: SignupResponse) => {
      navigate(PATHS.STORE_SETUP, { replace: true, state: { userName: user.name } });
    },
    [navigate],
  );

  const { signup, isPending, error, clearError } = useSignup({ onSuccess: handleSuccess });

  return (
    <main className="signup">
      <div className="signup__container">
        <Link to={PATHS.LOGIN} className="signup__back">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          로그인으로
        </Link>

        <header className="signup__header">
          <h1 className="signup__title">계정 만들기</h1>
          <p className="signup__desc">
            이름, 이메일, 비밀번호만 입력하면 돼요. 매장 소속은 나중에 정해져요.
          </p>
        </header>

        <SignupForm onSubmit={signup} isPending={isPending} error={error} onChange={clearError} />
      </div>
    </main>
  );
};
