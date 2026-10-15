import { useSearchParams } from 'react-router-dom';

import { DEMO_USERS, type AppUser } from '@/features/auth';

// TODO: 로그인 상태 저장 위치 확정 후 실제 로그인 사용자로 교체
// 지금은 테스트용으로 주소의 ?as=사용자ID 로 데모 계정을 고름 (기본: u1 오너)
//   /app/dashboard?as=u1 → 김민지 (OWNER)
//   /app/dashboard?as=u2 → 박준호 (MANAGER)
//   /app/dashboard?as=u3 → 이지연 (STAFF)
export const useCurrentUser = (): AppUser => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('as');
  return DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
};
