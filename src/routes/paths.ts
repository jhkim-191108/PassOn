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
  // 인수인계 작성 · 상세 (인수인계 담당 페이지의 실제 주소)
  HANDOFF_NEW: '/app/handovers/new',
  HANDOFF_DETAIL: '/app/handovers/:handoffId',
  NOTICE_DETAIL: '/app/notices/:noticeId',
} as const;
