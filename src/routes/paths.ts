export const PATHS = {
  LANDING: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  STORE_SETUP: '/store/setup',
  INVITE_ACCEPT: '/invite/:token',
  JOIN: '/join/:code',
  DASHBOARD: '/app/dashboard',
  MYPAGE: '/app/mypage',
  STORE_SETTINGS: '/app/store',
  HANDOFF_NEW: '/app/handoffs/new',      // 추가
  HANDOFF_DETAIL: '/app/handoffs/:id',   // 추가
} as const;
