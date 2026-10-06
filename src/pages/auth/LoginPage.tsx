import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import logoSrc from '@/assets/logo.png';
import {
  DEMO_USERS,
  DemoAccountList,
  LoginForm,
  useLogin,
  readPendingInvite,
  type LoginResponse,
} from '@/features/auth';
import { PATHS } from '@/routes/paths';
import '../../css/LoginPage.css';

const STORE_TYPES = ['카페', '편의점', '스터디카페', '레스토랑'];

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = useCallback(
    ({ user }: LoginResponse) => {
      // PrivateRoute에서 넘겨준 원래 경로가 있으면 그쪽으로 복귀
      const from = (location.state as { from?: string } | null)?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      // 소속 매장이 없으면 매장 생성/합류부터
      // TODO: 로그인 상태 저장 위치 확정 후 state 전달 제거
      if (user.memberships.length === 0 || readPendingInvite())  {
        navigate(PATHS.STORE_SETUP, { replace: true, state: { userName: user.name } });
        return;
      }
      navigate(PATHS.DASHBOARD, { replace: true });
    },
    [location.state, navigate],
  );

  const { login, loginAsDemo, isPending, error, clearError } = useLogin({
    onSuccess: handleSuccess,
  });

  return (
    <div className="login">
      {/* 브랜드 패널 (1024px 이상) */}
      <aside className="login__brand">
        <div className="login__brand-logo">
          <img src={logoSrc} alt="PassOn" />
        </div>
        <h1 className="login__brand-title">
          퇴근 전 한마디,
          <br />
          출근해서 바로 확인.
        </h1>
        <p className="login__brand-lead">인수인계를 카드로 관리하는 가장 쉬운 방법.</p>
        <ul className="login__brand-tags">
          {STORE_TYPES.map((type) => (
            <li key={type} className="login__brand-tag">
              {type}
            </li>
          ))}
        </ul>
      </aside>

      {/* 폼 패널 */}
      <main className="login__panel">
        <div className="login__container">
          <img src={logoSrc} alt="PassOn" className="login__mobile-logo" />

          <Link to={PATHS.LANDING} className="login__back">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </Link>

          <h2 className="login__title">로그인</h2>
          <p className="login__desc">이메일과 비밀번호로 로그인하세요.</p>

          <LoginForm
            onSubmit={login}
            isPending={isPending}
            error={error}
            onChange={clearError}
          />

          <p className="login__signup">
            계정이 없으신가요?{' '}
            <Link to={PATHS.SIGNUP} className="login__signup-link">
              회원가입
            </Link>
          </p>

          <DemoAccountList
            users={DEMO_USERS}
            onSelect={(user) => loginAsDemo(user.id)}
            disabled={isPending}
          />
        </div>
      </main>
    </div>
  );
};
