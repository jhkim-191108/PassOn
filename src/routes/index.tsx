import { createBrowserRouter } from 'react-router-dom';

import { InviteAcceptPage } from '@/pages/auth/InviteAcceptPage';
import { LandingPage } from '@/pages/auth/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { StoreSetupPage } from '@/pages/auth/StoreSetupPage';
// import { PrivateRoute } from '@/routes/guards/PrivateRoute';
// import { PublicOnlyRoute } from '@/routes/guards/PublicOnlyRoute';
import { PATHS } from '@/routes/paths';

export const router = createBrowserRouter([
  { path: PATHS.LANDING, element: <LandingPage /> },

  // TODO: PublicOnlyRoute로 감싸기
  { path: PATHS.LOGIN, element: <LoginPage /> },
  { path: PATHS.SIGNUP, element: <SignupPage /> },

  { path: PATHS.INVITE_ACCEPT, element: <InviteAcceptPage /> },

  // TODO: PrivateRoute로 감싸기
  { path: PATHS.STORE_SETUP, element: <StoreSetupPage /> },
]);