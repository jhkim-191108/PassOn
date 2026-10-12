export const PATHS = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  STORE_SETUP: '/store/setup',
  INVITE_ACCEPT: '/invite/:token',
  DASHBOARD: '/app/dashboard',
  HANDOFF_NEW: '/app/handoffs/new',      // 추가
  HANDOFF_DETAIL: '/app/handoffs/:id',   // 추가
} as const;
