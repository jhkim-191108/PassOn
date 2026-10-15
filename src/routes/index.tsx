import { createBrowserRouter, Navigate } from 'react-router-dom';

import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import EmployeesPage from '@/pages/employees/EmployeePage';
// import { PrivateRoute } from '@/routes/guards/PrivateRoute';
// import { PublicOnlyRoute } from '@/routes/guards/PublicOnlyRoute';
import { PATHS } from '@/routes/paths';

export const router = createBrowserRouter([
  // ── 인증 / 매장 진입 (공통 레이아웃 없음) ──────────
  {
    path: PATHS.LANDING,
    lazy: async () => {
      const { default: LandingPage } = await import('@/pages/auth/LandingPage');
      return { Component: LandingPage };
    },
  },

  // TODO: PublicOnlyRoute로 감싸기
  {
    path: PATHS.LOGIN,
    lazy: async () => {
      const { default: LoginPage } = await import('@/pages/auth/LoginPage');
      return { Component: LoginPage };
    },
  },
  {
    path: PATHS.SIGNUP,
    lazy: async () => {
      const { default: SignupPage } = await import('@/pages/auth/SignupPage');
      return { Component: SignupPage };
    },
  },
  {
    path: PATHS.INVITE_ACCEPT,
    lazy: async () => {
      const { InviteAcceptPage } = await import('@/pages/auth/InviteAcceptPage');
      return { Component: InviteAcceptPage };
    },
  },

  // TODO: PrivateRoute로 감싸기
  {
    path: PATHS.STORE_SETUP,
    lazy: async () => {
      const { StoreSetupPage } = await import('@/pages/auth/StoreSetupPage');
      return { Component: StoreSetupPage };
    },
  },

  // ── 로그인 후 공통 레이아웃 (공용 UI 팀원) ─────────
  // TODO: PrivateRoute로 감싸기
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'employees', element: <EmployeesPage /> },
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