export const PATHS = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  STORE_SETUP: '/store/setup',
  INVITE_ACCEPT: '/invite/:token',
  // TODO: 대시보드 담당 팀원과 경로 확정 (로그인 후 이동 위치)
  DASHBOARD: '/app/dashboard',
} as const;
