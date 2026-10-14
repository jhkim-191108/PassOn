import { createBrowserRouter, Navigate } from 'react-router-dom';

import { InviteAcceptPage } from '@/pages/auth/InviteAcceptPage';
import { LandingPage } from '@/pages/auth/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { StoreSetupPage } from '@/pages/auth/StoreSetupPage';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
// import { PrivateRoute } from '@/routes/guards/PrivateRoute';
// import { PublicOnlyRoute } from '@/routes/guards/PublicOnlyRoute';
import { PATHS } from '@/routes/paths';

export const router = createBrowserRouter([
  // ── 인증 / 매장 진입 (공통 레이아웃 없음) ──────────
  { path: PATHS.LANDING, element: <LandingPage /> },

  // TODO: PublicOnlyRoute로 감싸기
  { path: PATHS.LOGIN, element: <LoginPage /> },
  { path: PATHS.SIGNUP, element: <SignupPage /> },

  { path: PATHS.INVITE_ACCEPT, element: <InviteAcceptPage /> },

  // TODO: PrivateRoute로 감싸기
  { path: PATHS.STORE_SETUP, element: <StoreSetupPage /> },

  // ── 로그인 후 공통 레이아웃 (공용 UI 팀원) ─────────
  // TODO: PrivateRoute로 감싸기
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // 아직 페이지가 만들어지지 않은 메뉴
      {
        path: '*',
        element: (
          <section>
            <h2>준비중</h2>
          </section>
        ),
      },
    ],
  },
]);